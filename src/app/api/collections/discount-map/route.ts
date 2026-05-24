import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { productIds } = await request.json()
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ discounts: {} })
    }

    const ids = productIds.map(Number).filter((n) => Number.isFinite(n))

    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
        discount: { not: null },
        products: { some: { productId: { in: ids } } },
      },
      select: {
        discount: true,
        products: {
          where: { productId: { in: ids } },
          select: { productId: true },
        },
      },
    })

    const discounts: Record<number, number> = {}
    for (const col of collections) {
      const d = col.discount ?? 0
      for (const cp of col.products) {
        const current = discounts[cp.productId] ?? 0
        if (d > current) discounts[cp.productId] = d
      }
    }

    return NextResponse.json({ discounts })
  } catch (error) {
    console.error("Discount map hatası:", error)
    return NextResponse.json({ discounts: {} })
  }
}
