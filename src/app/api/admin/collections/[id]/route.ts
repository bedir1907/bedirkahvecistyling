import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = { params: Promise<{ id: string }> }

export async function GET(_: Request, context: Context) {
  try {
    const { id } = await context.params
    const collection = await prisma.collection.findUnique({
      where: { id: Number(id) },
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
    if (!collection) return NextResponse.json({ error: "Koleksiyon bulunamadı" }, { status: 404 })
    return NextResponse.json(collection)
  } catch (error) {
    console.error("Koleksiyon getirme hatası:", error)
    return NextResponse.json({ error: "Koleksiyon getirilemedi" }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, slug, eyebrow, description, image, buttonText, buttonLink, discount, isActive, showOnHome, displayOrder, productIds } = body

    const safeProductIds: number[] = Array.isArray(productIds) ? productIds.map(Number).filter(Number.isFinite) : []

    // Tek atomik işlem: deleteMany + create aynı transaction içinde
    const collection = await prisma.collection.update({
      where: { id: Number(id) },
      data: {
        name: String(name).trim(),
        slug: String(slug).trim(),
        eyebrow: eyebrow || null,
        description: description || null,
        image: image || null,
        buttonText: buttonText || null,
        buttonLink: buttonLink || null,
        discount: discount != null && discount !== "" ? Number(discount) : null,
        isActive: Boolean(isActive),
        showOnHome: Boolean(showOnHome),
        displayOrder: Number(displayOrder || 0),
        products: {
          deleteMany: {},
          create: safeProductIds.map((productId) => ({ productId })),
        },
      },
      include: {
        products: { include: { product: { select: { id: true, name: true, image: true, price: true, category: true } } } },
      },
    })

    revalidatePath("/")
    return NextResponse.json(collection)
  } catch (error) {
    console.error("Koleksiyon güncelleme hatası:", error)
    return NextResponse.json({ error: "Koleksiyon güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    await prisma.collection.delete({ where: { id: Number(id) } })

    revalidatePath("/")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Koleksiyon silme hatası:", error)
    return NextResponse.json({ error: "Koleksiyon silinemedi" }, { status: 500 })
  }
}
