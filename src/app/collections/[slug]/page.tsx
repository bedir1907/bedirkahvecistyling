"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import StoreFooter from "@/components/store/StoreFooter"

type Product = {
  id: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  isActive: boolean
}

type Collection = {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  discount: number | null
}

type Props = { params: Promise<{ slug: string }> }

export default function CollectionPage({ params }: Props) {
  const { slug } = use(params)

  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sort, setSort] = useState("new")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/collections/${slug}`)
        if (!res.ok) { setNotFound(true); return }
        const data = await res.json()
        setCollection(data.collection)
        setProducts(data.products.filter((p: Product) => p.isActive))
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const sorted = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    return b.id - a.id
  })

  if (notFound) {
    return (
      <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-semibold">Koleksiyon bulunamadı</p>
        <Link href="/" className="px-6 py-3 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition">
          Anasayfaya Dön
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Başlık bandı */}
      <section
        className="relative w-full bg-[#f7f7f5] border-b overflow-hidden"
        style={collection?.image ? { backgroundImage: `url(${collection.image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {collection?.image && <div className="absolute inset-0 bg-black/50" />}
        <div className={`relative max-w-7xl mx-auto px-4 py-14 md:py-20 ${collection?.image ? "text-white" : "text-black"}`}>
          <div className="text-sm mb-4 flex flex-wrap items-center gap-2 opacity-70">
            <Link href="/" className="hover:opacity-100 transition">Anasayfa</Link>
            <span>/</span>
            <span>Koleksiyon</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] mb-3 ${collection?.image ? "border-white/30 bg-white/10 text-white" : "border-black/10 bg-[#f3f1ec] text-gray-700"}`}>
                Koleksiyon
              </p>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                {loading ? <span className="opacity-30">Yükleniyor...</span> : collection?.name || slug}
              </h1>
              {collection?.description && (
                <p className={`mt-3 text-lg max-w-xl ${collection?.image ? "text-white/80" : "text-gray-500"}`}>
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
          {!loading && (
            <p className="text-sm text-gray-500">{sorted.length} ürün</p>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none ml-auto"
          >
            <option value="new">En Yeniler</option>
            <option value="price-asc">Fiyat Artan</option>
            <option value="price-desc">Fiyat Azalan</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-3/4" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-16 text-center">
            <p className="text-gray-400 text-lg mb-4">Bu koleksiyonda henüz ürün yok.</p>
            <Link href="/" className="inline-flex px-6 py-3 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition">
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
                href={`/product/${product.id}`}
                collectionDiscount={collection?.discount ?? null}
              />
            ))}
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}
