import { prisma } from "@/lib/prisma"
import {
  formatIyzicoPrice,
  refundPayment,
  refundPaymentV2,
  retrieveCheckoutForm,
  type IyzicoCheckoutFormResult,
} from "@/lib/iyzico"
import { isPaidStatus, restoreStockOnce } from "@/lib/order-stock"

type RefundOutcome =
  | { ok: true; order: Awaited<ReturnType<typeof loadOrder>> }
  | { ok: false; error: string; httpStatus: number }

function loadOrder(orderId: number) {
  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
}

function toAmount(value: unknown) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

/**
 * Ödenmiş bir siparişin tamamını iyzico üzerinden iade eder, stoğu tam bir kez geri yükler
 * ve siparişi `targetStatus` (REFUNDED / CANCELLED) durumuna geçirir.
 *
 * Önce ödeme bazlı Refund V2 (/v2/payment/refund, paymentId + tutar) denenir; başarısız
 * olursa ve daha önce hiç iade yapılmamışsa ürün bazlı (paymentTransactionId) iadeye düşülür.
 */
export async function refundOrderFully(params: {
  orderId: number
  ip: string
  targetStatus: "REFUNDED" | "CANCELLED"
}): Promise<RefundOutcome> {
  const order = await loadOrder(params.orderId)

  if (!order) {
    return { ok: false, error: "Sipariş bulunamadı", httpStatus: 404 }
  }

  if (!isPaidStatus(order.status)) {
    return { ok: false, error: "Bu sipariş durumu için iade yapılamaz", httpStatus: 400 }
  }

  let checkout: IyzicoCheckoutFormResult | null = null
  if (order.paymentToken) {
    try {
      checkout = await retrieveCheckoutForm({
        locale: "tr",
        conversationId: order.paymentConversationId || undefined,
        token: order.paymentToken,
      })
    } catch (error) {
      console.error("İade öncesi ödeme sorgusu başarısız:", error)
    }
  }

  const paymentId =
    order.paymentId || (checkout?.paymentId ? String(checkout.paymentId) : null)

  if (!paymentId && !order.paymentTransactionId) {
    return { ok: false, error: "İade için iyzico ödeme bilgisi bulunamadı", httpStatus: 400 }
  }

  // Müşterinin gerçekte ödediği tutar (taksit vade farkı dahil olabilir)
  const paidPrice =
    checkout?.status === "success" && toAmount(checkout.paidPrice) > 0
      ? toAmount(checkout.paidPrice)
      : order.totalPrice
  const alreadyRefunded = order.refundAmount ?? 0
  const remaining = Math.round((paidPrice - alreadyRefunded) * 100) / 100
  const ip = params.ip && params.ip !== "unknown" ? params.ip : "127.0.0.1"

  if (remaining > 0) {
    let refunded = false
    let lastError = "İade başarısız"

    if (paymentId) {
      try {
        const result = await refundPaymentV2({
          locale: "tr",
          conversationId: `refund_${order.orderNumber}_${Date.now()}`,
          paymentId,
          price: formatIyzicoPrice(remaining),
          currency: "TRY",
          ip,
        })

        if (result.status === "success") {
          refunded = true
        } else {
          lastError = result.errorMessage || lastError
          console.error("iyzico Refund V2 başarısız:", {
            orderNumber: order.orderNumber,
            errorCode: result.errorCode,
            errorMessage: result.errorMessage,
          })
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError
        console.error("iyzico Refund V2 hatası:", error)
      }
    }

    // Yedek: ürün bazlı iade (yalnızca daha önce hiç iade yapılmamışsa, çift iadeyi önlemek için)
    if (!refunded && alreadyRefunded === 0) {
      const items = (checkout?.itemTransactions || [])
        .map((tx) => ({
          id: tx.paymentTransactionId ? String(tx.paymentTransactionId) : "",
          amount: toAmount(tx.paidPrice),
        }))
        .filter((tx) => tx.id && tx.amount > 0)

      if (items.length > 0) {
        let refundedSum = 0
        let failed = false

        for (const tx of items) {
          try {
            const result = await refundPayment({
              locale: "tr",
              conversationId: `refund_${order.orderNumber}_${tx.id}`,
              paymentTransactionId: tx.id,
              price: formatIyzicoPrice(tx.amount),
              currency: "TRY",
              ip,
            })

            if (result.status === "success") {
              refundedSum += tx.amount
            } else {
              failed = true
              lastError = result.errorMessage || lastError
            }
          } catch (error) {
            failed = true
            lastError = error instanceof Error ? error.message : lastError
          }
        }

        if (!failed) {
          refunded = true
        } else if (refundedSum > 0) {
          await prisma.order.update({
            where: { id: order.id },
            data: { refundAmount: Math.round(refundedSum) },
          })
          return {
            ok: false,
            error: `İade kısmen yapıldı (${refundedSum} TL). Kalan tutar için iyzico panelini kontrol edin: ${lastError}`,
            httpStatus: 502,
          }
        }
      }
    }

    if (!refunded) {
      return { ok: false, error: lastError, httpStatus: 400 }
    }
  }

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: { in: ["PAID", "APPROVED", "SHIPPED", "DELIVERED"] } },
      data: {
        status: params.targetStatus,
        refundedAt: order.refundedAt || new Date(),
        refundAmount: Math.round(paidPrice),
        paymentId: paymentId || order.paymentId,
      },
    })

    if (claimed.count === 1) {
      await restoreStockOnce(tx, order.id, order.items)
    }
  })

  return { ok: true, order: await loadOrder(order.id) }
}
