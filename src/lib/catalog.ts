import { cache } from "react"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { productPath } from "@/lib/seo"

/**
 * Kategori & koleksiyon sayfalarının sunucu tarafı veri katmanı.
 *
 * Sayfalar (SSR/ISR) ve generateMetadata aynı istekte `cache()` ile bu sorguları paylaşır;
 * böylece ilk HTML'de h1, ürün linkleri, adlar, fiyatlar ve görseller hazır gelir.
 */

/** Kategori/koleksiyon gridinde bir ürün kartı için gereken veri (client bileşene prop olarak gider). */
export type ListingProduct = {
  id: number
  name: string
  slug: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  /** Kanonik ürün yolu (sorgu parametresiz) — ItemList JSON-LD ve kart linki için. */
  path: string
  /** Ürünün dahil olduğu indirimli koleksiyondan gelen "sepette %X" oranı. */
  collectionDiscount: number | null
}

const listingProductSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  oldPrice: true,
  image: true,
  category: true,
} satisfies Prisma.ProductSelect

type ListingProductRow = Prisma.ProductGetPayload<{ select: typeof listingProductSelect }>

function toListingProduct(row: ListingProductRow, collectionDiscount: number | null): ListingProduct {
  return {
    ...row,
    path: productPath(row.slug, row.id),
    collectionDiscount,
  }
}

/**
 * Yeni eklenen SEO kolonları (Category.description/metaTitle/metaDescription, Collection.metaTitle/
 * metaDescription) canlı DB'ye henüz uygulanmamışsa sorgu "column does not exist" (P2022) ile patlar.
 * Mağaza sayfaları bu durumda SEO alanları olmadan çalışmaya devam etsin diye yedek sorguya düşülür.
 */
function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const code = (error as { code?: unknown }).code
  const message = String((error as { message?: unknown }).message ?? "")
  return code === "P2022" || /column .* does not exist/i.test(message)
}

async function withSeoFallback<T>(withSeo: () => Promise<T>, withoutSeo: () => Promise<T>) {
  try {
    return await withSeo()
  } catch (error) {
    if (!isMissingColumnError(error)) throw error
    console.warn("SEO kolonları DB'de yok (prisma/seo_fields_migration.sql uygulanmalı); SEO alanları olmadan devam ediliyor.")
    return withoutSeo()
  }
}

/** Ürün id'leri için en yüksek aktif koleksiyon ("sepette %X") indirimi haritası. */
export async function getCollectionDiscountMap(productIds: number[]): Promise<Record<number, number>> {
  const ids = productIds.filter((n) => Number.isFinite(n))
  if (ids.length === 0) return {}

  const collections = await prisma.collection.findMany({
    where: {
      isActive: true,
      discount: { not: null },
      products: { some: { productId: { in: ids } } },
    },
    select: {
      discount: true,
      products: {
        where: { productId: { in: ids } },
        select: { productId: true },
      },
    },
  })

  const discounts: Record<number, number> = {}
  for (const col of collections) {
    const d = col.discount ?? 0
    for (const cp of col.products) {
      if (d > (discounts[cp.productId] ?? 0)) discounts[cp.productId] = d
    }
  }
  return discounts
}

// ─── Kategoriler ────────────────────────────────────────────────────────────

type VirtualCategory = {
  name: string
  description: string
  /** Sayfa H1'i ve SEO alanları (DB'de aynı slug'lı kayıt varsa onunkiler önceliklidir). */
  heading?: string
  metaTitle?: string
  metaDescription?: string
  seoText?: string
  where: Prisma.ProductWhereInput
  /** Yinelenen içerik için arama motorlarına bildirilecek kanonik slug. */
  canonicalSlug?: string
}

/** DB'de karşılığı olmayan (ürün bayraklarıyla oluşan) sanal kategoriler. */
export const VIRTUAL_CATEGORIES: Record<string, VirtualCategory> = {
  "new-season": {
    name: "Yeni Sezon",
    description: "Bu sezonun en yeni erkek giyim ürünleri. Bedir Kahveci Styling yeni sezon koleksiyonu.",
    heading: "Yeni Sezon Erkek Giyim",
    metaTitle: "Yeni Sezon Erkek Giyim Koleksiyonu",
    metaDescription:
      "Yeni sezon erkek giyim: baggy pantolon, oversize sweatshirt, ceket ve mont modelleri. Sezonun yeni parçalarını keşfet, güvenli ödeme ve 14 gün kolay iade.",
    seoText: `Yeni sezon koleksiyonumuz, Bedir Kahveci Styling'e en son eklenen parçaları tek sayfada bir araya getirir. Rahat kesimli baggy pantolonlardan oversize sweatshirt ve hoodie modellerine, deri ve kadife montlardan eşofman takımlarına kadar sezonun öne çıkan erkek giyim ürünlerini burada bulabilirsin.

Koleksiyonu oluştururken sade, güçlü ve kolay kombinlenen parçaları seçiyoruz. Nötr ve toprak tonlarındaki ürünler birbirleriyle uyum içinde; böylece birkaç parçayla hem günlük hem de daha şık kombinler oluşturabilirsin.

Yeni ürünler eklendikçe bu sayfa güncellenir. Beğendiğin ürünü beden seçeneklerine göz atarak sepetine ekleyebilir, güvenli ödeme ile siparişini tamamlayabilirsin. Tüm siparişlerde 14 gün içinde kolay iade ve değişim imkânı vardır.`,
    where: { isNew: true },
  },
  indirimdekiler: {
    name: "İndirimdekiler",
    description: "İndirimli erkek giyim ürünleri. Bedir Kahveci Styling kampanyalı ürün koleksiyonu.",
    heading: "İndirimli Erkek Giyim",
    metaTitle: "İndirimli Erkek Giyim Ürünleri",
    metaDescription:
      "İndirimli erkek giyim ürünleri: pantolon, sweatshirt, ceket ve daha fazlası kampanyalı fiyatlarla. Stoklar tükenmeden keşfet, 14 gün kolay iade.",
    seoText: `İndirimdekiler sayfasında Bedir Kahveci Styling'in kampanyalı fiyatlarla sunduğu tüm erkek giyim ürünlerini bulabilirsin. Üstü çizili fiyat, ürünün indirim öncesi fiyatını; altındaki fiyat ise güncel satış fiyatını gösterir.

İndirimli ürünlerde de kalite ve kesim anlayışımız aynıdır: baggy kumaş pantolonlar, oversize sweatshirtler, ceket ve montlar gibi gardırobun temel parçalarını daha avantajlı fiyatlarla edinebilirsin. Kampanyalı ürünlerin stokları sınırlı olabileceğinden beden seçeneklerini kontrol etmeni öneririz.

İndirimli ürünlerde de güvenli ödeme ve 14 gün içinde kolay iade ve değişim imkânı geçerlidir.`,
    where: { oldPrice: { not: null } },
  },
  "haftanin-urunleri": {
    name: "Haftanın Ürünleri",
    description: "Bu haftanın öne çıkan erkek giyim ürünleri. Bedir Kahveci Styling seçkisi.",
    heading: "Haftanın Öne Çıkan Ürünleri",
    metaTitle: "Haftanın Öne Çıkan Erkek Giyim Ürünleri",
    metaDescription:
      "Bu haftanın öne çıkan erkek giyim ürünleri: Bedir Kahveci Styling ekibinin seçtiği pantolon, sweatshirt, ceket ve kombin parçaları. Hemen keşfet.",
    seoText: `Haftanın ürünleri, Bedir Kahveci Styling ekibinin her hafta öne çıkardığı parçalardan oluşan bir seçkidir. Sezona, hava durumuna ve en çok ilgi gören kombinlere göre güncellenen bu liste, ne giyeceğine karar verirken sana ilham olmayı amaçlar.

Seçkide birbiriyle kolayca kombinlenebilen parçalara yer veriyoruz: bir baggy pantolonu oversize bir sweatshirt ya da ceketle tamamlayarak dakikalar içinde derli toplu bir görünüm oluşturabilirsin.

Seçki her hafta yenilendiği için beğendiğin ürünleri favorilerine eklemeyi unutma. Tüm siparişlerde güvenli ödeme ve 14 gün içinde kolay iade imkânı vardır.`,
    where: { featured: true },
  },
  // "en-yeniler" ile "new-season" aynı listeyi gösterir → kanonik adres "new-season".
  "en-yeniler": {
    name: "En Yeniler",
    description: "En yeni eklenen erkek giyim ürünleri. Bedir Kahveci Styling yeni ürünleri.",
    where: { isNew: true },
    canonicalSlug: "new-season",
  },
}

const categoryBaseSelect = {
  id: true,
  name: true,
  slug: true,
  image: true,
  video: true,
} satisfies Prisma.CategorySelect

export type CategoryRecord = {
  id: number
  name: string
  slug: string
  image: string | null
  video: string | null
  description: string | null
  heading: string | null
  metaTitle: string | null
  metaDescription: string | null
}

const getCategoryRecord = cache(async (slug: string): Promise<CategoryRecord | null> =>
  withSeoFallback(
    () =>
      prisma.category.findFirst({
        where: { slug, isActive: true },
        select: { ...categoryBaseSelect, description: true, heading: true, metaTitle: true, metaDescription: true },
      }),
    async () => {
      const row = await prisma.category.findFirst({ where: { slug, isActive: true }, select: categoryBaseSelect })
      return row ? { ...row, description: null, heading: null, metaTitle: null, metaDescription: null } : null
    }
  )
)

export type CategoryPageData = {
  category: CategoryRecord
  /** Sanal kategori mi (new-season, indirimdekiler...) */
  isVirtual: boolean
  /** Otomatik meta açıklama metni (metaDescription/description yoksa). */
  autoDescription: string | null
  canonicalSlug: string
}

/**
 * Kategori başlık verisi (metadata ve sayfa paylaşır). Sanal kategoride DB'de aynı slug'lı bir
 * kategori kaydı varsa görsel/video/açıklama/meta alanları oradan alınır, ad sabit kalır.
 */
export const getCategoryPageData = cache(async (slug: string): Promise<CategoryPageData | null> => {
  const virtual = VIRTUAL_CATEGORIES[slug]
  const record = await getCategoryRecord(slug)

  if (virtual) {
    return {
      category: {
        id: record?.id ?? -1,
        slug,
        image: record?.image ?? null,
        video: record?.video ?? null,
        description: record?.description ?? virtual.seoText ?? null,
        heading: record?.heading ?? virtual.heading ?? null,
        metaTitle: record?.metaTitle ?? virtual.metaTitle ?? null,
        metaDescription: record?.metaDescription ?? virtual.metaDescription ?? null,
        name: virtual.name,
      },
      isVirtual: true,
      autoDescription: virtual.description,
      canonicalSlug: virtual.canonicalSlug ?? slug,
    }
  }

  if (!record) return null
  return { category: record, isVirtual: false, autoDescription: null, canonicalSlug: slug }
})

/** Kategori sayfasındaki ürünler (+ koleksiyon indirim oranları). /api/products ile aynı filtre ve sıralama. */
export const getCategoryProducts = cache(async (slug: string): Promise<ListingProduct[]> => {
  const virtual = VIRTUAL_CATEGORIES[slug]
  let where: Prisma.ProductWhereInput

  if (virtual) {
    where = { isActive: true, ...virtual.where }
  } else {
    const data = await getCategoryPageData(slug)
    if (!data) return []
    // Ürünler kategoriye ad üzerinden bağlı (Product.category = Category.name)
    where = { isActive: true, category: data.category.name }
  }

  const rows = await prisma.product.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
    select: listingProductSelect,
  })

  const discounts = await getCollectionDiscountMap(rows.map((r) => r.id))
  return rows.map((row) => toListingProduct(row, discounts[row.id] ?? null))
})

// ─── Koleksiyonlar ──────────────────────────────────────────────────────────

const collectionBaseSelect = {
  id: true,
  name: true,
  slug: true,
  eyebrow: true,
  description: true,
  image: true,
  video: true,
  discount: true,
} satisfies Prisma.CollectionSelect

export type CollectionRecord = Prisma.CollectionGetPayload<{ select: typeof collectionBaseSelect }> & {
  metaTitle: string | null
  metaDescription: string | null
}

export const getCollectionRecord = cache(async (slug: string): Promise<CollectionRecord | null> =>
  withSeoFallback(
    () =>
      prisma.collection.findFirst({
        where: { slug, isActive: true },
        select: { ...collectionBaseSelect, metaTitle: true, metaDescription: true },
      }),
    async () => {
      const row = await prisma.collection.findFirst({ where: { slug, isActive: true }, select: collectionBaseSelect })
      return row ? { ...row, metaTitle: null, metaDescription: null } : null
    }
  )
)

/** Koleksiyondaki aktif ürünler; her birine koleksiyonun "sepette %X" indirimi uygulanır. */
export const getCollectionProducts = cache(async (slug: string): Promise<ListingProduct[]> => {
  const collection = await getCollectionRecord(slug)
  if (!collection) return []

  const rows = await prisma.product.findMany({
    where: { isActive: true, collections: { some: { collectionId: collection.id } } },
    orderBy: [{ id: "desc" }],
    select: listingProductSelect,
  })

  return rows.map((row) => toListingProduct(row, collection.discount ?? null))
})
