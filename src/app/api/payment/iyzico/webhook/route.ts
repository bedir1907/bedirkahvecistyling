import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyIyzicoWebhookSignature } from "@/lib/iyzico-webhook"
import { verifyOrderPayment } from "@/lib/iyzico-payment"
import { syncOrderRefundFromIyzico } from "@/lib/sync-order-refund"
import { sendOrderEmail } from "@/lib/customer-email"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const signature =
      request.headers.get("x-iyz-signature-v3") ||
      request.headers.get("X-IYZ-SIGNATURE-V3")

    const body = await request.json()

    const isValid = verifyIyzicoWebhookSignature(body, signature)

    if (!isValid) {
      return NextResponse.json(
        { error: "Geçersiz webhook imzası" },
        { status: 401 }
      )
    }

    const paymentConversationId = String(
      body.paymentConversationId || body.paymentConversationID || ""
    ).trim()

    const token = String(body.token || "").trim()
    const iyziPaymentId = String(body.iyziPaymentId || body.paymentId || "").trim()
    const status = String(body.status || "").trim().toUpperCase()

    const order = await prisma.order.findFirst({
      where: paymentConversationId
        ? { paymentConversationId }
        : iyziPaymentId
          ? { paymentId: iyziPaymentId }
          : token
            ? { paymentToken: token }
            : undefined,
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    if (status === "SUCCESS") {
      const verification = await verifyOrderPayment({
        orderNumber: order.orderNumber,
      })

      if (verification.state === "PAID" && verification.justPaidNow) {
        try {
          await sendOrderEmail({
            to: order.email,
            name: order.name,
            orderNumber: order.orderNumber,
            total: order.totalPrice,
            items: order.items,
          })
        } catch (mailError) {
          console.error("Webhook sipariş maili gönderilemedi:", mailError)
        }
      }
    }

    if (status === "FAILURE") {
      const fresh = await prisma.order.findUnique({
        where: { id: order.id },
      })

      if (fresh && fresh.status === "PENDING") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "FAILED",
          },
        })
      }
    }

    try {
      await syncOrderRefundFromIyzico(order.id)
    } catch (syncError) {
      console.error("Webhook refund sync hatası:", syncError)
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("Iyzico webhook hatası:", error)

    return NextResponse.json(
      { error: error.message || "Webhook işlenemedi" },
      { status: 500 }
    )
  }
}