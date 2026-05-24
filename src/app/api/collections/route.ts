import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true, showOnHome: true },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                price: true,
                oldPrice: true,
                category: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    const result = collections.map((c) => ({
      ...c,
      products: c.products
        .map((cp) => cp.product)
        .filter((p) => p.isActive),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Koleksiyon getirme hatası:", error)
    return NextResponse.json({ error: "Koleksiyonlar getirilemedi" }, { status: 500 })
  }
}
