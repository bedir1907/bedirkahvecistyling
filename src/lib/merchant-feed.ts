/**
 * Google Merchant Center (ve Meta katalog) ürün feed'i üretici.
 *
 * Bu dosya bilinçli olarak saf (DB/Next bağımsız) tutuldu: veriyi route handler
 * çeker, burada yalnızca XML'e dönüştürülür.
 *
 * Veri modeli notları:
 *  - Her `Product` satırı tek bir renktir (`color`); aynı modelin farklı renkleri
 *    `groupCode` ile gruplanır. Ürün sayfası: /urun/{slug}
 *  - Bedenler ve stok `ProductVariant` (productId bağlı) satırlarındadır.
 *  - Fiyatlar TL cinsinden tam sayıdır (kuruş değil) — iyzico'ya da TL gönderiliyor.
 *  - `oldPrice > price` ise ürün indirimlidir (sitede eski fiyat üstü çizili).
 */

import { foldKey, normalizeCaps } from "./text"
import { productPath } from "./product-url"

export { normalizeCaps }

export const MERCHANT_BRAND = "Bedir Kahveci Styling"

export function getSiteBaseUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "")
  if (raw && /^https?:\/\//i.test(raw)) return raw
  return "https://www.bedirkahvecistyling.com"
}

export type FeedVariant = {
  id: number
  size: string
  stock: number
  sku: string | null
}

export type FeedImage = {
  url: string
  isCover: boolean
  sortOrder: number
}

export type FeedProduct = {
  id: number
  slug: string
  productCode: string
  name: string
  color: string | null
  groupCode: string | null
  price: number
  oldPrice: number | null
  image: string
  category: string
  description: string
  stock: number
  images: FeedImage[]
  productVariants: FeedVariant[]
}

export type FeedShipping = {
  fee: number
  freeAbove: number | null
} | null

export type FeedOptions = {
  baseUrl: string
  shipping: FeedShipping
  /** Site kategori adları (Category tablosu) — product_type'ta düzgün yazım için */
  categoryNames?: string[]
}

// ── Metin yardımcıları ───────────────────────────────────────────────────────

/** XML 1.0'da geçersiz kontrol karakterlerini atar ve & < > " ' kaçışlarını yapar. */
export function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

/** HTML etiketlerini temizler, entity'leri çözer, boşlukları sadeleştirir. */
export function stripHtml(value: string): string {
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    .replace(/[ \t\u00A0]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim()
}

function truncate(value: string, max: number): string {
  const chars = Array.from(value)
  if (chars.length <= max) return value
  return chars.slice(0, max - 1).join("").trimEnd() + "…"
}

/** g:id / item_group_id için güvenli (ASCII, ≤50 karakter) kimlik parçası. */
function idPart(value: string): string {
  return foldKey(value).replace(/\s+/g, "-").toUpperCase() || "X"
}

// ── URL yardımcıları ─────────────────────────────────────────────────────────

function absoluteUrl(url: string | null | undefined, baseUrl: string): string | null {
  const value = (url || "").trim()
  if (!value) return null
  if (value.startsWith("//")) return `https:${value}`
  if (/^http:\/\//i.test(value)) return value.replace(/^http:\/\//i, "https://")
  if (/^https:\/\//i.test(value)) return value
  if (value.startsWith("/")) return `${baseUrl}${value}`
  return `${baseUrl}/${value}`
}

// ── Kategori eşlemesi ────────────────────────────────────────────────────────

/**
 * Site kategorisi → Google ürün kategorisi (taxonomy ID).
 *  1604 Apparel & Accessories > Clothing
 *  212  … > Clothing > Shirts & Tops (gömlek, tişört, sweatshirt, hırka, kazak)
 *  204  … > Clothing > Pants (pantolon, jean, eşofman altı)
 *  207  … > Clothing > Shorts
 *  5598 … > Clothing > Outerwear > Coats & Jackets (ceket, mont, kaban)
 *  203  … > Clothing > Outerwear (yelek vb.)
 *  1594 … > Clothing > Suits (takım elbise)
 *  5322 … > Clothing > Activewear (eşofman takımı)
 *  167  Apparel & Accessories > Clothing Accessories
 */
const CATEGORY_RULES: Array<{ match: RegExp; id: string }> = [
  { match: /esofman takim|esofman seti|spor takim/, id: "5322" },
  { match: /takim elbise|takim/, id: "1594" },
  { match: /esofman alti|pantolon|jean|denim|jogger|kargo/, id: "204" },
  { match: /(^| )sort( |$)|bermuda/, id: "207" },
  { match: /ceket|mont|kaban|blazer|parka|palto|trenckot|yagmurluk/, id: "5598" },
  { match: /yelek/, id: "203" },
  {
    match: /gomlek|muslim|tisort|t shirt|tshirt|sweat|hirka|kazak|triko|polo|atlet|bluz|hoodie|kapson|body/,
    id: "212",
  },
  { match: /aksesuar|kemer|sapka|bere|atki|kravat|cuzdan|canta|corap/, id: "167" },
]

export function mapGoogleCategory(category: string): string {
  const key = foldKey(category)
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(key)) return rule.id
  }
  return "1604"
}

// ── Beden sıralaması (ürün sayfasıyla aynı mantık) ───────────────────────────

const LETTER_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL"]

function sizeRank(size: string): number {
  const upper = size.trim().toUpperCase()
  const idx = LETTER_ORDER.indexOf(upper)
  if (idx >= 0) return idx
  const num = Number(upper)
  if (Number.isFinite(num)) return 100 + num
  return 1000
}

// ── Feed üretimi ─────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} TRY`
}

function tag(name: string, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return ""
  return `      <g:${name}>${escapeXml(String(value))}</g:${name}>\n`
}

type ItemInput = {
  id: string
  groupId: string
  title: string
  description: string
  link: string
  imageLink: string
  additionalImages: string[]
  inStock: boolean
  price: number
  oldPrice: number | null
  googleCategory: string
  productType: string
  color: string | null
  size: string | null
  mpn: string
  shippingPrice: number | null
}

function renderItem(item: ItemInput): string {
  const onSale = item.oldPrice !== null && item.oldPrice > item.price
  let xml = "    <item>\n"
  xml += tag("id", item.id)
  xml += tag("item_group_id", item.groupId)
  xml += tag("title", item.title)
  xml += tag("description", item.description)
  xml += tag("link", item.link)
  xml += tag("image_link", item.imageLink)
  for (const extra of item.additionalImages) {
    xml += tag("additional_image_link", extra)
  }
  xml += tag("availability", item.inStock ? "in_stock" : "out_of_stock")
  if (onSale) {
    xml += tag("price", formatPrice(item.oldPrice as number))
    xml += tag("sale_price", formatPrice(item.price))
  } else {
    xml += tag("price", formatPrice(item.price))
  }
  xml += tag("brand", MERCHANT_BRAND)
  xml += tag("condition", "new")
  xml += tag("mpn", item.mpn)
  xml += tag("identifier_exists", "no")
  xml += tag("google_product_category", item.googleCategory)
  xml += tag("product_type", item.productType)
  xml += tag("gender", "male")
  xml += tag("age_group", "adult")
  xml += tag("color", item.color)
  if (item.size) {
    xml += tag("size", item.size)
    xml += tag("size_system", "TR")
  }
  if (item.shippingPrice !== null) {
    xml += "      <g:shipping>\n"
    xml += `        <g:country>TR</g:country>\n`
    xml += `        <g:price>${escapeXml(formatPrice(item.shippingPrice))}</g:price>\n`
    xml += "      </g:shipping>\n"
  }
  xml += "    </item>\n"
  return xml
}

export function buildMerchantFeedXml(products: FeedProduct[], options: FeedOptions): string {
  const baseUrl = options.baseUrl.replace(/\/+$/, "")
  const categoryLookup = new Map<string, string>()
  for (const name of options.categoryNames ?? []) {
    categoryLookup.set(foldKey(name), name)
  }

  const items: string[] = []

  for (const product of products) {
    if (!Number.isFinite(product.price) || product.price <= 0) continue

    const sortedImages = [...product.images].sort(
      (a, b) => Number(b.isCover) - Number(a.isCover) || a.sortOrder - b.sortOrder
    )
    const allImages: string[] = []
    for (const url of [product.image, ...sortedImages.map((img) => img.url)]) {
      const abs = absoluteUrl(url, baseUrl)
      if (abs && !allImages.includes(abs)) allImages.push(abs)
    }
    const imageLink = allImages[0]
    if (!imageLink) continue // image_link zorunlu
    const additionalImages = allImages.slice(1, 11)

    const name = normalizeCaps(product.name)
    const color = product.color ? normalizeCaps(product.color) : null
    const categoryName =
      categoryLookup.get(foldKey(product.category)) ?? normalizeCaps(product.category)
    const productType = categoryName ? `Erkek Giyim > ${categoryName}` : "Erkek Giyim"
    const googleCategory = mapGoogleCategory(product.category)

    const baseTitle =
      color && !foldKey(name).includes(foldKey(color)) ? `${name} - ${color}` : name

    const rawDescription = stripHtml(product.description || "")
    const description = truncate(
      rawDescription ||
        `${baseTitle}. ${MERCHANT_BRAND} erkek ${
          categoryName ? categoryName.toLocaleLowerCase("tr-TR") : "giyim"
        } koleksiyonundan.`,
      5000
    )

    const groupId = truncate(idPart(product.groupCode || product.productCode), 50)
    const productLink = `${baseUrl}${productPath(product.slug, product.id)}`

    // Aynı beden birden fazla kez girilmişse stokları birleştir
    const sizeMap = new Map<string, { size: string; stock: number; sku: string | null }>()
    for (const variant of product.productVariants) {
      const size = (variant.size || "").trim()
      if (!size) continue
      const key = size.toUpperCase()
      const existing = sizeMap.get(key)
      if (existing) {
        existing.stock += Math.max(0, variant.stock || 0)
        existing.sku = existing.sku || variant.sku
      } else {
        sizeMap.set(key, { size, stock: Math.max(0, variant.stock || 0), sku: variant.sku })
      }
    }
    const variants = [...sizeMap.values()].sort((a, b) => sizeRank(a.size) - sizeRank(b.size))

    const shippingPrice = options.shipping
      ? options.shipping.freeAbove !== null && product.price >= options.shipping.freeAbove
        ? 0
        : Math.max(0, options.shipping.fee)
      : null

    const common = {
      groupId,
      description,
      imageLink,
      additionalImages,
      price: product.price,
      oldPrice: product.oldPrice,
      googleCategory,
      productType,
      color,
      shippingPrice,
    }

    if (variants.length === 0) {
      items.push(
        renderItem({
          ...common,
          id: truncate(idPart(product.productCode), 50),
          title: truncate(baseTitle, 150),
          link: productLink,
          inStock: product.stock > 0,
          size: null,
          mpn: product.productCode,
        })
      )
      continue
    }

    for (const variant of variants) {
      items.push(
        renderItem({
          ...common,
          id: truncate(`${idPart(product.productCode)}-${idPart(variant.size)}`, 50),
          title: truncate(`${baseTitle} - Beden ${variant.size}`, 150),
          link: `${productLink}?size=${encodeURIComponent(variant.size)}`,
          inStock: variant.stock > 0,
          size: variant.size,
          mpn: variant.sku?.trim() || product.productCode,
        })
      )
    }
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>${escapeXml(MERCHANT_BRAND)}</title>\n` +
    `    <link>${escapeXml(baseUrl)}</link>\n` +
    `    <description>${escapeXml(`${MERCHANT_BRAND} erkek giyim ürün feed'i`)}</description>\n` +
    items.join("") +
    `  </channel>\n` +
    `</rss>\n`
  )
}
