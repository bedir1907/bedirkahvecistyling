import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (
      !currentUser ||
      (!currentUser.canViewSensitiveData && currentUser.role !== "CREATOR")
    ) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const pages = await prisma.sitePage.findMany({
      orderBy: [{ id: "asc" }],
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Admin site pages GET hatası:", error)

    return NextResponse.json(
      { error: "Sayfa içerikleri alınamadı" },
      { status: 500 }
    )
  }
}