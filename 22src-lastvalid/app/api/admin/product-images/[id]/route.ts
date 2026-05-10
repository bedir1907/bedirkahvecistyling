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

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params

    await prisma.productImage.delete({
      where: {
        id: Number(id),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Görsel silme hatası:", error)

    return NextResponse.json(
      { error: "Görsel silinemedi" },
      { status: 500 }
    )
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

    const image = await prisma.productImage.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!image) {
      return NextResponse.json(
        { error: "Görsel bulunamadı" },
        { status: 404 }
      )
    }

    if (body.makeCover) {
      await prisma.productImage.updateMany({
        where: {
          productId: image.productId,
        },
        data: {
          isCover: false,
        },
      })

      await prisma.productImage.update({
        where: {
          id: image.id,
        },
        data: {
          isCover: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Görsel güncelleme hatası:", error)

    return NextResponse.json(
      { error: "Görsel güncellenemedi" },
      { status: 500 }
    )
  }
}