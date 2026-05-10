import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")
    const isNew = searchParams.get("isNew")
    const discounted = searchParams.get("discounted")
    const featured = searchParams.get("featured")
    // ── YENİ: Arama parametresi ──────────────────────────────────────────────
    const q = searchParams.get("q")?.trim()

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(isNew === "true" ? { isNew: true } : {}),
        ...(featured === "true" ? { featured: true } : {}),
        ...(discounted === "true" ? { oldPrice: { not: null } } : {}),
        // Arama: ürün adı veya kategoride geçiyor mu?
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { color: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        groupCode: true,
        price: true,
        oldPrice: true,
        image: true,
        category: true,
        isNew: true,
        featured: true,
      },
    })

    // Her ürün için renk seçeneklerini ekle
    const productsWithColors = await Promise.all(
      products.map(async (product) => {
        const siblings = product.groupCode
          ? await prisma.product.findMany({
              where: { groupCode: product.groupCode, isActive: true },
              orderBy: [{ color: "asc" }],
              select: { id: true, color: true, image: true, slug: true },
            })
          : []
        return { ...product, colors: siblings }
      })
    )

    return NextResponse.json(productsWithColors)
  } catch (error) {
    console.error("Ürün listeleme hatası:", error)
    return NextResponse.json({ error: "Ürünler getirilemedi" }, { status: 500 })
  }
}
