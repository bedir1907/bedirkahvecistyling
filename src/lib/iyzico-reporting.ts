import { createIyzicoAuthorization, getIyzicoConfig } from "@/lib/iyzico"

type IyzicoReportingPayment = {
  paymentId?: number | string
  paymentConversationId?: string
  paymentRefundStatus?: string
  price?: number
  paidPrice?: number
  cancels?: Array<{
    refundPrice?: number
    refundStatus?: number
  }>
  itemTransactions?: Array<{
    paymentTransactionId?: number | string
    refunds?: Array<{
      refundPrice?: number
      refundStatus?: number
    }>
  }>
}

export async function getIyzicoPaymentDetails(params: {
  paymentId?: string | number | null
  paymentConversationId?: string | null
}) {
  const paymentId =
    params.paymentId !== null && params.paymentId !== undefined
      ? String(params.paymentId).trim()
      : ""

  const paymentConversationId =
    params.paymentConversationId !== null &&
    params.paymentConversationId !== undefined
      ? String(params.paymentConversationId).trim()
      : ""

  if (!paymentId && !paymentConversationId) {
    throw new Error("paymentId veya paymentConversationId gerekli")
  }

  const uriPath = "/v2/reporting/payment/details"
  const query = new URLSearchParams()

  query.set("locale", "tr")
  query.set("conversationId", `sync_${Date.now()}`)

  if (paymentId) {
    query.set("paymentId", paymentId)
  } else {
    query.set("paymentConversationId", paymentConversationId)
  }

  // GET isteklerinde imza: randomKey + path (query string hariç) + boş body
  const { authorization, randomKey } = createIyzicoAuthorization(uriPath, "")
  const { baseUrl } = getIyzicoConfig()

  const res = await fetch(`${baseUrl}${uriPath}?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: authorization,
      "x-iyzi-rnd": randomKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => null)

  if (!res.ok || data?.status !== "success") {
    throw new Error(data?.errorMessage || "iyzico reporting sorgusu başarısız")
  }

  const payment: IyzicoReportingPayment | null =
    Array.isArray(data?.payments) && data.payments.length > 0
      ? data.payments[0]
      : null

  return {
    raw: data,
    payment,
  }
}

export function summarizeRefundFromReporting(payment: IyzicoReportingPayment | null) {
  if (!payment) {
    return {
      paymentRefundStatus: null,
      totalRefunded: 0,
      isTotallyRefunded: false,
      isPartiallyRefunded: false,
    }
  }

  const cancelRefundTotal = Array.isArray(payment.cancels)
    ? payment.cancels.reduce((sum, item) => {
        return sum + Number(item?.refundPrice || 0)
      }, 0)
    : 0

  const itemRefundTotal = Array.isArray(payment.itemTransactions)
    ? payment.itemTransactions.reduce((sum, tx) => {
        const refunds = Array.isArray(tx?.refunds) ? tx.refunds : []
        return (
          sum +
          refunds.reduce((inner, refund) => {
            return inner + Number(refund?.refundPrice || 0)
          }, 0)
        )
      }, 0)
    : 0

  const totalRefunded = cancelRefundTotal + itemRefundTotal
  const paymentRefundStatus = payment.paymentRefundStatus || null

  return {
    paymentRefundStatus,
    totalRefunded,
    isTotallyRefunded:
      paymentRefundStatus === "TOTALLY_REFUNDED",
    isPartiallyRefunded:
      paymentRefundStatus === "PARTIALLY_REFUNDED" ||
      (!paymentRefundStatus && totalRefunded > 0),
  }
}