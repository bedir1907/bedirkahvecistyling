import { NextResponse } from "next/server"
import { verifyOrderPayment } from "@/lib/iyzico-payment"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const orderNumber =
      typeof body.orderNumber === "string" ? body.orderNumber.trim() : ""
    const token = typeof body.token === "string" ? body.token.trim() : ""

    if (!orderNumber && !token) {
      return NextResponse.json(
        { error: "orderNumber veya token gerekli" },
        { status: 400 }
      )
    }

    const verification = await verifyOrderPayment({
      orderNumber: orderNumber || undefined,
      token: token || undefined,
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