import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function normalizeSearch(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/İ/g, "i").replace(/Ğ/g, "g").replace(/Ü/g, "u")
    .replace(/Ş/g, "s").replace(/Ö/g, "o").replace(/Ç/g, "c")
}

// PostgreSQL'de translate() ile her iki yönde de Türkçe karakter normalize eden ID sorgusu
async function getSearchMatchingIds(q: string): Promise<number[]> {
  const normalized = `%${normalizeSearch(q)}%`
  const rows = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM "Product"
    WHERE
      translate(lower("name"),     'ğüşıöç', 'gusioc') ILIKE ${normalized}
      OR translate(lower("color"), 'ğüşıöç', 'gusioc') ILIKE ${normalized}
      OR translate(lower("category"), 'ğüşıöç', 'gusioc') ILIKE ${normalized}
      OR lower("slug") ILIKE ${normalized}
  `
  return rows.map((r) => r.id)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")       // eski: isme göre (backward compat)
    const categorySlug = searchParams.get("categorySlug") // yeni: slug'a göre
    const isNew = searchParams.get("isNew")
    const discounted = searchParams.get("discounted")
    const featured = searchParams.get("featured")
    const q = searchParams.get("q")

    // Slug verilmişse → DB'den kategori adını bul, o adla filtrele
    let categoryName: string | null = category ?? null

    if (categorySlug) {
      const cat = await prisma.category.findFirst({
        where: { slug: categorySlug, isActive: true },
        select: { name: true },
      })
      categoryName = cat?.name ?? null
    }

    const searchIds = q ? await getSearchMatchingIds(q) : null

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryName ? { category: categoryName } : {}),
        ...(isNew === "true" ? { isNew: true } : {}),
        ...(featured === "true" ? { featured: true } : {}),
        ...(discounted === "true" ? { oldPrice: { not: null } } : {}),
        ...(searchIds !== null ? { id: { in: searchIds } } : {}),
      },
      orderBy: [
        { displayOrder: "asc" },
        { id: "desc" },
      ],
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

    // Her ürün için renk grubu kardeşlerini ekle
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