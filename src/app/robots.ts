import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/seo"

/**
 * Notlar:
 * - Sepet, ödeme, hesap, giriş/kayıt vb. sayfalar burada engellenmez; bu sayfalar
 *   `noindex` meta etiketi taşır. robots.txt ile engellenirse Google `noindex`i göremez
 *   ve URL'yi içeriksiz olarak indeksleyebilir.
 * - Yönetim paneli yolu bilerek burada listelenmez (robots.txt herkese açıktır);
 *   panel layout'u `noindex, nofollow` döner.
 * - Mağaza sayfaları içeriklerini client tarafında aşağıdaki herkese açık API'lerden
 *   çektiği için bu uçlar Googlebot'un sayfayı render edebilmesi adına açık bırakılır.
 * - /feed/ (Google Merchant ürün feed'i) engellenmemelidir.
 */
const PUBLIC_API_PATHS = [
  "/api/products",
  "/api/categories",
  "/api/collections",
  "/api/homepage",
  "/api/site-pages",
  "/api/shipping",
  "/api/social",
  "/api/announcement",
]

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", ...PUBLIC_API_PATHS],
        disallow: ["/api/", "/arama"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
