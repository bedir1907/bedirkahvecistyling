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

    const colorGroups = await prisma.productColorGroup.findMany({
      where: {
        productId: Number(id),
      },
      include: {
        variants: true,
        images: true,
      },
    })

    return NextResponse.json(colorGroups)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Renk grupları alınamadı" },
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
    const showAsProductCard = Boolean(body.showAsProductCard)
    const productCardName = body.productCardName
  ? String(body.productCardName).trim()
  : null

    const colorGroup = await prisma.productColorGroup.create({
      data: {
        productId: Number(id),
        colorName: body.colorName,
        sizeType: body.sizeType,
        sortOrder: body.sortOrder ?? 0,
        showAsProductCard,
        productCardName,
      },
    })

    return NextResponse.json(colorGroup)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Renk grubu oluşturulamadı" },
      { status: 500 }
    )
  }
}