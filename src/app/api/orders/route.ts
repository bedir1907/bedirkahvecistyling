import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderEmail } from "@/lib/customer-email"

function generateOrderNumber() {
  return "ORD-" + Date.now()
}

function normalizeString(value: unknown) {
  return String(value || "").trim()
}

type CartItem = {
  productId: number
  variantId: number
  name: string
  color?: string | null
  size?: string | null
  price: number
  quantity: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = normalizeString(body.name)
    const email = normalizeString(body.email).toLowerCase()
    const phone = normalizeString(body.phone)
    const city = normalizeString(body.city)
    const district = normalizeString(body.district)
    const address = normalizeString(body.address)
    const note = normalizeString(body.note)
    const cart = Array.isArray(body.cart) ? body.cart : []

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

    const normalizedCart: CartItem[] = cart.map((item: any) => ({
      productId: Number(item.productId),
      variantId: Number(item.variantId),
      name: normalizeString(item.name),
      color: normalizeString(item.color) || null,
      size: normalizeString(item.size) || null,
      price: Number(item.price),
      quantity: Number(item.quantity),
    }))

    for (const item of normalizedCart) {
      if (
        Number.isNaN(item.productId) ||
        Number.isNaN(item.variantId) ||
        Number.isNaN(item.price) ||
        Number.isNaN(item.quantity)
      ) {
        return NextResponse.json(
          { error: "Sepette geçersiz ürün var" },
          { status: 400 }
        )
      }

      if (item.quantity <= 0) {
        return NextResponse.json(
          { error: "Geçersiz ürün adedi" },
          { status: 400 }
        )
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      let totalPrice = 0

      const validatedItems: Array<{
        productId: number
        variantId: number
        productName: string
        color: string | null
        size: string | null
        price: number
        quantity: number
      }> = []

      for (const item of normalizedCart) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            productId: true,
            size: true,
            stock: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                color: true,
                isActive: true,
              },
            },
          },
        })

        if (!variant || !variant.product || !variant.product.isActive) {
          throw new Error(`${item.name} artık satışta değil`)
        }

        if (variant.productId !== item.productId) {
          throw new Error(`${item.name} için ürün/varyant uyuşmuyor`)
        }

        if (variant.stock < item.quantity) {
          throw new Error(`${item.name} için yeterli stok yok`)
        }

        const unitPrice = Number(variant.product.price)
        totalPrice += unitPrice * item.quantity

        validatedItems.push({
          productId: variant.product.id,
          variantId: variant.id,
          productName: variant.product.name,
          color: variant.product.color || item.color || null,
          size: variant.size || item.size || null,
          price: unitPrice,
          quantity: item.quantity,
        })
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          name,
          email,
          phone,
          city,
          district,
          address,
          note: note || null,
          totalPrice,
          status: "PENDING",
          stockRestored: false,
        },
      })

      for (const item of validatedItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            productId: item.productId,
            productName: item.productName,
            color: item.color,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          },
        })
      }

      return {
        ...createdOrder,
        totalPrice,
      }
    })

    try {
      await sendOrderEmail({
        to: email,
        name,
        orderNumber: order.orderNumber,
        total: order.totalPrice,
      })
    } catch (mailError) {
      console.error("Sipariş maili gönderilemedi:", mailError)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error: any) {
    console.error("Order oluşturma hatası:", error)

    return NextResponse.json(
      { error: error.message || "Sipariş oluşturulamadı" },
      { status: 500 }
    )
  }
}