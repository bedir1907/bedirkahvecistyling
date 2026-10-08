import { prisma } from "@/lib/prisma"
import {
  getIyzicoPaymentDetails,
  summarizeRefundFromReporting,
} from "@/lib/iyzico-reporting"
import { isPaidStatus, restoreStockOnce } from "@/lib/order-stock"

/**
 * iyzico panelinden yapılan iadeleri siparişe yansıtır.
 * Yalnızca ödenmiş (stoğu düşülmüş) siparişler için çalışır; stok tam bir kez geri yüklenir.
 */
export async function syncOrderRefundFromIyzico(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    throw new Error("Sipariş bulunamadı")
  }

  if (!isPaidStatus(order.status)) {
    return order
  }

  if (!order.paymentId && !order.paymentConversationId) {
    return order
  }

  const { payment } = await getIyzicoPaymentDetails({
    paymentId: order.paymentId,
    paymentConversationId: order.paymentId ? null : order.paymentConversationId,
  })

  const summary = summarizeRefundFromReporting(payment)

  if (!summary.isTotallyRefunded && !summary.isPartiallyRefunded) {
    return order
  }

  const refundAmount = Math.round(summary.totalRefunded)

  if (summary.isTotallyRefunded) {
    return await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: { in: ["PAID", "APPROVED", "SHIPPED", "DELIVERED"] } },
        data: {
          status: "REFUNDED",
          refundedAt: order.refundedAt || new Date(),
          refundAmount: refundAmount || order.totalPrice,
        },
      })

      if (claimed.count === 1) {
        await restoreStockOnce(tx, orderId, order.items)
      }

      return await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      })
    })
  }

  if (refundAmount === (order.refundAmount ?? 0)) {
    return order
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: { refundAmount },
    include: { items: true },
  })
}
