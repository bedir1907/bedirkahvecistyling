import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const collections = await prisma.collection.findMany({
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, image: true, price: true, category: true },
            },
          },
        },
      },
    })

    return NextResponse.json(collections)
  } catch (error) {
    console.error("Koleksiyon listeleme hatası:", error)
    return NextResponse.json({ error: "Koleksiyonlar getirilemedi" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, eyebrow, description, image, video, buttonText, buttonLink, discount, isActive, showOnHome, displayOrder, productIds } = body

    const collection = await prisma.collection.create({
      data: {
        name: String(name).trim(),
        slug: String(slug).trim(),
        eyebrow: eyebrow || null,
        description: description || null,
        image: image || null,
        video: video || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        discount: discount != null ? Number(discount) : null,
        isActive: Boolean(isActive ?? true),
        showOnHome: Boolean(showOnHome ?? false),
        displayOrder: Number(displayOrder || 0),
        products: {
          create: (productIds as number[]).map((productId) => ({ productId })),
        },
      },
      include: {
        products: { include: { product: { select: { id: true, name: true, image: true, price: true, category: true } } } },
      },
    })

    revalidatePath("/")
    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error("Koleksiyon oluşturma hatası:", error)
    return NextResponse.json({ error: "Koleksiyon oluşturulamadı" }, { status: 500 })
  }
}
