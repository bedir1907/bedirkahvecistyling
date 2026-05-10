import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()

    const image = await prisma.productColorImage.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        colorGroupId: true,
      },
    })

    if (!image) {
      return NextResponse.json(
        { error: "Görsel bulunamadı" },
        { status: 404 }
      )
    }

    const data: {
      alt?: string | null
      sortOrder?: number
      isCover?: boolean
    } = {}

    if ("alt" in body) {
      data.alt = body.alt ? String(body.alt).trim() : null
    }

    if ("sortOrder" in body) {
      data.sortOrder = Number(body.sortOrder ?? 0)
    }

    if ("isCover" in body) {
      const isCover = Boolean(body.isCover)
      data.isCover = isCover

      if (isCover) {
        await prisma.productColorImage.updateMany({
          where: {
            colorGroupId: image.colorGroupId,
          },
          data: {
            isCover: false,
          },
        })
      }
    }

    const updated = await prisma.productColorImage.update({
      where: {
        id: Number(id),
      },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Renk görseli güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Renk görseli güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params

    await prisma.productColorImage.delete({
      where: {
        id: Number(id),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Renk görseli silme hatası:", error)
    return NextResponse.json(
      { error: "Renk görseli silinemedi" },
      { status: 500 }
    )
  }
}