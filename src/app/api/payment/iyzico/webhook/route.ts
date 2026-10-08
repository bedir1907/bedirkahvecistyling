import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyIyzicoWebhookSignature } from "@/lib/iyzico-webhook"
import { verifyOrderPayment } from "@/lib/iyzico-payment"
import { syncOrderRefundFromIyzico } from "@/lib/sync-order-refund"
import { isPaidStatus } from "@/lib/order-stock"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-iyz-signature-v3")

    const body = await request.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
    }

    if (!verifyIyzicoWebhookSignature(body, signature)) {
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

    const where = token
      ? { paymentToken: token }
      : paymentConversationId
        ? { paymentConversationId }
        : iyziPaymentId
          ? { paymentId: iyziPaymentId }
          : null

    if (!where) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const order = await prisma.order.findFirst({ where })

    if (!order) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    // Webhook'taki status bilgisine güvenilmez: iyzico'dan token ile tekrar sorgulanır.
    // verifyOrderPayment idempotent'tir (stok/mail yalnızca bir kez).
    if (order.status === "PENDING" || order.status === "FAILED") {
      await verifyOrderPayment({ orderNumber: order.orderNumber })
    } else if (isPaidStatus(order.status)) {
      try {
        await syncOrderRefundFromIyzico(order.id)
      } catch (syncError) {
        console.error("Webhook refund sync hatası:", syncError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Iyzico webhook hatası:", error)

    // 5xx → iyzico webhook'u tekrar dener.
    return NextResponse.json({ error: "Webhook işlenemedi" }, { status: 500 })
  }
}
