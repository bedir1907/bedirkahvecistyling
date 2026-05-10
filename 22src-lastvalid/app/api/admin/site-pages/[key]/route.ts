import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    key: string
  }>
}

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function GET(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (
      !currentUser ||
      (!currentUser.canViewSensitiveData && currentUser.role !== "CREATOR")
    ) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { key } = await context.params

    const page = await prisma.sitePage.findUnique({
      where: { key },
    })

    if (!page) {
      return NextResponse.json({ error: "Sayfa bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Admin site page GET hatası:", error)

    return NextResponse.json(
      { error: "Sayfa alınamadı" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || currentUser.role !== "CREATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { key } = await context.params
    const body = await request.json()

    const title = normalize(body.title)
    const content = normalize(body.content)

    if (!title || !content) {
      return NextResponse.json(
        { error: "Başlık ve içerik zorunlu" },
        { status: 400 }
      )
    }

    const updated = await prisma.sitePage.upsert({
      where: { key },
      update: {
        title,
        content,
      },
      create: {
        key,
        title,
        content,
      },
    })

    return NextResponse.json({
      success: true,
      page: updated,
    })
  } catch (error) {
    console.error("Admin site page PATCH hatası:", error)

    return NextResponse.json(
      { error: "Sayfa güncellenemedi" },
      { status: 500 }
    )
  }
}