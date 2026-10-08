import { NextResponse } from "next/server"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import { refundOrderFully } from "@/lib/iyzico-refund"
import { getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || currentUser.role !== "CREATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const orderId = Number(id)

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Geçersiz sipariş id" }, { status: 400 })
    }

    const outcome = await refundOrderFully({
      orderId,
      ip: getClientIp(request),
      targetStatus: "REFUNDED",
    })

    if (!outcome.ok) {
      return NextResponse.json({ error: outcome.error }, { status: outcome.httpStatus })
    }

    return NextResponse.json({
      success: true,
      order: outcome.order,
    })
  } catch (error) {
    console.error("Refund hatası:", error)

    return NextResponse.json(
      { error: "İade yapılamadı" },
      { status: 500 }
    )
  }
}
