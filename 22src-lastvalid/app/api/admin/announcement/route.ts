import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function POST(request: Request) {
  try {
    const user = await getAdminUserFromCookie()

    if (!user || user.role !== "CREATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { text } = await request.json()

    await prisma.announcementBar.create({
      data: {
        text,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Kaydedilemedi" },
      { status: 500 }
    )
  }
}