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

    const images = await prisma.productImage.findMany({
      where: {
        productId: Number(id),
      },
      orderBy: {
        sortOrder: "asc",
      },
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error("Ürün görselleri listeleme hatası:", error)

    return NextResponse.json(
      { error: "Görseller getirilemedi" },
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

    const lastImage = await prisma.productImage.findFirst({
      where: {
        productId: Number(id),
      },
      orderBy: {
        sortOrder: "desc",
      },
    })

   const image = await prisma.productImage.create({
  data: {
    productId: Number(id),
    url: body.url,
    alt: body.alt || "",
    color: body.color || null,
    sortOrder: (lastImage?.sortOrder ?? -1) + 1,
    isCover: false,
  },
})

    return NextResponse.json(image)
  } catch (error) {
    console.error("Ürün görsel ekleme hatası:", error)

    return NextResponse.json(
      { error: "Görsel eklenemedi" },
      { status: 500 }
    )
  }
}