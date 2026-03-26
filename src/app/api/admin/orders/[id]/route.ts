import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

const VALID_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const

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

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        district: true,
        address: true,
        note: true,
        totalPrice: true,
        status: true,
        stockRestored: true,
        createdAt: true,
        updatedAt: true,
        items: {
          orderBy: [{ id: "asc" }],
          select: {
            id: true,
            productId: true,
            productName: true,
            color: true,
            size: true,
            price: true,
            quantity: true,
          },
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

    if (!VALID_STATUSES.includes(nextStatus as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: "Geçersiz sipariş durumu" },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        status: true,
        stockRestored: true,
        items: {
          select: {
            productId: true,
            size: true,
            quantity: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı" },
        { status: 404 }
      )
    }

    if (order.status === nextStatus) {
      const sameOrder = await prisma.order.findUnique({
        where: { id: orderId },
      })

      return NextResponse.json(sameOrder)
    }

    if (
      order.status === "CANCELLED" &&
      nextStatus !== "CANCELLED" &&
      order.stockRestored
    ) {
      return NextResponse.json(
        { error: "İptal edilen ve stoğu iade edilen sipariş tekrar aktif yapılamaz" },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (
        order.status !== "CANCELLED" &&
        nextStatus === "CANCELLED" &&
        !order.stockRestored
      ) {
        for (const item of order.items) {
          if (!item.size) continue

          const variant = await tx.productVariant.findFirst({
            where: {
              productId: item.productId,
              size: item.size,
            },
            select: {
              id: true,
            },
          })

          if (variant) {
            await tx.productVariant.update({
              where: {
                id: variant.id,
              },
              data: {
                stock: {
                  increment: Number(item.quantity || 0),
                },
              },
            })
          }
        }

        return await tx.order.update({
          where: {
            id: orderId,
          },
          data: {
            status: nextStatus,
            stockRestored: true,
          },
          select: {
            id: true,
            orderNumber: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            district: true,
            address: true,
            note: true,
            totalPrice: true,
            status: true,
            stockRestored: true,
            createdAt: true,
            updatedAt: true,
            items: {
              orderBy: [{ id: "asc" }],
              select: {
                id: true,
                productId: true,
                productName: true,
                color: true,
                size: true,
                price: true,
                quantity: true,
              },
            },
          },
        })
      }

      return await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: nextStatus,
        },
        select: {
          id: true,
          orderNumber: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          district: true,
          address: true,
          note: true,
          totalPrice: true,
          status: true,
          stockRestored: true,
          createdAt: true,
          updatedAt: true,
          items: {
            orderBy: [{ id: "asc" }],
            select: {
              id: true,
              productId: true,
              productName: true,
              color: true,
              size: true,
              price: true,
              quantity: true,
            },
          },
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