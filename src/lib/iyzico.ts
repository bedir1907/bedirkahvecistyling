import Iyzipay from "iyzipay"

declare global {
  var iyzicoGlobal: Iyzipay | undefined
}

export function getIyzipay() {
  if (global.iyzicoGlobal) {
    return global.iyzicoGlobal
  }

  const apiKey = process.env.IYZICO_API_KEY
  const secretKey = process.env.IYZICO_SECRET_KEY
  const uri = process.env.IYZICO_BASE_URL

  if (!apiKey || !secretKey || !uri) {
    throw new Error("Iyzico env değişkenleri eksik")
  }

  const instance = new Iyzipay({
    apiKey,
    secretKey,
    uri,
  })

  global.iyzicoGlobal = instance

  return instance
}