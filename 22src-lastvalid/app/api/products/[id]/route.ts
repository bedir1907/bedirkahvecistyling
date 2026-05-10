import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, context: Context) {
  try {
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

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      )
    }

    const categoryRecord = await prisma.category.findFirst({
      where: {
        name: product.category,
      },
      select: {
        slug: true,
      },
    })

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
            price: true,
            oldPrice: true,
          },
        })
      : []

    return NextResponse.json({
      ...product,
      categorySlug: categoryRecord?.slug || null,
      siblingProducts,
    })
  } catch (error) {
    console.error("Public ürün detay hatası:", error)

    return NextResponse.json(
      { error: "Ürün getirilemedi" },
      { status: 500 }
    )
  }
}