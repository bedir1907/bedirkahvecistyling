import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/collections/discount
// Body: { productIds: number[] }
// Returns: { discount: number | null, collectionName: string | null }
// En yüksek indirimli koleksiyonu döner
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const productIds: number[] = body.productIds ?? []

    if (productIds.length === 0) {
      return NextResponse.json({ discount: null, collectionName: null })
    }

    // Sepetteki ürünleri içeren aktif koleksiyonları bul
    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
        discount: { not: null },
        products: {
          some: {
            productId: { in: productIds },
          },
        },
      },
      select: { name: true, discount: true },
    })

    if (collections.length === 0) {
      return NextResponse.json({ discount: null, collectionName: null })
    }

    // En yüksek indirimi bul
    const best = collections.reduce((max, col) =>
      (col.discount ?? 0) > (max.discount ?? 0) ? col : max
    )

    return NextResponse.json({ discount: best.discount, collectionName: best.name })
  } catch (error) {
    console.error("Koleksiyon indirimi hatası:", error)
    return NextResponse.json({ discount: null, collectionName: null })
  }
}
