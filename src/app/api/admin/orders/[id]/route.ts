import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import { syncOrderRefundFromIyzico } from "@/lib/sync-order-refund"

type Context = {
  params: Promise<{
    id: string
  }>
}

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "APPROVED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "FAILED",
] as const

function canTransition(current: string, next: string) {
  const transitions: Record<string, string[]> = {
    PENDING: ["PENDING", "CANCELLED"],
    PAID: ["APPROVED", "CANCELLED", "REFUNDED"],
    APPROVED: ["SHIPPED", "CANCELLED", "REFUNDED"],
    SHIPPED: ["DELIVERED", "REFUNDED"],
    DELIVERED: ["REFUNDED"],
    CANCELLED: [],
    REFUNDED: [],
    FAILED: [],
  }

  return transitions[current]?.includes(next) ?? false
}

export async function GET(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (
      !currentUser ||
      (!currentUser.canViewOrders &&
        !currentUser.canSell &&
        currentUser.role !== "CREATOR")
    ) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const orderId = Number(id)

    if (!Number.isFinite(orderId)) {
      return NextResponse.json(
        { error: "Geçersiz sipariş id" },
        { status: 400 }
      )
    }

    try {
      await syncOrderRefundFromIyzico(orderId)
    } catch (syncError) {
      console.error("Iyzico iade senkron hatası:", syncError)
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          orderBy: [{ id: "asc" }],
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Admin sipariş detay hatası:", error)

    return NextResponse.json(
      { error: "Sipariş getirilemedi" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (
      !currentUser ||
      (!currentUser.canViewOrders &&
        !currentUser.canSell &&
        currentUser.role !== "CREATOR")
    ) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const orderId = Number(id)
    const body = await request.json()

    const nextStatus = String(body.status || "").trim().toUpperCase()

    if (!VALID_STATUSES.includes(nextStatus as any)) {
      return NextResponse.json(
        { error: "Geçersiz sipariş durumu" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      )
    }

    if (nextStatus === "PAID" && order.status !== "PAID") {
      return NextResponse.json(
        { error: "Sipariş oluşturma durumu manuel seçilemez" },
        { status: 400 }
      )
    }

    if (order.status === nextStatus) {
      return NextResponse.json(order)
    }

    if (!canTransition(order.status, nextStatus)) {
      return NextResponse.json(
        { error: "Bu durum geçişine izin verilmiyor" },
        { status: 400 }
      )
    }

    if (order.status === "CANCELLED" && nextStatus !== "CANCELLED") {
      return NextResponse.json(
        { error: "İptal edilen sipariş tekrar aktif yapılamaz" },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (nextStatus === "CANCELLED" && !order.stockRestored) {
        for (const item of order.items) {
          const variant = await tx.productVariant.findFirst({
            where: {
              productId: item.productId,
              size: item.size || undefined,
            },
            select: {
              id: true,
            },
          })

          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })
          }
        }

        return await tx.order.update({
          where: { id: orderId },
          data: {
            status: nextStatus,
            stockRestored: true,
          },
          include: {
            items: true,
          },
        })
      }

      return await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
        },
        include: {
          items: true,
        },
      })
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Admin sipariş güncelleme hatası:", error)

    return NextResponse.json(
      { error: "Sipariş güncellenemedi" },
      { status: 500 }
    )
  }
}