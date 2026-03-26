import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Kategori listeleme hatası:", error)

    return NextResponse.json(
      { error: "Kategoriler getirilemedi" },
      { status: 500 }
    )
  }
}