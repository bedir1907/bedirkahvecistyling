import crypto from "crypto"

type IyzicoWebhookPayload = {
  iyziEventType?: string
  iyziPaymentId?: string | number
  token?: string
  paymentConversationId?: string
  status?: string
  paymentId?: string | number
  paymentConversationID?: string
}

function normalize(value: unknown) {
  return String(value ?? "").trim()
}

export function verifyIyzicoWebhookSignature(
  payload: IyzicoWebhookPayload,
  signatureHeader: string | null
) {
  const secretKey = process.env.IYZICO_SECRET_KEY

  if (!secretKey) {
    throw new Error("IYZICO_SECRET_KEY tanımlı değil")
  }

  if (!signatureHeader) {
    return false
  }

  const iyziEventType = normalize(payload.iyziEventType)
  const iyziPaymentId = normalize(payload.iyziPaymentId || payload.paymentId)
  const token = normalize(payload.token)
  const paymentConversationId = normalize(
    payload.paymentConversationId || payload.paymentConversationID
  )
  const status = normalize(payload.status)

  const raw = [
    secretKey,
    iyziEventType,
    iyziPaymentId,
    token,
    paymentConversationId,
    status,
  ].join("")

  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(raw)
    .digest("hex")

  const expected = Buffer.from(expectedSignature.toLowerCase(), "utf8")
  const received = Buffer.from(signatureHeader.toLowerCase(), "utf8")

  if (expected.length !== received.length) {
    return false
  }

  return crypto.timingSafeEqual(expected, received)
}
