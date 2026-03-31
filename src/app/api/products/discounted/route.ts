import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
      include: {
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 2,
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
        href: `/product/${product.id}`,
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