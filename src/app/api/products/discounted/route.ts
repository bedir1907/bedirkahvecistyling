import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { productPath } from "@/lib/product-url"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        oldPrice: {
          not: null,
        },
      },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        oldPrice: true,
        image: true,
        color: true,
        category: true,
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 2,
          select: { url: true },
        },
      },
    })

    const discounted = products
      .filter((product) => product.oldPrice !== null && product.oldPrice > product.price)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.images?.[0]?.url || product.image,
        hoverImage: product.images?.[1]?.url || null,
        colorName: product.color || "",
        category: product.category,
        slug: product.slug,
        href: productPath(product.slug, product.id),
      }))

    return NextResponse.json(discounted)
  } catch (error) {
    console.error("İndirimli ürünler alınamadı:", error)

    return NextResponse.json(
      { error: "İndirimli ürünler alınamadı" },
      { status: 500 }
    )
  }
}