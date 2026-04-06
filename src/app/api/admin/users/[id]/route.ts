import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || currentUser.role !== "CREATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const targetUserId = Number(id)

    const targetUser = await prisma.adminUser.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        role: true,
        email: true,
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    if (currentUser.userId === targetUserId) {
      return NextResponse.json(
        { error: "Kendi hesabını silemezsin" },
        { status: 400 }
      )
    }

    if (targetUser.role === "CREATOR") {
      return NextResponse.json(
        { error: "Creator kullanıcı silinemez" },
        { status: 400 }
      )
    }

    await prisma.adminUser.delete({
      where: {
        id: targetUserId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error)

    return NextResponse.json(
      { error: "Kullanıcı silinemedi" },
      { status: 500 }
    )
  }
}