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

    const variants = await prisma.productVariant.findMany({
      where: {
        colorGroupId: Number(id),
      },
      orderBy: [{ size: "asc" }],
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error("Varyant listeleme hatası:", error)
    return NextResponse.json(
      { error: "Varyantlar getirilemedi" },
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

    const size = String(body.size || "").trim()
    const stock = Number(body.stock ?? 0)
    const sku = body.sku ? String(body.sku).trim() : null

    if (!size) {
      return NextResponse.json(
        { error: "Beden zorunlu" },
        { status: 400 }
      )
    }

    const existing = await prisma.productVariant.findFirst({
      where: {
        colorGroupId: Number(id),
        size,
      },
      select: {
        id: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Bu beden bu renk için zaten ekli" },
        { status: 400 }
      )
    }

    const variant = await prisma.productVariant.create({
      data: {
        colorGroupId: Number(id),
        size,
        stock,
        sku,
      },
    })

    return NextResponse.json(variant)
  } catch (error) {
    console.error("Varyant oluşturma hatası:", error)
    return NextResponse.json(
      { error: "Varyant oluşturulamadı" },
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

    if (!Array.isArray(body.variants)) {
      return NextResponse.json(
        { error: "Varyant listesi geçersiz" },
        { status: 400 }
      )
    }

    const colorGroupId = Number(id)

    const existingInDb = await prisma.productVariant.findMany({
      where: { colorGroupId },
      select: { id: true },
    })

    const incomingNumericIds = body.variants
      .map((variant: { id?: number | string }) =>
        typeof variant.id === "number" ? variant.id : null
      )
      .filter((variantId: number | null): variantId is number => variantId !== null)

    const idsToDelete = existingInDb
      .map((item) => item.id)
      .filter((dbId) => !incomingNumericIds.includes(dbId))

    if (idsToDelete.length > 0) {
      await prisma.productVariant.deleteMany({
        where: {
          colorGroupId,
          id: {
            in: idsToDelete,
          },
        },
      })
    }

    for (const variant of body.variants) {
      if (typeof variant.id !== "number") continue

      const size = String(variant.size || "").trim()
      if (!size) continue

      await prisma.productVariant.update({
        where: {
          id: Number(variant.id),
        },
        data: {
          size,
          stock: Number(variant.stock ?? 0),
          sku: variant.sku ? String(variant.sku).trim() : null,
        },
      })
    }

    const updatedVariants = await prisma.productVariant.findMany({
      where: {
        colorGroupId,
      },
    })

    return NextResponse.json(updatedVariants)
  } catch (error) {
    console.error("Varyant güncelleme hatası:", error)
    return NextResponse.json(
      { error: "Varyantlar güncellenemedi" },
      { status: 500 }
    )
  }
}