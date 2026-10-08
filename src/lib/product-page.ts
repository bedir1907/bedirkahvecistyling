import { cache } from "react"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isMissingColumnError } from "@/lib/db-errors"
import { slugifyTr as slugify } from "@/lib/product-url"
import { containsFolded, nameWithColor, normalizeCaps, normalizeSentenceCaps } from "@/lib/text"
import { SITE_NAME, truncateDescription } from "@/lib/seo"

/**
 * Ürün sayfası (/urun/[slug]) sunucu tarafı veri katmanı.
 * generateMetadata ve sayfa aynı istekte `cache()` sayesinde sorguları paylaşır.
 */

// ── Tipler (client bileşene prop olarak gider → serileştirilebilir olmalı) ────

export type ProductPageImage = {
  id: number
  url: string
  alt: string | null
  color: string | null
  sortOrder: number
  isCover: boolean
}

export type ProductPageVariant = {
  id: number
  size: string
  stock: number
  sku: string | null
}

export type ProductPageSibling = {
  id: number
  name: string
  slug: string
  color: string | null
  image: string
  price: number
  oldPrice: number | null
}

export type ProductPageProduct = {
  id: number
  productCode: string
  name: string
  slug: string
  color: string | null
  groupCode: string | null
  price: number
  oldPrice: number | null
  image: string
  category: string
  description: string
  isNew: boolean
  images: ProductPageImage[]
  productVariants: ProductPageVariant[]
  siblingProducts: ProductPageSibling[]
  categorySlug: string | null
}

export type ProductPageData = {
  product: ProductPageProduct
  /** Admin'den girilen SEO alanları (boşsa otomatik üretilir). */
  metaTitle: string | null
  metaDescription: string | null
  /** Aktif koleksiyondan gelen en yüksek "sepette %X" indirimi. */
  collectionDiscount: number | null
  /** Ürünün kendi stoğu (varyant yoksa kullanılır). */
  stock: number
}

// ── Sorgular ──────────────────────────────────────────────────────────────────

const productSelect = {
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
  isNew: true,
  isActive: true,
  stock: true,
  images: {
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
    select: { id: true, url: true, alt: true, color: true, sortOrder: true, isCover: true },
  },
  productVariants: {
    orderBy: [{ size: "asc" }],
    select: { id: true, size: true, stock: true, sku: true },
  },
} satisfies Prisma.ProductSelect

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }> & {
  metaTitle: string | null
  metaDescription: string | null
}

// metaTitle/metaDescription kolonları canlı DB'ye henüz eklenmemişse (prisma/seo_fields_migration.sql
// uygulanmadan) sorgu P2022 ile patlar → SEO alanları olmadan devam edilir.
async function findProductRow(where: Prisma.ProductWhereUniqueInput): Promise<ProductRow | null> {
  try {
    return await prisma.product.findUnique({
      where,
      select: { ...productSelect, metaTitle: true, metaDescription: true },
    })
  } catch (error) {
    if (!isMissingColumnError(error)) throw error
    console.warn("Product.metaTitle/metaDescription DB'de yok (prisma/seo_fields_migration.sql uygulanmalı).")
    const row = await prisma.product.findUnique({ where, select: productSelect })
    return row ? { ...row, metaTitle: null, metaDescription: null } : null
  }
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export type ProductLookup =
  | { kind: "found"; data: ProductPageData }
  | { kind: "redirect"; slug: string }
  | { kind: "notFound" }

/**
 * `/urun/{param}` çözümleme:
 *  1. Birebir slug eşleşmesi → ürün
 *  2. Sayısal param (ör. /urun/42) → id ile bulunup kanonik slug'a yönlendirilir
 *  3. Slug'ın normalize hali (büyük harf/Türkçe karakter/boşluk farkı) tek bir ürüne denk geliyorsa → yönlendirme
 *  4. Aksi halde 404
 * Pasif ürünler 404 döner.
 */
export const lookupProduct = cache(async (rawParam: string): Promise<ProductLookup> => {
  const param = safeDecode(rawParam).trim()
  if (!param) return { kind: "notFound" }

  const row = await findProductRow({ slug: param })
  if (row) {
    if (!row.isActive) return { kind: "notFound" }
    return { kind: "found", data: await buildPageData(row) }
  }

  if (/^\d+$/.test(param)) {
    const byId = await prisma.product.findUnique({
      where: { id: Number(param) },
      select: { slug: true, isActive: true },
    })
    if (byId?.isActive && byId.slug) return { kind: "redirect", slug: byId.slug }
    return { kind: "notFound" }
  }

  const wanted = slugify(param)
  if (wanted) {
    const candidates = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    const matches = candidates.filter((c) => slugify(c.slug) === wanted)
    if (matches.length === 1 && matches[0].slug !== param) {
      return { kind: "redirect", slug: matches[0].slug }
    }
  }

  return { kind: "notFound" }
})

async function buildPageData(row: ProductRow): Promise<ProductPageData> {
  const [category, siblings, discountCollections] = await Promise.all([
    prisma.category.findFirst({
      where: { name: row.category, isActive: true },
      select: { slug: true },
    }),
    row.groupCode
      ? prisma.product.findMany({
          where: { groupCode: row.groupCode, isActive: true, NOT: { id: row.id } },
          orderBy: [{ color: "asc" }, { id: "asc" }],
          select: { id: true, name: true, slug: true, color: true, image: true, price: true, oldPrice: true },
        })
      : Promise.resolve([]),
    prisma.collection.findMany({
      where: {
        isActive: true,
        discount: { not: null },
        products: { some: { productId: row.id } },
      },
      select: { discount: true },
    }),
  ])

  const discounts = discountCollections
    .map((c) => c.discount)
    .filter((d): d is number => typeof d === "number" && d > 0)

  return {
    product: {
      id: row.id,
      productCode: row.productCode,
      name: row.name,
      slug: row.slug,
      color: row.color,
      groupCode: row.groupCode,
      price: row.price,
      oldPrice: row.oldPrice,
      image: row.image,
      category: row.category,
      description: row.description,
      isNew: row.isNew,
      images: row.images,
      productVariants: row.productVariants,
      siblingProducts: siblings,
      categorySlug: category?.slug ?? null,
    },
    metaTitle: row.metaTitle?.trim() || null,
    metaDescription: row.metaDescription?.trim() || null,
    collectionDiscount: discounts.length > 0 ? Math.max(...discounts) : null,
    stock: row.stock,
  }
}

/** Aynı kategoriden (aynı model grubu hariç) birkaç ürün — sayfada iç link olarak gösterilir. */
export const getRelatedProducts = cache(
  async (productId: number, category: string, groupCode: string | null, take = 4) => {
    const rows = await prisma.product.findMany({
      where: {
        isActive: true,
        category,
        NOT: [{ id: productId }, ...(groupCode ? [{ groupCode }] : [])],
      },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      take,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        oldPrice: true,
        image: true,
        color: true,
        category: true,
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 1,
          select: { url: true },
        },
      },
    })
    return rows.map((r) => ({ ...r, image: r.images[0]?.url || r.image }))
  }
)

export const getShippingSettings = cache(async () =>
  prisma.shippingSettings
    .findFirst({ where: { isActive: true }, orderBy: { id: "asc" }, select: { fee: true, freeAbove: true } })
    .catch(() => null)
)

// ── SEO metinleri ─────────────────────────────────────────────────────────────

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

/** Bedenleri doğal sırasına koyar (harf bedenler XS→5XL, sayılar küçükten büyüğe). */
export function sortSizeLabels(sizes: string[]) {
  const unique = [...new Set(sizes.map((s) => s.trim()).filter(Boolean))]
  return unique.sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase())
    const bi = SIZE_ORDER.indexOf(b.toUpperCase())
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" })
  })
}

/** Stokta olan bedenler (varyant yoksa boş). */
export function inStockSizes(product: { productVariants: Array<{ size: string; stock: number }> }) {
  return sortSizeLabels(product.productVariants.filter((v) => v.stock > 0).map((v) => v.size))
}

function priceText(amount: number) {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount)} TL`
}

/** SEO yüzeylerinde (title, OG, JSON-LD, breadcrumb) kullanılacak ürün adı: başlık düzeninde + renk. */
export function productSeoName(product: { name: string; color: string | null }) {
  return nameWithColor(normalizeCaps(product.name), product.color ? normalizeCaps(product.color) : null)
}

/**
 * Açıklaması boş ürünler için olgusal (malzeme vb. uydurmayan) otomatik açıklama.
 * Ör: "Oversize Oysho Basic Tişört — Beyaz renk. Bedir Kahveci Styling erkek tişört koleksiyonundan.
 *      S, M, L ve XL beden seçenekleriyle 650 TL. Güvenli ödeme ve 14 gün içinde kolay iade."
 */
export function buildAutoDescription(product: {
  name: string
  color: string | null
  category: string
  price: number
  productVariants: Array<{ size: string; stock: number }>
}) {
  const name = normalizeCaps(product.name)
  const color = product.color ? normalizeCaps(product.color) : ""
  const category = normalizeCaps(product.category)

  let first = name
  if (color && !containsFolded(product.name, product.color)) {
    const needsRenk = !/\b(renk|rengi|renkli)\b/i.test(color.toLocaleLowerCase("tr-TR"))
    first += ` — ${color}${needsRenk ? " renk" : ""}`
  }

  const categoryPhrase =
    category && !containsFolded(product.name, product.category)
      ? `erkek ${category.toLocaleLowerCase("tr-TR")} koleksiyonundan`
      : "erkek giyim koleksiyonundan"

  const sizes = inStockSizes(product)
  const sizeList =
    sizes.length > 1 ? `${sizes.slice(0, -1).join(", ")} ve ${sizes[sizes.length - 1]}` : sizes[0] ?? ""
  const offer = sizeList
    ? `${sizeList} beden seçenekleriyle ${priceText(product.price)}.`
    : `Fiyat: ${priceText(product.price)}.`

  return `${first}. ${SITE_NAME} ${categoryPhrase}. ${offer} Güvenli ödeme ve 14 gün içinde kolay iade.`
}

/** Meta description: admin girdisi > ürün açıklaması > otomatik açıklama (~155 karakter). */
export function productMetaDescription(data: ProductPageData, autoDescription: string) {
  if (data.metaDescription?.trim()) return truncateDescription(data.metaDescription)
  const text = normalizeSentenceCaps(data.product.description)
  if (!text.trim()) return truncateDescription(autoDescription)
  // Aynı modelin renkleri genelde aynı açıklamayı paylaşır → ürün adı (+renk) önek: her sayfaya özgü açıklama
  const name = productSeoName(data.product)
  return truncateDescription(containsFolded(text, name) ? text : `${name}: ${text}`)
}
