import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Context = { params: Promise<{ slug: string }> }

export async function GET(_: Request, context: Context) {
  try {
    const { slug } = await context.params

    const collection = await prisma.collection.findUnique({
      where: { slug, isActive: true },
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

    if (!collection) {
      return NextResponse.json({ error: "Koleksiyon bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        video: collection.video,
        discount: collection.discount,
      },
      products: collection.products.map((cp) => cp.product),
    })
  } catch (error) {
    console.error("Koleksiyon getirme hatası:", error)
    return NextResponse.json({ error: "Koleksiyon getirilemedi" }, { status: 500 })
  }
}
