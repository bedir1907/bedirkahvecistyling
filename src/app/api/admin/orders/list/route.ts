import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

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

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Admin sipariş listeleme hatası:", error)

    return NextResponse.json(
      { error: "Siparişler getirilemedi" },
      { status: 500 }
    )
  }
}