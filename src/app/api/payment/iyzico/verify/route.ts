import { NextResponse } from "next/server"
import { verifyOrderPayment } from "@/lib/iyzico-payment"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`payment-verify:${ip}`, 30, 15 * 60 * 1000)

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Cok fazla dogrulama denemesi yapildi. Lutfen biraz sonra tekrar deneyin." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      )
    }

    const body = await request.json()

    const token = typeof body.token === "string" ? body.token.trim() : ""

    if (!token) {
      return NextResponse.json(
        { error: "token gerekli" },
        { status: 400 }
      )
    }

    const verification = await verifyOrderPayment({
      token,
    })

    return NextResponse.json(verification)
  } catch (error: any) {
    console.error("Iyzico verify hatası:", error)

    return NextResponse.json(
      { error: error.message || "Ödeme doğrulanamadı" },
      { status: 500 }
    )
  }
}
