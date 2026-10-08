import crypto from "crypto"

type IyzicoConfig = {
  apiKey: string
  secretKey: string
  baseUrl: string
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} env değişkeni eksik`)
  }

  return value
}

/**
 * Env değişkenleri modül yüklenirken değil, ilk istek anında okunur.
 * Böylece eksik anahtar build'i kırmaz; sadece ödeme isteğinde açık bir hata verir.
 */
export function getIyzicoConfig(): IyzicoConfig {
  const apiKey = getRequiredEnv("IYZICO_API_KEY")
  const secretKey = getRequiredEnv("IYZICO_SECRET_KEY")
  const baseUrl = getRequiredEnv("IYZICO_BASE_URL").replace(/\/+$/, "")

  let host = ""
  try {
    host = new URL(baseUrl).hostname
  } catch {
    throw new Error("IYZICO_BASE_URL geçerli bir URL değil")
  }

  if (host !== "api.iyzipay.com" && host !== "sandbox-api.iyzipay.com") {
    throw new Error(
      "IYZICO_BASE_URL https://api.iyzipay.com (canlı) veya https://sandbox-api.iyzipay.com (test) olmalı"
    )
  }

  const isSandboxKey = apiKey.startsWith("sandbox-")
  const isSandboxUrl = host === "sandbox-api.iyzipay.com"
  if (isSandboxKey !== isSandboxUrl) {
    console.warn(
      "[iyzico] API anahtarı ile IYZICO_BASE_URL ortamı uyuşmuyor (sandbox/canlı). İstekler 'Geçersiz imza' hatası verebilir."
    )
  }

  return { apiKey, secretKey, baseUrl }
}

export function isIyzicoSandbox() {
  return (process.env.IYZICO_BASE_URL || "").includes("sandbox-api.iyzipay.com")
}

/** iyzico'nun resmi SDK'sıyla aynı format: 100 -> "100.0", 99.9 -> "99.9" */
export function formatIyzicoPrice(value: number | string) {
  const num = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(num)) {
    throw new Error("Geçersiz tutar")
  }

  const rounded = Math.round(num * 100) / 100
  const str = rounded.toString()
  return str.includes(".") ? str : `${str}.0`
}

export function createIyzicoAuthorization(path: string, body: string) {
  const { apiKey, secretKey } = getIyzicoConfig()
  const randomKey = `${Date.now()}${crypto.randomBytes(4).toString("hex")}`
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(`${randomKey}${path}${body}`)
    .digest("hex")

  const authorizationString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`
  const encoded = Buffer.from(authorizationString, "utf8").toString("base64")

  return { authorization: `IYZWSv2 ${encoded}`, randomKey }
}

async function iyzicoPost<T>(path: string, data: Record<string, unknown>) {
  const { baseUrl } = getIyzicoConfig()
  const body = JSON.stringify(data)
  const { authorization, randomKey } = createIyzicoAuthorization(path, body)

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

  if (!response.ok || !result) {
    throw new Error(
      result?.errorMessage ||
        result?.errorCode ||
        `Iyzico request failed with status ${response.status}`
    )
  }

  return result as T
}

export type IyzicoItemTransaction = {
  itemId?: string
  paymentTransactionId?: string | number
  transactionStatus?: number
  price?: number | string
  paidPrice?: number | string
}

export type IyzicoCheckoutFormResult = {
  status?: string
  errorCode?: string
  errorMessage?: string
  paymentStatus?: string
  fraudStatus?: number
  token?: string
  conversationId?: string
  price?: number | string
  paidPrice?: number | string
  currency?: string
  basketId?: string
  paymentId?: string | number
  itemTransactions?: IyzicoItemTransaction[]
}

export async function initializeCheckoutForm(data: Record<string, unknown>) {
  return iyzicoPost<{
    status?: string
    errorCode?: string
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
  return iyzicoPost<IyzicoCheckoutFormResult>(
    "/payment/iyzipos/checkoutform/auth/ecom/detail",
    data
  )
}

/**
 * Ödeme bazlı (paymentId) tutar iadesi — iyzico "Refund V2".
 * Tüm sepet için tek çağrıda kısmi/tam iade yapılabilir; ürün bazlı
 * paymentTransactionId gerektirmez.
 */
export async function refundPaymentV2(data: {
  locale?: "tr" | "en"
  conversationId: string
  paymentId: string
  price: string
  currency?: string
  ip?: string
}) {
  return iyzicoPost<{
    status?: string
    errorCode?: string
    errorMessage?: string
    paymentId?: string
    price?: number | string
    currency?: string
  }>("/v2/payment/refund", data)
}

/** Eski, ürün (paymentTransactionId) bazlı iade. */
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
    errorCode?: string
    errorMessage?: string
    paymentTransactionId?: string
    price?: string
    currency?: string
  }>("/payment/iyzipos/refund", data)
}
