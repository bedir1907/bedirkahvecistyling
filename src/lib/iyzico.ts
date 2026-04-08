let iyzicoInstance: any = null

export function getIyzipay() {
  // daha önce oluşturulduysa tekrar oluşturma
  if (iyzicoInstance) {
    return iyzicoInstance
  }

  // 🔥 CRITICAL: lazy require (import yok!)
  const Iyzipay = require("iyzipay")

  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  const uri = process.env.IYZICO_BASE_URL

  if (!apiKey || !secretKey || !uri) {
    throw new Error("Iyzico env değişkenleri eksik")
  }

  iyzicoInstance = new Iyzipay({
    apiKey,
    secretKey,
    uri,
  })

  return iyzicoInstance
}