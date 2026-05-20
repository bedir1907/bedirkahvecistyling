import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

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
    const slug = normalizeString(body.slug)
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

    if (!slug) {
      return NextResponse.json(
        { error: "Slug zorunlu" },
        { status: 400 }
      )
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

    const existingSlug = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const created = await prisma.product.create({
  data: {
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