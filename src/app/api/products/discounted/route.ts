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
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          orderBy: [
            { isCover: "desc" },
            { sortOrder: "asc" },
          ],
          take: 2,
        },
      },
    })

    const discounted = products
      .filter((p) => p.oldPrice && p.oldPrice > p.price)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.images?.[0]?.url || p.image,
        hoverImage: p.images?.[1]?.url || null,
      }))

    return NextResponse.json(discounted)
  } catch (error) {
    return NextResponse.json(
      { error: "İndirimli ürünler alınamadı" },
      { status: 500 }
    )
  }
}