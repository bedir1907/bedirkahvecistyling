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

    const colorGroup = await prisma.productColorGroup.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        },
        variants: true,
      },
    })

    if (!colorGroup) {
      return NextResponse.json(
        { error: "Renk grubu bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(colorGroup)
  } catch (error) {
    console.error("Color group detay hatası:", error)
    return NextResponse.json(
      { error: "Renk grubu getirilemedi" },
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

    const colorName = String(body.colorName || "").trim()
    const sizeType = String(body.sizeType || "letter").trim()
    const sortOrder = Number(body.sortOrder ?? 0)
    const isActive = Boolean(body.isActive)
    const showAsProductCard = Boolean(body.showAsProductCard)
    const productCardName = body.productCardName
  ? String(body.productCardName).trim()
  : null

    if (!colorName) {
      return NextResponse.json(
        { error: "Renk adı zorunlu" },
        { status: 400 }
      )
    }

    const currentGroup = await prisma.productColorGroup.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        productId: true,
      },
    })

    if (!currentGroup) {
      return NextResponse.json(
        { error: "Renk grubu bulunamadı" },
        { status: 404 }
      )
    }

    const existing = await prisma.productColorGroup.findFirst({
      where: {
        productId: currentGroup.productId,
        colorName,
        NOT: {
          id: Number(id),
        },
      },
      select: {
        id: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Bu ürün için aynı renk zaten var" },
        { status: 400 }
      )
    }

    const updated = await prisma.productColorGroup.update({
      where: {
        id: Number(id),
      },
      data: {
        colorName,
        sizeType,
        sortOrder,
        isActive,
        showAsProductCard,
        productCardName,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        },
        variants: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Color group güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Renk grubu güncellenemedi" },
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

    await prisma.productColorGroup.delete({
      where: {
        id: Number(id),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Color group silme hatası:", error)
    return NextResponse.json(
      { error: "Renk grubu silinemedi" },
      { status: 500 }
    )
  }
}