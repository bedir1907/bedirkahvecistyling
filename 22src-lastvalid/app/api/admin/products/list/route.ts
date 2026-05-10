import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { id: "desc" },
      ],
      select: {
        id: true,
        productCode: true,
        name: true,
        slug: true,
        color: true,
        groupCode: true,
        price: true,
        oldPrice: true,
        image: true,
        category: true,
        description: true,
        featured: true,
        isNew: true,
        isActive: true,
        displayOrder: true,
        productVariants: {
          select: {
            stock: true,
          },
        },
      },
    })

    const normalizedProducts = products.map((product) => ({
      id: product.id,
      productCode: product.productCode,
      name: product.name,
      slug: product.slug,
      color: product.color,
      groupCode: product.groupCode,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      category: product.category,
      description: product.description,
      featured: product.featured,
      isNew: product.isNew,
      isActive: product.isActive,
      displayOrder: product.displayOrder,
      stock: product.productVariants.reduce(
        (total, variant) => total + Number(variant.stock || 0),
        0
      ),
    }))

    return NextResponse.json(normalizedProducts)
  } catch (error) {
    console.error("Ürün listeleme hatası:", error)

    return NextResponse.json(
      { error: "Ürünler getirilemedi" },
      { status: 500 }
    )
  }
}