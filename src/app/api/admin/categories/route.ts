import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import { slugify } from "@/lib/slugify"

export async function POST(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json()

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.slug || body.name),
        image: body.image || null,
        video: body.video || null,
        isFeatured: Boolean(body.isFeatured),
        isActive: Boolean(body.isActive),
        displayOrder: Number(body.displayOrder || 0),
      },
    })

    revalidatePath("/")
    revalidatePath("/category/[slug]", "page")

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Kategori oluşturma hatası:", error)

    return NextResponse.json(
      { error: "Kategori oluşturulamadı" },
      { status: 500 }
    )
  }
}