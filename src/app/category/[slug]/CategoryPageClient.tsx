"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import StoreFooter from "@/components/store/StoreFooter"
import AutoplayVideo from "@/components/store/AutoplayVideo"
import type { ListingProduct } from "@/lib/catalog"
import { sortListingProducts, type ListingSort } from "@/lib/listing-sort"

type Props = {
  slug: string
  category: {
    name: string
    /** Sayfa H1'i (admin'den girilmediyse kategori adı) */
    heading: string
    image: string | null
    video: string | null
  }
  /** Sunucuda çekilen ürünler — ilk HTML'de ürün linkleri/adları/fiyatları hazır gelir. */
  products: ListingProduct[]
  /** Grid altındaki kategori açıklama (SEO) metni — sunucuda render edilir. */
  seoText?: ReactNode
}

export default function CategoryPageClient({ slug, category, products, seoText }: Props) {
  const [sort, setSort] = useState<ListingSort>("new")

  const sortedProducts = useMemo(() => sortListingProducts(products, sort), [products, sort])

  const hasBanner = !!(category.video || category.image)

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Başlık bandı */}
      <section className={`relative w-full border-b ${hasBanner ? "bg-gray-900 min-h-70 md:min-h-90" : "bg-[#f7f7f5]"} overflow-hidden`}>
        {category.video ? (
          <AutoplayVideo src={category.video} />
        ) : category.image ? (
          <img
            src={category.image}
            alt={category.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : null}
        {hasBanner && <div className="absolute inset-0 bg-black/50" />}
        <div className={`relative max-w-7xl mx-auto px-4 py-12 md:py-16 ${hasBanner ? "text-white" : "text-black"}`}>
          <nav aria-label="Breadcrumb" className={`text-sm mb-4 flex flex-wrap items-center gap-2 ${hasBanner ? "text-white/70" : "text-gray-500"}`}>
            <Link href="/" className="hover:opacity-100 transition">Anasayfa</Link>
            <span>/</span>
            <span aria-current="page">{category.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className={`inline-flex items-center border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] mb-3 ${hasBanner ? "border-white/30 bg-white/10 text-white" : "border-black/10 bg-[#f3f1ec] text-gray-700"}`}>
                Kategori
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">{category.heading}</h1>
              <p className={`text-sm mt-1 ${hasBanner ? "text-white/70" : "text-gray-500"}`}>{sortedProducts.length} ürün bulundu</p>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ListingSort)}
              aria-label="Sırala"
              className={`border px-4 py-2.5 text-sm focus:outline-none md:w-48 ${hasBanner ? "border-white/30 bg-white/10 text-white" : "border-black/10"}`}
            >
              <option value="new">En Yeniler</option>
              <option value="price-asc">Fiyat Artan</option>
              <option value="price-desc">Fiyat Azalan</option>
            </select>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-10">

        {sortedProducts.length === 0 ? (
          <div className="border border-dashed p-16 text-center">
            <p className="text-gray-400 text-lg mb-4">Bu kategoride henüz ürün yok.</p>
            <Link href="/" className="inline-flex px-6 py-3 bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Anasayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                href={`${product.path}?from=${encodeURIComponent(slug)}`}
                collectionDiscount={product.collectionDiscount}
              />
            ))}
          </div>
        )}
      </section>

      {seoText}

      <StoreFooter />
    </main>
  )
}
