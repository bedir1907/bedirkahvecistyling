import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderEmail } from "@/lib/mail"

function generateOrderNumber() {
  return "ORD-" + Date.now()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      phone,
      city,
      district,
      address,
      note,
      cart,
    } = body

    // 🛑 validation
    if (!name || !email || !phone || !city || !district || !address) {
      return NextResponse.json(
        { error: "Eksik bilgi var" },
        { status: 400 }
      )
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { error: "Sepet boş" },
        { status: 400 }
      )
    }

    // 🔥 toplam hesapla
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // 🧠 TRANSACTION (çok önemli)
    const order = await prisma.$transaction(async (tx) => {
      // 1️⃣ order oluştur
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          name,
          email,
          phone,
          city,
          district,
          address,
          note,
          totalPrice,
        },
      })

      // 2️⃣ order items + stock düşme
      for (const item of cart) {
        // stock kontrol
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        })

        if (!variant || variant.stock < item.quantity) {
          throw new Error(
            `${item.name} için yeterli stok yok`
          )
        }

        // stock düş
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // order item oluştur
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            productName: item.name,
            color: item.color,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          },
        })
      }

      return createdOrder
    })
await sendOrderEmail({
  to: email,
  name,
  orderNumber: order.orderNumber,
  total: totalPrice, // ✅ DOĞRU
})
    return NextResponse.json({
      success: true,
      orderId: order.id,
    })
  } catch (error: any) {
    console.error("Order oluşturma hatası:", error)

    return NextResponse.json(
      { error: error.message || "Sipariş oluşturulamadı" },
      { status: 500 }
    )
  }
}