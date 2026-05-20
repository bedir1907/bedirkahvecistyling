import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

function isValidProductCode(value: string) {
  return /^\d{8,}$/.test(value)
}

function normalizeString(value: unknown) {
  return String(value || "").trim()
}

export async function GET(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const productId = Number(id)

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
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
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            url: true,
            alt: true,
            color: true,
            sortOrder: true,
            isCover: true,
          },
        },
        productVariants: {
          orderBy: [{ size: "asc" }],
          select: {
            id: true,
            size: true,
            stock: true,
            sku: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      )
    }

    const siblingProducts = product.groupCode
      ? await prisma.product.findMany({
          where: {
            groupCode: product.groupCode,
            isActive: true,
            NOT: {
              id: productId,
            },
          },
          orderBy: [{ color: "asc" }, { id: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            image: true,
          },
        })
      : []

    return NextResponse.json({
      ...product,
      siblingProducts,
    })
  } catch (error) {
    console.error("Admin ürün detay hatası:", error)

    return NextResponse.json(
      { error: "Ürün getirilemedi" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const productId = Number(id)
    const body = await request.json()

    const productCode = normalizeString(body.productCode)
    const slug = normalizeString(body.slug)
    const name = normalizeString(body.name)
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

    const existingProductCode = await prisma.product.findFirst({
      where: {
        productCode,
        NOT: {
          id: productId,
        },
      },
      select: {
        id: true,
      },
    })

    if (existingProductCode) {
      return NextResponse.json(
        { error: "Bu ürün kodu zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const existingSlug = await prisma.product.findFirst({
      where: {
        slug,
        NOT: {
          id: productId,
        },
      },
      select: {
        id: true,
      },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const updated = await prisma.product.update({
      where: {
        id: productId,
      },
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

    revalidatePath(`/product/${productId}`)
    revalidatePath("/")
    revalidatePath("/category/[slug]", "page")

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Ürün güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Ürün güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    })

    revalidatePath(`/product/${id}`)
    revalidatePath("/")
    revalidatePath("/category/[slug]", "page")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ürün silme hatası:", error)

    return NextResponse.json(
      { error: "Ürün silinemedi" },
      { status: 500 }
    )
  }
}