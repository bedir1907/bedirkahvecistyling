import { prisma } from "@/lib/prisma"
import { buildMerchantFeedXml, getSiteBaseUrl } from "@/lib/merchant-feed"

/**
 * Google Merchant Center ürün feed'i: /feed/google-merchant.xml
 * (Aynı feed Meta/Facebook katalogunda da "veri akışı URL'si" olarak kullanılabilir.)
 *
 * Her istekte DB'den üretilir (build sırasında DB gerekmez), CDN/proxy katmanında
 * 15 dk önbelleklenir. Böylece yeni eklenen aktif ürünler en geç ~15 dk içinde feed'e düşer.
 */
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const [products, shipping, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          slug: true,
          productCode: true,
          name: true,
          color: true,
          groupCode: true,
          price: true,
          oldPrice: true,
          image: true,
          category: true,
          description: true,
          stock: true,
          images: {
            select: { url: true, isCover: true, sortOrder: true },
          },
          productVariants: {
            select: { id: true, size: true, stock: true, sku: true },
          },
        },
      }),
      prisma.shippingSettings.findFirst({
        where: { isActive: true },
        orderBy: { id: "asc" },
        select: { fee: true, freeAbove: true },
      }),
      prisma.category.findMany({ select: { name: true } }),
    ])

    const xml = buildMerchantFeedXml(products, {
      baseUrl: getSiteBaseUrl(),
      shipping,
      categoryNames: categories.map((c) => c.name),
    })

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
        "X-Robots-Tag": "noindex",
      },
    })
  } catch (error) {
    console.error("Merchant feed hatası:", error)
    return new Response("Feed geçici olarak oluşturulamadı", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "300",
      },
    })
  }
}
