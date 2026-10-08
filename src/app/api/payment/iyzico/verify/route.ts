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

    const body = await request.json().catch(() => null)

    const token = typeof body?.token === "string" ? body.token.trim() : ""

    if (!token) {
      return NextResponse.json(
        { error: "token gerekli" },
        { status: 400 }
      )
    }

    const verification = await verifyOrderPayment({
      token,
    })

    // Sadece müşteriye gerekli alanlar döndürülür (iç id'ler değil).
    return NextResponse.json({
      ok: verification.ok,
      state: verification.state,
      orderNumber: verification.orderNumber,
      message: verification.message,
    })
  } catch (error) {
    console.error("Iyzico verify hatası:", error)

    return NextResponse.json(
      { error: "Ödeme doğrulanamadı" },
      { status: 500 }
    )
  }
}
