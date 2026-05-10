import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params

    const images = await prisma.productColorImage.findMany({
      where: {
        colorGroupId: Number(id),
      },
      orderBy: [
        { isCover: "desc" },
        { sortOrder: "asc" },
        { id: "asc" },
      ],
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Renk görselleri getirme hatası:", error)
    return NextResponse.json(
      { error: "Renk görselleri getirilemedi" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()

    const url = String(body.url || "").trim()
    const alt = body.alt ? String(body.alt).trim() : null
    const sortOrder = Number(body.sortOrder ?? 0)
    const isCover = Boolean(body.isCover)

    if (!url) {
      return NextResponse.json(
        { error: "Görsel URL zorunlu" },
        { status: 400 }
      )
    }

    if (isCover) {
      await prisma.productColorImage.updateMany({
        where: {
          colorGroupId: Number(id),
        },
        data: {
          isCover: false,
        },
      })
    }

    const image = await prisma.productColorImage.create({
      data: {
        colorGroupId: Number(id),
        url,
        alt,
        sortOrder,
        isCover,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error("Renk görseli ekleme hatası:", error)
    return NextResponse.json(
      { error: "Renk görseli eklenemedi" },
      { status: 500 }
    )
  }
}