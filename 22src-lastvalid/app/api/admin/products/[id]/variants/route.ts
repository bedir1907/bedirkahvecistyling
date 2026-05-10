import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

function normalizeSize(value: unknown) {
  return String(value || "").trim()
}

export async function GET(_: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const productId = Number(id)

    const variants = await prisma.productVariant.findMany({
      where: {
        productId,
      },
      orderBy: [{ size: "asc" }],
      select: {
        id: true,
        size: true,
        stock: true,
        sku: true,
      },
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error("Variant listeleme hatası:", error)

    return NextResponse.json(
      { error: "Varyantlar getirilemedi" },
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
    const productId = Number(id)
    const body = await request.json()

    if (!Array.isArray(body.variants)) {
      return NextResponse.json(
        { error: "Varyant listesi geçersiz" },
        { status: 400 }
      )
    }

    const incomingVariants = body.variants
      .map((variant: any) => ({
        id:
          variant.id !== undefined &&
          variant.id !== null &&
          String(variant.id).trim() !== "" &&
          !Number.isNaN(Number(variant.id))
            ? Number(variant.id)
            : null,
        size: normalizeSize(variant.size),
        stock: Number(variant.stock ?? 0),
        sku: variant.sku ? String(variant.sku).trim() : null,
      }))
      .filter((variant: any) => variant.size)

    const existingVariants = await prisma.productVariant.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
      },
    })

    const existingIds = existingVariants.map((variant) => variant.id)
    const incomingIds = incomingVariants
      .filter((variant: any) => variant.id !== null)
      .map((variant: any) => variant.id)

    const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id))

    if (idsToDelete.length > 0) {
      await prisma.productVariant.deleteMany({
        where: {
          productId,
          id: {
            in: idsToDelete,
          },
        },
      })
    }

    for (const variant of incomingVariants) {
      if (variant.id !== null) {
        await prisma.productVariant.update({
          where: {
            id: variant.id,
          },
          data: {
            size: variant.size,
            stock: Number.isNaN(variant.stock) ? 0 : variant.stock,
            sku: variant.sku,
          },
        })
      } else {
        await prisma.productVariant.create({
  data: {
    productId,
    size: variant.size,
    stock: Number.isNaN(variant.stock) ? 0 : variant.stock,
    sku: variant.sku,
  },
})
      }
    }

    const updatedVariants = await prisma.productVariant.findMany({
      where: {
        productId,
      },
      orderBy: [{ size: "asc" }],
      select: {
        id: true,
        size: true,
        stock: true,
        sku: true,
      },
    })

    const totalStock = updatedVariants.reduce(
      (total, variant) => total + Number(variant.stock || 0),
      0
    )

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: totalStock,
      },
    })

    return NextResponse.json(updatedVariants)
  } catch (error) {
    console.error("Variant güncelleme hatası:", error)

    return NextResponse.json(
      { error: "Varyantlar güncellenemedi" },
      { status: 500 }
    )
  }
}   