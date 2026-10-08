import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { absoluteUrl, categoryPath, collectionPath, productPath } from "@/lib/seo"

export const revalidate = 3600

// Veritabanında kaydı olmayan, kod içinde tanımlı ürün listeleri (bkz. category/[slug]/page.tsx).
// "en-yeniler" new-season'ın kopyası olduğundan (canonical → new-season) listelenmez.
const VIRTUAL_CATEGORY_SLUGS = ["new-season", "indirimdekiler", "haftanin-urunleri"]

// İçeriği kodda duran bilgi sayfaları (lastModified bilinmediği için verilmez).
const STATIC_PAGES: Array<{ path: string; changeFrequency: "monthly" | "yearly"; priority: number }> = [
  { path: "/sikca-sorulan-sorular", changeFrequency: "monthly", priority: 0.4 },
  { path: "/iade-ve-degisim", changeFrequency: "monthly", priority: 0.3 },
  { path: "/kargo-ve-teslimat", changeFrequency: "monthly", priority: 0.3 },
  { path: "/cerez-politikasi", changeFrequency: "yearly", priority: 0.2 },
  { path: "/kvkk", changeFrequency: "yearly", priority: 0.2 },
  { path: "/mesafeli-satis-on-bilgilendirme", changeFrequency: "yearly", priority: 0.2 },
  { path: "/mesafeli-satis-sozlesmesi", changeFrequency: "yearly", priority: 0.2 },
]

// Admin panelinden düzenlenen bilgi sayfaları (SitePage.key → URL).
const SITE_PAGE_ROUTES: Record<string, string> = {
  about: "/hakkimizda",
  contact: "/iletisim",
}

// Next.js sitemap XML'ini üretirken URL'leri kaçışlamaz; Cloudinary vb. URL'lerdeki "&" XML'i bozmasın.
function xmlSafe(url: string) {
  return url
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function latest(...dates: Array<Date | null | undefined>) {
  const valid = dates.filter((d): d is Date => d instanceof Date && !Number.isNaN(d.getTime()))
  if (valid.length === 0) return undefined
  return new Date(Math.max(...valid.map((d) => d.getTime())))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, sitePages, homepage] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        image: true,
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          select: { url: true },
          take: 10,
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.collection.findMany({
      // Ürünsüz koleksiyonlar noindex — sitemap'e girmez
      where: { isActive: true, products: { some: { product: { isActive: true } } } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.sitePage.findMany({
      where: { key: { in: Object.keys(SITE_PAGE_ROUTES) } },
      select: { key: true, updatedAt: true },
    }),
    prisma.homepageSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: { updatedAt: true },
    }),
  ])

  const latestProductUpdate = latest(...products.map((p) => p.updatedAt))

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: latest(homepage?.updatedAt, latestProductUpdate),
      changeFrequency: "daily",
      priority: 1,
    },
  ]

  for (const slug of VIRTUAL_CATEGORY_SLUGS) {
    entries.push({
      url: absoluteUrl(categoryPath(slug)),
      lastModified: latestProductUpdate,
      changeFrequency: "daily",
      priority: 0.8,
    })
  }

  for (const c of categories) {
    entries.push({
      url: absoluteUrl(categoryPath(c.slug)),
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  }

  for (const c of collections) {
    entries.push({
      url: absoluteUrl(collectionPath(c.slug)),
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  }

  for (const p of products) {
    const images = [...new Set([p.image, ...p.images.map((img) => img.url)].filter(Boolean))]
      .map((url) => absoluteUrl(url))
    entries.push({
      url: absoluteUrl(productPath(p.slug, p.id)),
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
      ...(images.length > 0 ? { images } : {}),
    })
  }

  for (const page of sitePages) {
    entries.push({
      url: absoluteUrl(SITE_PAGE_ROUTES[page.key]),
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.4,
    })
  }

  for (const page of STATIC_PAGES) {
    entries.push({
      url: absoluteUrl(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })
  }

  // Aynı URL'nin iki kez yazılmasını önle (ör. sanal slug ile aynı slug'a sahip DB kategorisi).
  const seen = new Set<string>()
  return entries
    .filter((entry) => {
      if (seen.has(entry.url)) return false
      seen.add(entry.url)
      return true
    })
    .map((entry) => ({
      ...entry,
      url: xmlSafe(entry.url),
      ...(entry.images ? { images: entry.images.map(xmlSafe) } : {}),
    }))
}
