import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import { productPath } from "@/lib/product-url"
import { isMissingColumnError } from "@/lib/db-errors"
import { findAvailableProductSlug, isAutoSlug, normalizeProductSlug, readSeoFields } from "@/lib/admin-product-seo"

function isValidProductCode(value: string) {
  return /^\d{8,}$/.test(value)
}

function normalizeString(value: unknown) {
  return String(value || "").trim()
}

export async function POST(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json()

    const productCode = normalizeString(body.productCode)
    const name = normalizeString(body.name)
    const requestedSlug = normalizeProductSlug(body.slug)
    const color = normalizeString(body.color)
    const groupCode = normalizeString(body.groupCode)
    const category = normalizeString(body.category)
    const description = normalizeString(body.description)
    const image = normalizeString(body.image)

    if (!isValidProductCode(productCode)) {
      return NextResponse.json(
        { error: "Ürün kodu sadece sayı olmalı ve en az 8 haneli olmalı" },
        { status: 400 }
      )
    }

    if (!name) {
      return NextResponse.json(
        { error: "Ürün adı zorunlu" },
        { status: 400 }
      )
    }

    const seo = readSeoFields(body)
    if ("error" in seo) {
      return NextResponse.json({ error: seo.error }, { status: 400 })
    }

    if (!color) {
      return NextResponse.json(
        { error: "Renk alanı zorunlu" },
        { status: 400 }
      )
    }

    if (!groupCode) {
      return NextResponse.json(
        { error: "Group code zorunlu" },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: "Kategori zorunlu" },
        { status: 400 }
      )
    }

    const price = Number(body.price)
    const oldPrice =
      body.oldPrice !== null &&
      body.oldPrice !== undefined &&
      String(body.oldPrice).trim() !== ""
        ? Number(body.oldPrice)
        : null

    if (Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Fiyat geçerli bir sayı olmalı" },
        { status: 400 }
      )
    }

    if (oldPrice !== null && (Number.isNaN(oldPrice) || oldPrice < 0)) {
      return NextResponse.json(
        { error: "Eski fiyat geçerli bir sayı olmalı" },
        { status: 400 }
      )
    }

    const existingProductCode = await prisma.product.findUnique({
      where: { productCode },
      select: { id: true },
    })

    if (existingProductCode) {
      return NextResponse.json(
        { error: "Bu ürün kodu zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Slug boşsa (veya formun addan önerdiği slug ise) otomatik üretilir: çakışırsa renk, sonra -2, -3 … eklenir.
    // Elle girilen farklı bir slug başka üründe varsa hata verilir.
    let slug: string
    if (requestedSlug && !isAutoSlug(requestedSlug, name, color)) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: requestedSlug },
        select: { id: true },
      })
      if (existingSlug) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 400 }
        )
      }
      slug = requestedSlug
    } else {
      slug = await findAvailableProductSlug(name, color)
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug oluşturulamadı — ürün adını kontrol edin" },
        { status: 400 }
      )
    }

    const createProduct = (withSeo: boolean) => prisma.product.create({
  data: {
    ...(withSeo && (seo.metaTitle || seo.metaDescription)
      ? { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription }
      : {}),
    productCode,
    name,
    slug,
    color,
    groupCode,
    price,
    oldPrice,
    image,
    category,
    description,
    sizes: [],
    colors: [],
    stock: 0,
    featured: Boolean(body.featured),
    isNew: Boolean(body.isNew),
    isActive: Boolean(body.isActive),
    displayOrder: Number(body.displayOrder ?? 0),
  },
  select: {
    id: true,
    productCode: true,
    name: true,
    slug: true,
    color: true,
    groupCode: true,
    price: true,
    oldPrice: true,
    image: true,
    category: true,
    description: true,
    featured: true,
    isNew: true,
    isActive: true,
    displayOrder: true,
  },
})

    let created
    try {
      created = await createProduct(true)
    } catch (error) {
      // SEO kolonları canlı DB'ye henüz eklenmemişse meta alanları olmadan kaydet
      if (!isMissingColumnError(error)) throw error
      created = await createProduct(false)
    }

    revalidatePath(productPath(created.slug))
    revalidatePath("/")
    revalidatePath("/category/[slug]", "page")

    return NextResponse.json(created)
  } catch (error) {
    console.error("Ürün ekleme hatası:", error)
    return NextResponse.json(
      { error: "Ürün eklenemedi" },
      { status: 500 }
    )
  }
}