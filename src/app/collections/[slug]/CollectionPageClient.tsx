"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import StoreFooter from "@/components/store/StoreFooter"
import AutoplayVideo from "@/components/store/AutoplayVideo"
import type { ListingProduct } from "@/lib/catalog"
import { sortListingProducts, type ListingSort } from "@/lib/listing-sort"

type Props = {
  collection: {
    name: string
    description: string | null
    image: string | null
    video: string | null
  }
  /** Sunucuda çekilen aktif ürünler (koleksiyon indirimi `collectionDiscount` içinde). */
  products: ListingProduct[]
}

export default function CollectionPageClient({ collection, products }: Props) {
  const [sort, setSort] = useState<ListingSort>("new")

  const sorted = useMemo(() => sortListingProducts(products, sort), [products, sort])

  const hasBanner = !!(collection.video || collection.image)

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Başlık bandı */}
      <section className="relative w-full bg-[#f7f7f5] border-b overflow-hidden">
        {collection.video ? (
          <AutoplayVideo src={collection.video} />
        ) : collection.image ? (
          <img
            src={collection.image}
            alt={collection.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : null}
        {hasBanner && <div className="absolute inset-0 bg-black/50" />}
        <div className={`relative max-w-7xl mx-auto px-4 py-14 md:py-20 ${hasBanner ? "text-white" : "text-black"}`}>
          <nav aria-label="Breadcrumb" className="text-sm mb-4 flex flex-wrap items-center gap-2 opacity-70">
            <Link href="/" className="hover:opacity-100 transition">Anasayfa</Link>
            <span>/</span>
            <span aria-current="page">{collection.name}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className={`inline-flex items-center border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] mb-3 ${hasBanner ? "border-white/30 bg-white/10 text-white" : "border-black/10 bg-[#f3f1ec] text-gray-700"}`}>
                Koleksiyon
              </p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{collection.name}</h1>
              {collection.description && (
                <p className={`mt-3 text-lg max-w-xl whitespace-pre-line ${hasBanner ? "text-white/80" : "text-gray-500"}`}>
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ürünler */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{sorted.length} ürün</p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ListingSort)}
            aria-label="Sırala"
            className="border border-black/10 px-4 py-2.5 text-sm focus:outline-none ml-auto"
          >
            <option value="new">En Yeniler</option>
            <option value="price-asc">Fiyat Artan</option>
            <option value="price-desc">Fiyat Azalan</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <div className="border border-dashed p-16 text-center">
            <p className="text-gray-400 text-lg mb-4">Bu koleksiyonda henüz ürün yok.</p>
            <Link href="/" className="inline-flex px-6 py-3 bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Anasayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                href={product.path}
                collectionDiscount={product.collectionDiscount}
              />
            ))}
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}
