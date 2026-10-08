import type { Metadata } from "next"

/**
 * Storefront SEO yardımcıları.
 *
 * Canonical/sitemap/robots/JSON-LD URL'leri için tek kaynak burasıdır.
 * (Ödeme/e-posta callback'leri için `getTrustedBaseUrl` — src/lib/base-url.ts — kullanılmaya devam eder.)
 */

export const SITE_NAME = "Bedir Kahveci Styling"
export const SITE_DESCRIPTION =
  "Bedir Kahveci Styling ile modern erkek giyim: sade, güçlü ve güven veren bir alışveriş deneyimi. Güvenli ödeme ve kolay iade."
export const SITE_LOCALE = "tr_TR"
export const SITE_EMAIL = "info@bedirkahvecistyling.com"
export const SITE_PHONE = "+90 553 136 12 61"

/** src/app/opengraph-image.tsx tarafından üretilen varsayılan paylaşım görseli. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
}

const DEFAULT_SITE_URL = "https://www.bedirkahvecistyling.com"

function cleanSiteUrl(value?: string | null) {
  if (!value) return null
  const normalized = String(value).trim().replace(/\/+$/, "")
  if (!normalized || normalized === "null" || normalized === "undefined") return null
  try {
    return new URL(normalized).origin
  } catch {
    return null
  }
}

/** Sitenin kanonik kök adresi (sonunda "/" olmadan). */
export function getSiteUrl() {
  return cleanSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || DEFAULT_SITE_URL
}

/** Göreli bir yolu (veya zaten mutlak bir URL'yi) mutlak URL'ye çevirir. */
export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path
  const base = getSiteUrl()
  if (!path || path === "/") return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export { productPath } from "./product-url"

export function categoryPath(slug: string) {
  return `/category/${slug}`
}

export function collectionPath(slug: string) {
  return `/collections/${slug}`
}

/** Meta description için metni sadeleştirip ~155 karaktere kırpar. */
export function truncateDescription(text: string | null | undefined, max = 155) {
  const clean = String(text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:!?-]+$/, "")}…`
}

/** JSON-LD'yi <script> içine güvenle gömmek için serileştirir ("<" kaçışlanır). */
export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

/** Arama motorlarına kapalı (özel/işlem) sayfalar için metadata. */
export function noIndexMetadata(title: string, follow = false): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow,
      googleBot: { index: false, follow },
    },
  }
}

type PageMetadataInput = {
  title: string
  description: string
  path: string
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
  type?: "website" | "article"
}

/**
 * Indekslenecek sayfalar için ortak metadata: title, description, canonical,
 * Open Graph ve Twitter. `images` verilmezse varsayılan opengraph-image kullanılır
 * (alt segmentte openGraph tanımlanınca root'taki dosya-tabanlı görsel miras alınmaz).
 */
export function pageMetadata({ title, description, path, images, type = "website" }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  const ogImages = images && images.length > 0 ? images : [DEFAULT_OG_IMAGE]
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  }
}

type BreadcrumbItem = { name: string; path: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function organizationJsonLd(sameAs: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}/#organization`,
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl("/bk-logo.svg"),
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Yeniköy Mah. Amiral Şükrü Okan Cad. Altay Apartmanı No:26",
      addressLocality: "Tirebolu",
      addressRegion: "Giresun",
      postalCode: "28500",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: SITE_EMAIL,
      telephone: SITE_PHONE,
      areaServed: "TR",
      availableLanguage: ["Turkish"],
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function websiteJsonLd() {
  const base = getSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE_NAME,
    url: base,
    inLanguage: "tr-TR",
    publisher: { "@id": `${base}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

type ItemListEntry = { name: string; path: string; image?: string | null }

/**
 * Kategori/koleksiyon sayfaları için ItemList (ürün URL'leri). `path` için `productPath()` kullanılır.
 * Liste çok uzunsa ilk `max` ürün yazılır (JSON-LD'yi şişirmemek için).
 */
export function itemListJsonLd(items: ItemListEntry[], options: { name?: string; max?: number } = {}) {
  return { "@context": "https://schema.org", ...buildItemList(items, options) }
}

function buildItemList(items: ItemListEntry[], { name, max = 60 }: { name?: string; max?: number }) {
  const list = items.slice(0, max)
  return {
    "@type": "ItemList",
    ...(name ? { name } : {}),
    numberOfItems: list.length,
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.path),
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  }
}

/** Kategori/koleksiyon liste sayfası (CollectionPage) + içindeki ürün listesi. */
export function collectionPageJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string
  description?: string | null
  path: string
  items: ItemListEntry[]
}) {
  const base = getSiteUrl()
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    ...(description ? { description } : {}),
    inLanguage: "tr-TR",
    isPartOf: { "@id": `${base}/#website` },
    ...(items.length > 0 ? { mainEntity: buildItemList(items, { name }) } : {}),
  }
}

/** Admin'den girilen düz metni paragraf listesine çevirir (boş satır = yeni paragraf). */
export function textToParagraphs(text: string | null | undefined) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * Admin'den girilen özel meta başlık: marka adı içeriyorsa olduğu gibi (template'siz), aksi halde
 * root layout şablonuyla ("… | Bedir Kahveci Styling") kullanılır.
 */
export function customTitle(title: string): NonNullable<Metadata["title"]> {
  const clean = title.trim()
  return clean.toLocaleLowerCase("tr-TR").includes(SITE_NAME.toLocaleLowerCase("tr-TR")) ? { absolute: clean } : clean
}

/** Admin'den gelen opsiyonel SEO metni: trim, boşsa null, `max` karakterde kırpılır. */
export function cleanSeoText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null
  const clean = value.replace(/\r\n?/g, "\n").trim()
  return clean ? clean.slice(0, max) : null
}
