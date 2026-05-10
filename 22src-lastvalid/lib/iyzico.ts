import crypto from "crypto"

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} env değişkeni eksik`)
  }

  return value
}

const apiKey = getRequiredEnv("IYZICO_API_KEY")
const secretKey = getRequiredEnv("IYZICO_SECRET_KEY")
const baseUrl = getRequiredEnv("IYZICO_BASE_URL")

function createAuthorization(path: string, body: string, randomKey: string) {
  const payload = `${randomKey}${path}${body}`

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex")

  const authorizationString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`
  const encoded = Buffer.from(authorizationString, "utf8").toString("base64")

  return `IYZWSv2 ${encoded}`
}

async function iyzicoPost<T>(path: string, data: Record<string, unknown>) {
  const body = JSON.stringify(data)
  const randomKey = `${Date.now()}${Math.floor(Math.random() * 100000)}`
  const authorization = createAuthorization(path, body, randomKey)

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      "x-iyzi-rnd": randomKey,
    },
    body,
    cache: "no-store",
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      result?.errorMessage ||
        result?.errorCode ||
        `Iyzico request failed with status ${response.status}`
    )
  }

  return result as T
}

export async function initializeCheckoutForm(data: Record<string, unknown>) {
  return iyzicoPost<{
    status?: string
    errorMessage?: string
    token?: string
    paymentPageUrl?: string
    checkoutFormContent?: string
  }>("/payment/iyzipos/checkoutform/initialize/auth/ecom", data)
}

export async function retrieveCheckoutForm(data: {
  locale?: "tr" | "en"
  conversationId?: string
  token: string
}) {
  return iyzicoPost<{
    status?: string
    errorMessage?: string
    paymentStatus?: string
    token?: string
    conversationId?: string
    price?: number | string
    paidPrice?: number | string
    currency?: string
    basketId?: string
    paymentId?: string | number
    itemTransactions?: Array<{
      paymentTransactionId?: string | number
    }>
  }>("/payment/iyzipos/checkoutform/auth/ecom/detail", data)
}

export async function refundPayment(data: {
  locale?: "tr" | "en"
  conversationId: string
  paymentTransactionId: string
  price: string
  currency?: string
  ip?: string
}) {
  return iyzicoPost<{
    status?: string
    errorMessage?: string
    paymentTransactionId?: string
    price?: string
    currency?: string
  }>("/payment/iyzipos/refund", data)
}