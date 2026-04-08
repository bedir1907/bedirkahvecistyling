import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import { getIyzipay } from "@/lib/iyzico"

export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
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
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 })
    }

    if (!["PAID", "APPROVED", "SHIPPED", "DELIVERED"].includes(order.status)) {
  return NextResponse.json(
    { error: "Bu sipariş durumu için iade yapılamaz" },
    { status: 400 }
  )
}

    if (!order.paymentTransactionId) {
      return NextResponse.json(
        { error: "İade için paymentTransactionId bulunamadı" },
        { status: 400 }
      )
    }

    const refundRequest = {
      locale: "tr",
      conversationId: `refund_${order.orderNumber}`,
      paymentTransactionId: order.paymentTransactionId,
      price: String(order.totalPrice),
      currency: "TRY",
      ip: "85.34.78.112",
    }

    const result = await new Promise<any>((resolve, reject) => {
      const iyzico = getIyzipay()
      iyzico.refund.create(refundRequest, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res)
      })
    })

    if (result.status !== "success") {
      return NextResponse.json(
        { error: result.errorMessage || "İade başarısız" },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
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
        where: { id: order.id },
        data: {
  status: "REFUNDED",
  refundedAt: new Date(),
  refundAmount: order.totalPrice,
  stockRestored: true,
},
      })
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error("Refund hatası:", error)

    return NextResponse.json(
      { error: error.message || "İade yapılamadı" },
      { status: 500 }
    )
  }
}