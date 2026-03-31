import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import { syncOrderRefundFromIyzico } from "@/lib/sync-order-refund"

function getDisplayStatus(status: string, createdAt: Date) {
  if (status === "PAID") return "CREATED"
  if (status === "REFUNDED") return "REFUNDED"
  if (status !== "PENDING") return status

  const createdTime = new Date(createdAt).getTime()
  const now = Date.now()
  const diffMinutes = (now - createdTime) / (1000 * 60)

  if (diffMinutes >= 15) {
    return "FAILED_PAYMENT"
  }

  return "PENDING"
}

export async function GET() {
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

    const orders = await prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        orderNumber: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        totalPrice: true,
        status: true,
        stockRestored: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            color: true,
            size: true,
            price: true,
            quantity: true,
          },
        },
      },
    })

    const syncableStatuses = new Set([
      "PAID",
      "APPROVED",
      "SHIPPED",
      "DELIVERED",
    ])

    const ordersToSync = orders
      .filter((order) => syncableStatuses.has(order.status))
      .slice(0, 20)

    await Promise.allSettled(
      ordersToSync.map((order) => syncOrderRefundFromIyzico(order.id))
    )

    const refreshedOrders = await prisma.order.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        orderNumber: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        totalPrice: true,
        status: true,
        stockRestored: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            color: true,
            size: true,
            price: true,
            quantity: true,
          },
        },
      },
    })

    const normalizedOrders = refreshedOrders.map((order) => ({
      ...order,
      displayStatus: getDisplayStatus(order.status, order.createdAt),
    }))

    return NextResponse.json(normalizedOrders)
  } catch (error) {
    console.error("Admin sipariş listeleme hatası:", error)

    return NextResponse.json(
      { error: "Siparişler getirilemedi" },
      { status: 500 }
    )
  }
}