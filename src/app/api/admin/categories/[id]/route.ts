import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(_: Request, context: Context) {
  try {
    const { id } = await context.params
    const category = await prisma.category.findUnique({ where: { id: Number(id) } })
    if (!category) return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 })
    return NextResponse.json(category)
  } catch (error) {
    console.error("Kategori getirme hatası:", error)
    return NextResponse.json({ error: "Kategori getirilemedi" }, { status: 500 })
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

    // Mevcut kategori adını al
    const existing = await prisma.category.findUnique({
      where: { id: Number(id) },
      select: { name: true },
    })

    if (!existing) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 })
    }

    const oldName = existing.name
    const newName = String(body.name || "").trim()

    // Kategoriyi güncelle
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name: newName,
        slug: body.slug,
        image: body.image || null,
        isFeatured: Boolean(body.isFeatured),
        isActive: Boolean(body.isActive),
        displayOrder: Number(body.displayOrder || 0),
      },
    })

    // İsim değiştiyse — tüm ürünlerin category alanını da güncelle
    if (newName && newName !== oldName) {
      await prisma.product.updateMany({
        where: { category: oldName },
        data: { category: newName },
      })
    }

    revalidatePath("/")
    revalidatePath("/category/[slug]", "page")

    return NextResponse.json(category)
  } catch (error) {
    console.error("Kategori güncelleme hatası:", error)
    return NextResponse.json({ error: "Kategori güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    await prisma.category.delete({ where: { id: Number(id) } })

    revalidatePath("/")
    revalidatePath("/category/[slug]", "page")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Kategori silme hatası:", error)
    return NextResponse.json({ error: "Kategori silinemedi" }, { status: 500 })
  }
}