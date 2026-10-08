import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { formatIyzicoPrice, initializeCheckoutForm } from "@/lib/iyzico"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { getTrustedBaseUrl } from "@/lib/base-url"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const runtime = "nodejs"

function normalizeString(value: unknown, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength)
}

const MAX_QUANTITY_PER_LINE = 20
const MAX_CART_LINES = 50

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean)
  if (parts.length <= 1) {
    return { first: fullName, last: fullName }
  }
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] }
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

    const body = await request.json().catch(() => null)

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
    }

    const baseUrl = getTrustedBaseUrl()
    const customer = await getCustomerUserFromCookie()
    const addressId = Number(body.addressId)
    const billingSameAsShipping = Boolean(body.billingSameAsShipping)

    let name = normalizeString(body.name, 100)
    let email = normalizeString(body.email, 150).toLowerCase()
    let phone = normalizeString(body.phone, 30)
    let city = normalizeString(body.city, 60)
    let district = normalizeString(body.district, 60)
    let address = normalizeString(body.address, 400)
    let note = normalizeString(body.note, 500)

    let billingName = normalizeString(body.billingName, 100)
    let billingPhone = normalizeString(body.billingPhone, 30)
    let billingCity = normalizeString(body.billingCity, 60)
    let billingDistrict = normalizeString(body.billingDistrict, 60)
    let billingAddress = normalizeString(body.billingAddress, 400)
    let billingNote = normalizeString(body.billingNote, 500)

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Geçersiz e-posta adresi" }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10)

    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Geçersiz telefon numarası" },
        { status: 400 }
      )
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

    if (cart.length > MAX_CART_LINES) {
      return NextResponse.json({ error: "Sepette çok fazla ürün var" }, { status: 400 })
    }

    // Client'tan yalnızca ürün/varyant id ve adet kullanılır; fiyat DB'den okunur.
    // Aynı varyant birden fazla satırda gelirse adetler birleştirilir.
    const mergedCart = new Map<number, CartItem>()

    for (const raw of cart as Array<Record<string, unknown>>) {
      const item: CartItem = {
        productId: Number(raw?.productId),
        variantId: Number(raw?.variantId),
        name: normalizeString(raw?.name, 150) || "Ürün",
        color: normalizeString(raw?.color, 60) || null,
        size: normalizeString(raw?.size, 30) || null,
        quantity: Number(raw?.quantity),
      }

      if (
        !Number.isInteger(item.productId) || item.productId <= 0 ||
        !Number.isInteger(item.variantId) || item.variantId <= 0
      ) {
        return NextResponse.json({ error: "Sepette geçersiz ürün var" }, { status: 400 })
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          { error: `${item.name} için geçersiz adet` },
          { status: 400 }
        )
      }

      const existing = mergedCart.get(item.variantId)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        mergedCart.set(item.variantId, item)
      }
    }

    const normalizedCart = [...mergedCart.values()]

    for (const item of normalizedCart) {
      if (item.quantity > MAX_QUANTITY_PER_LINE) {
        return NextResponse.json(
          { error: `${item.name} için en fazla ${MAX_QUANTITY_PER_LINE} adet sipariş verilebilir` },
          { status: 400 }
        )
      }
    }

    const validatedItems: Array<{
      productId: number
      variantId: number
      productName: string
      color: string | null
      size: string | null
      price: number
      quantity: number
    }> = []

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: normalizedCart.map((item) => item.variantId) } },
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
    const variantMap = new Map(variants.map((variant) => [variant.id, variant]))

    for (const item of normalizedCart) {
      const variant = variantMap.get(item.variantId)

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

      if (!Number.isInteger(unitPrice) || unitPrice <= 0) {
        return NextResponse.json(
          { error: `${item.name} şu anda satın alınamıyor` },
          { status: 400 }
        )
      }

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

    // Server-side koleksiyon indirimi — ürün bazlı, client'a güvenmeyiz
    const productIds = validatedItems.map((item) => item.productId)
    const discountCollections = await prisma.collection.findMany({
      where: {
        isActive: true,
        discount: { not: null },
        products: { some: { productId: { in: productIds } } },
      },
      select: {
        discount: true,
        products: {
          where: { productId: { in: productIds } },
          select: { productId: true },
        },
      },
    })

    const productDiscountMap = new Map<number, number>()
    for (const col of discountCollections) {
      const d = col.discount ?? 0
      for (const cp of col.products) {
        const current = productDiscountMap.get(cp.productId) ?? 0
        if (d > current) productDiscountMap.set(cp.productId, d)
      }
    }

    // Satır bazında indirimli tutar (TL, tam sayı). iyzico sepet kalemleri bu tutarlarla
    // gönderilir; böylece price == sum(basketItems.price) == paidPrice olur ve
    // iade tutarları doğru dağılır. Hesap checkout sayfasıyla birebir aynıdır.
    const lineTotalFor = (item: { productId: number; price: number; quantity: number }) => {
      const rawDiscount = productDiscountMap.get(item.productId) ?? 0
      const d = Math.min(100, Math.max(0, rawDiscount))
      const gross = item.price * item.quantity
      const discount = d > 0 ? Math.round(gross * d / 100) : 0
      return gross - discount
    }
    const discountedPrice = validatedItems.reduce((sum, item) => sum + lineTotalFor(item), 0)

    // Kargo maliyetini server-side hesapla (indirim sonrası tutar üzerinden)
    const shippingFee = shippingSettings?.fee ?? 0
    const freeAbove = shippingSettings?.freeAbove ?? null
    const shippingCost = (shippingFee > 0 && (freeAbove === null || discountedPrice < freeAbove))
      ? shippingFee
      : 0
    const grandTotal = discountedPrice + shippingCost

    if (discountedPrice <= 0 || grandTotal <= 0) {
      return NextResponse.json(
        { error: "Sipariş tutarı geçersiz" },
        { status: 400 }
      )
    }

    const orderNumber = generateOrderNumber()
    // Benzersiz conversationId (aynı milisaniyede gelen siparişler çakışmasın)
    const conversationId = orderNumber

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

    // iyzico 0 TL'lik kalem kabul etmez → %100 indirimli satırlar sepete eklenmez.
    const basketItems = [
      ...order.items
        .map((item) => ({
          id: `${item.productId}-${item.id}`,
          name: `${item.productName}${item.size ? ` (${item.size})` : ""}`.slice(0, 200),
          category1: "Giyim",
          itemType: "PHYSICAL",
          amount: lineTotalFor(item),
        }))
        .filter((item) => item.amount > 0)
        .map(({ amount, ...item }) => ({ ...item, price: formatIyzicoPrice(amount) })),
      ...(shippingCost > 0 ? [{
        id: "shipping",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: "PHYSICAL",
        price: formatIyzicoPrice(shippingCost),
      }] : []),
    ]

    // iyzico kuralı: price == sum(basketItems.price)
    const basketSum = basketItems.reduce((sum, item) => sum + Number(item.price), 0)
    if (Math.abs(basketSum - grandTotal) > 0.001) {
      throw new Error(`Sepet toplamı uyuşmuyor (${basketSum} != ${grandTotal})`)
    }

    const clientIp = getClientIp(request)
    const buyerIp = clientIp === "unknown" ? "127.0.0.1" : clientIp
    const buyerName = splitName(name)

    const initializeRequest = {
      locale: "tr",
      conversationId,
      price: formatIyzicoPrice(grandTotal),
      paidPrice: formatIyzicoPrice(grandTotal),
      currency: "TRY",
      basketId: order.orderNumber,
      paymentGroup: "PRODUCT",
      callbackUrl,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: customer ? `C${customer.id}` : `G${order.id}`,
        name: buyerName.first,
        surname: buyerName.last,
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

    let result: Awaited<ReturnType<typeof initializeCheckoutForm>> | null = null
    try {
      result = await initializeCheckoutForm(initializeRequest)
    } catch (initError) {
      console.error("Iyzico initialize isteği başarısız:", initError)
    }

    if (
      !result ||
      result.status !== "success" ||
      !result.paymentPageUrl ||
      !result.token
    ) {
      console.error("Iyzico initialize reddedildi:", {
        orderNumber,
        errorCode: result?.errorCode,
        errorMessage: result?.errorMessage,
      })

      // Ödeme hiç başlamadı → sipariş "beklemede" kalmasın
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "FAILED" },
      })

      return NextResponse.json(
        { error: result?.errorMessage || "Ödeme başlatılamadı. Lütfen tekrar deneyin." },
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
    return NextResponse.json(
      { error: "Ödeme başlatılamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    )
  }
}
