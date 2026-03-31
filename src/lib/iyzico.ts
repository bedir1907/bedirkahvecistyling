import Iyzipay from "iyzipay"

const apiKey = process.env.IYZICO_API_KEY
const secretKey = process.env.IYZICO_SECRET_KEY
const uri = process.env.IYZICO_BASE_URL

if (!apiKey || !secretKey || !uri) {
  throw new Error("Iyzico env değişkenleri eksik")
}

export const iyzico = new Iyzipay({
  apiKey,
  secretKey,
  uri,
})