import { prisma } from "@/lib/prisma"
import { retrieveCheckoutForm, type IyzicoCheckoutFormResult } from "@/lib/iyzico"
import { decrementStockForItems, isPaidStatus } from "@/lib/order-stock"
import { sendOrderEmail } from "@/lib/customer-email"

type VerifyOrderPaymentInput = {
  orderNumber?: string
  token?: string
}

export type VerifyState =
  | "PAID"
  | "FAILED"
  | "PENDING"
  | "REVIEW"
  | "MISMATCH"
  | "NOT_FOUND"
  | "NO_TOKEN"
  | "CANCELLED"
  | "REFUNDED"

export type VerifyResult = {
  ok: boolean
  state: VerifyState
  orderNumber?: string
  orderId?: number
  message: string
  justPaidNow: boolean
}

/**
 * `status === "success"` yalnızca API çağrısının başarılı olduğunu söyler; ödemenin
 * başarılı olduğunu göstermez. Ödeme için mutlaka paymentStatus === "SUCCESS" gerekir.
 */
function isPaymentSuccess(result: IyzicoCheckoutFormResult) {
  return result?.status === "success" && result?.paymentStatus === "SUCCESS"
}

function isPaymentFailure(result: IyzicoCheckoutFormResult) {
  return result?.status === "success" && result?.paymentStatus === "FAILURE"
}

type OrderForCheck = {
  orderNumber: string
  totalPrice: number
  paymentToken: string | null
  paymentConversationId: string | null
}

/** iyzico'dan dönen ödeme kaydının bu siparişe ait olduğunu ve tutarın doğru olduğunu kontrol eder. */
function findMismatch(order: OrderForCheck, result: IyzicoCheckoutFormResult) {
  if (result.token && order.paymentToken && result.token !== order.paymentToken) {
    return "token uyuşmuyor"
  }

  if (result.basketId && result.basketId !== order.orderNumber) {
    return `basketId uyuşmuyor (${result.basketId})`
  }

  if (
    result.conversationId &&
    order.paymentConversationId &&
    result.conversationId !== order.paymentConversationId
  ) {
    return "conversationId uyuşmuyor"
  }

  if (result.currency && result.currency !== "TRY") {
    return `para birimi uyuşmuyor (${result.currency})`
  }

  // paidPrice taksit vade farkı nedeniyle sipariş tutarından büyük olabilir, küçük olamaz.
  const paidPrice = Number(result.paidPrice)
  if (!Number.isFinite(paidPrice) || paidPrice + 0.01 < order.totalPrice) {
    return `ödenen tutar (${result.paidPrice}) sipariş tutarından (${order.totalPrice}) düşük`
  }

  return null
}

async function finalizePaidOrder(orderId: number, result: IyzicoCheckoutFormResult) {
  return await prisma.$transaction(async (tx) => {
    // Atomik claim: PENDING/FAILED → PAID. Aynı anda gelen callback/webhook/verify
    // isteklerinden yalnızca biri count=1 alır; stok yalnızca bir kez düşülür.
    // FAILED dahil: iyzico ödemenin başarılı olduğunu söylüyorsa para çekilmiştir.
    const claimed = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING", "FAILED"] } },
      data: { status: "PAID" },
    })

    const freshOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!freshOrder) {
      throw new Error("Sipariş bulunamadı")
    }

    if (claimed.count === 0) {
      return { order: freshOrder, justPaidNow: false }
    }

    const shortages = await decrementStockForItems(tx, freshOrder.items)

    if (shortages.length > 0) {
      console.error(
        `[iyzico] ${freshOrder.orderNumber} ödendi ancak stok yetersiz — manuel kontrol gerekli:`,
        shortages
      )
    }

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paidAt: freshOrder.paidAt || new Date(),
        paymentId: result?.paymentId ? String(result.paymentId) : freshOrder.paymentId,
        paymentTransactionId: result?.itemTransactions?.[0]?.paymentTransactionId
          ? String(result.itemTransactions[0].paymentTransactionId)
          : freshOrder.paymentTransactionId,
      },
      include: { items: true },
    })

    return { order: updatedOrder, justPaidNow: true }
  })
}

async function markFailedIfPending(orderId: number) {
  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "FAILED" },
  })
}

export async function verifyOrderPayment(input: VerifyOrderPaymentInput): Promise<VerifyResult> {
  const orderNumber = input.orderNumber?.trim()
  const token = input.token?.trim()

  if (!orderNumber && !token) {
    return { ok: false, state: "NOT_FOUND", message: "Sipariş bulunamadı", justPaidNow: false }
  }

  const order = await prisma.order.findFirst({
    where: orderNumber ? { orderNumber } : { paymentToken: token },
  })

  if (!order) {
    return { ok: false, state: "NOT_FOUND", message: "Sipariş bulunamadı", justPaidNow: false }
  }

  const base = { orderNumber: order.orderNumber, orderId: order.id }

  if (!order.paymentToken) {
    return { ok: false, state: "NO_TOKEN", ...base, message: "Sipariş için ödeme tokenı bulunamadı", justPaidNow: false }
  }

  if (isPaidStatus(order.status)) {
    return { ok: true, state: "PAID", ...base, message: "Sipariş zaten ödenmiş", justPaidNow: false }
  }

  if (order.status === "CANCELLED") {
    return { ok: false, state: "CANCELLED", ...base, message: "Sipariş iptal edilmiş", justPaidNow: false }
  }

  if (order.status === "REFUNDED") {
    return { ok: false, state: "REFUNDED", ...base, message: "Sipariş iade edilmiş", justPaidNow: false }
  }

  // Ödeme sonucu her zaman iyzico'dan token ile tekrar sorgulanır; POST body'ye güvenilmez.
  const result = await retrieveCheckoutForm({
    locale: "tr",
    conversationId: order.paymentConversationId || undefined,
    token: order.paymentToken,
  })

  if (isPaymentSuccess(result)) {
    const mismatch = findMismatch(order, result)

    if (mismatch) {
      console.error(`[iyzico] ${order.orderNumber} ödeme doğrulama uyuşmazlığı: ${mismatch}`)
      return {
        ok: false,
        state: "MISMATCH",
        ...base,
        message: "Ödeme bilgileri siparişle uyuşmuyor. Lütfen bizimle iletişime geçin.",
        justPaidNow: false,
      }
    }

    // fraudStatus: 1 = onaylı, 0 = incelemede, -1 = reddedildi
    if (result.fraudStatus === 0) {
      return {
        ok: false,
        state: "REVIEW",
        ...base,
        message: "Ödemeniz güvenlik incelemesinde. Onaylandığında siparişiniz işleme alınacak.",
        justPaidNow: false,
      }
    }

    if (result.fraudStatus === -1) {
      await markFailedIfPending(order.id)
      return { ok: false, state: "FAILED", ...base, message: "Ödeme onaylanmadı", justPaidNow: false }
    }

    const finalized = await finalizePaidOrder(order.id, result)

    if (!isPaidStatus(finalized.order.status)) {
      // Bu arada iptal/iade edilmiş (terminal durum) – tekrar işlenmez.
      console.error(
        `[iyzico] ${order.orderNumber} iyzico'da başarılı ama sipariş durumu ${finalized.order.status}`
      )
      return {
        ok: false,
        state: finalized.order.status === "REFUNDED" ? "REFUNDED" : "CANCELLED",
        ...base,
        message: "Sipariş iptal/iade edilmiş",
        justPaidNow: false,
      }
    }

    if (finalized.justPaidNow) {
      try {
        await sendOrderEmail({
          to: finalized.order.email,
          name: finalized.order.name,
          orderNumber: finalized.order.orderNumber,
          total: finalized.order.totalPrice,
          items: finalized.order.items,
        })
      } catch (mailError) {
        console.error("Sipariş maili gönderilemedi:", mailError)
      }
    }

    return {
      ok: true,
      state: "PAID",
      ...base,
      message: finalized.justPaidNow ? "Ödeme doğrulandı" : "Sipariş zaten ödenmiş",
      justPaidNow: finalized.justPaidNow,
    }
  }

  if (isPaymentFailure(result)) {
    await markFailedIfPending(order.id)

    return {
      ok: false,
      state: "FAILED",
      ...base,
      message: result?.errorMessage || "Ödeme başarısız",
      justPaidNow: false,
    }
  }

  // status === "failure" (ör. form henüz tamamlanmadı / token süresi doldu) veya
  // ara 3DS durumları: siparişi FAILED işaretlemeden beklemede bırak.
  return {
    ok: false,
    state: "PENDING",
    ...base,
    message: result?.errorMessage || "Ödeme henüz kesinleşmedi",
    justPaidNow: false,
  }
}
