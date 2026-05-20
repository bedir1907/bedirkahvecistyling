import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { initializeCheckoutForm } from "@/lib/iyzico"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { getTrustedBaseUrl } from "@/lib/base-url"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"

function normalizeString(value: unknown) {
  return String(value || "").trim()
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
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

function formatDate(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`payment-initialize:${ip}`, 20, 15 * 60 * 1000)

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Cok fazla odeme denemesi yapildi. Lutfen biraz sonra tekrar deneyin." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      )
    }

    const body = await request.json()
    const baseUrl = getTrustedBaseUrl()
    const customer = await getCustomerUserFromCookie()
    const addressId = Number(body.addressId)
    const billingSameAsShipping = Boolean(body.billingSameAsShipping)

    let name = normalizeString(body.name)
    let email = normalizeString(body.email).toLowerCase()
    let phone = normalizeString(body.phone)
    let city = normalizeString(body.city)
    let district = normalizeString(body.district)
    let address = normalizeString(body.address)
    let note = normalizeString(body.note)

    let billingName = normalizeString(body.billingName)
    let billingPhone = normalizeString(body.billingPhone)
    let billingCity = normalizeString(body.billingCity)
    let billingDistrict = normalizeString(body.billingDistrict)
    let billingAddress = normalizeString(body.billingAddress)
    let billingNote = normalizeString(body.billingNote)

    const cart = Array.isArray(body.cart) ? body.cart : []

    // Kargo ücretini DB'den çek (client'a güvenmeyiz)
    const shippingSettings = await prisma.shippingSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "desc" },
    })

    if (customer) {
      email = customer.email
      name = name || customer.name
      phone = phone || customer.phone || ""

      if (Number.isFinite(addressId) && addressId > 0) {
        const savedAddress = await prisma.customerAddress.findFirst({
          where: {
            id: addressId,
            customerId: customer.id,
          },
        })

        if (!savedAddress) {
          return NextResponse.json(
            { error: "Seçilen adres bulunamadı" },
            { status: 400 }
          )
        }

        name = savedAddress.fullName
        phone = savedAddress.phone
        city = savedAddress.city
        district = savedAddress.district
        address = savedAddress.address
        note = savedAddress.note || note
      }
    }

    if (!name || !email || !phone || !city || !district || !address) {
      return NextResponse.json({ error: "Eksik bilgi var" }, { status: 400 })
    }

    if (billingSameAsShipping) {
      billingName = name
      billingPhone = phone
      billingCity = city
      billingDistrict = district
      billingAddress = address
      billingNote = note
    }

    if (
      !billingSameAsShipping &&
      (!billingName ||
        !billingPhone ||
        !billingCity ||
        !billingDistrict ||
        !billingAddress)
    ) {
      return NextResponse.json(
        { error: "Fatura adresi bilgileri eksik" },
        { status: 400 }
      )
    }

    if (cart.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 })
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

    const validatedItems: Array<{
      productId: number
      variantId: number
      productName: string
      color: string | null
      size: string | null
      price: number
      quantity: number
    }> = []

    let totalPrice = 0

    for (const item of normalizedCart) {
      const variant = await prisma.productVariant.findUnique({
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
        return NextResponse.json(
          { error: `${item.name} artık satışta değil` },
          { status: 400 }
        )
      }

      if (variant.productId !== item.productId) {
        return NextResponse.json(
          { error: `${item.name} için ürün/varyant uyuşmuyor` },
          { status: 400 }
        )
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `${item.name} için yeterli stok yok` },
          { status: 400 }
        )
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

    // Kargo maliyetini server-side hesapla
    const shippingFee = shippingSettings?.fee ?? 0
    const freeAbove = shippingSettings?.freeAbove ?? null
    const shippingCost = (shippingFee > 0 && (freeAbove === null || totalPrice < freeAbove))
      ? shippingFee
      : 0
    const grandTotal = totalPrice + shippingCost

    const conversationId = `conv_${Date.now()}`
    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer?.id || null,
        name,
        email,
        phone,
        city,
        district,
        address,
        note: note || null,

        billingSameAsShipping,
        billingName: billingName || null,
        billingPhone: billingPhone || null,
        billingCity: billingCity || null,
        billingDistrict: billingDistrict || null,
        billingAddress: billingAddress || null,
        billingNote: billingNote || null,

        totalPrice: grandTotal,
        status: "PENDING",
        stockRestored: false,
        paymentProvider: "IYZICO",
        paymentConversationId: conversationId,
        items: {
          create: validatedItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            color: item.color,
            size: item.size,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    const callbackUrl = `${baseUrl}/api/payment/iyzico/callback`

    const basketItems = [
      ...order.items.map((item) => ({
        id: String(item.productId),
        name: item.productName,
        category1: "Genel",
        itemType: "PHYSICAL",
        price: String(item.price * item.quantity),
      })),
      ...(shippingCost > 0 ? [{
        id: "shipping",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: "PHYSICAL",
        price: String(shippingCost),
      }] : []),
    ]

    const forwardedFor =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      ""
    const buyerIp = forwardedFor.split(",")[0]?.trim() || "127.0.0.1"

    const cleanPhone = phone.replace(/\D/g, "").slice(-10)

    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Geçersiz telefon numarası" },
        { status: 400 }
      )
    }

    const initializeRequest = {
      locale: "tr",
      conversationId,
      price: String(grandTotal),
      paidPrice: String(grandTotal),
      currency: "TRY",
      basketId: order.orderNumber,
      paymentGroup: "PRODUCT",
      callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: String(order.id),
        name,
        surname: name.split(" ").slice(1).join(" ") || name,
        gsmNumber: "+90" + cleanPhone,
        email,
        identityNumber: "11111111111",
        lastLoginDate: formatDate(new Date()),
        registrationDate: formatDate(new Date()),
        registrationAddress: address,
        ip: buyerIp,
        city,
        country: "Turkey",
        zipCode: "34000",
      },
      shippingAddress: {
        contactName: name,
        city,
        country: "Turkey",
        address,
        zipCode: "34000",
      },
      billingAddress: {
        contactName: billingName || name,
        city: billingCity || city,
        country: "Turkey",
        address: billingAddress || address,
        zipCode: "34000",
      },
      basketItems,
    }

   const result = await initializeCheckoutForm(initializeRequest)

    if (
      !result ||
      result.status !== "success" ||
      !result.paymentPageUrl ||
      !result.token
    ) {
      return NextResponse.json(
        { error: result?.errorMessage || "Ödeme başlatılamadı" },
        { status: 400 }
      )
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentToken: result.token,
        paymentPageUrl: result.paymentPageUrl,
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentPageUrl: result.paymentPageUrl,
    })
  } catch (error) {
    console.error("Iyzico initialize hatası:", error)
    const message = error instanceof Error ? error.message : "Ödeme başlatılamadı"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
