import { prisma } from "@/lib/prisma"
import {
  getIyzicoPaymentDetails,
  summarizeRefundFromReporting,
} from "@/lib/iyzico-reporting"

export async function syncOrderRefundFromIyzico(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    throw new Error("Sipariş bulunamadı")
  }

  if (!order.paymentId && !order.paymentConversationId) {
    return order
  }

  const { payment } = await getIyzicoPaymentDetails({
    paymentId: order.paymentId,
    paymentConversationId: order.paymentConversationId,
  })

  const summary = summarizeRefundFromReporting(payment)

  if (!summary.isTotallyRefunded && !summary.isPartiallyRefunded) {
    return order
  }

  return await prisma.$transaction(async (tx) => {
    const freshOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!freshOrder) {
      throw new Error("Sipariş bulunamadı")
    }

    const refundAmount = Math.round(summary.totalRefunded)

    if (summary.isTotallyRefunded) {
      if (!freshOrder.stockRestored) {
        for (const item of freshOrder.items) {
          const variant = await tx.productVariant.findFirst({
            where: {
              productId: item.productId,
              size: item.size || undefined,
            },
            select: {
              id: true,
            },
          })

          if (!variant) {
            throw new Error(`${item.productName} için varyant bulunamadı`)
          }

          await tx.productVariant.update({
            where: { id: variant.id },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        }
      }

      return await tx.order.update({
        where: { id: freshOrder.id },
        data: {
          status: "REFUNDED",
          refundedAt: freshOrder.refundedAt || new Date(),
          refundAmount: refundAmount || freshOrder.totalPrice,
          stockRestored: true,
        },
        include: { items: true },
      })
    }

    return await tx.order.update({
      where: { id: freshOrder.id },
      data: {
        refundAmount,
      },
      include: { items: true },
    })
  })
}