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
  hoverImage?: string | null
}

type Category = {
  id: number
  name: string
  slug: string
}

type Props = {
  params: Promise<{ slug: string }>
}

export default function CategoryPage({ params }: Props) {
  const { slug } = use(params)

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("new")

  useEffect(() => {
    async function fetchData() {
      try {
        const isDynamicNewSeason = slug === "new-season"
        const isDynamicDiscount = slug === "indirimdekiler"

        const categoryRes = await fetch(`/api/categories/${slug}`)
        const categoryData = await categoryRes.json()

        if (!categoryRes.ok && !isDynamicNewSeason && !isDynamicDiscount) {
          throw new Error(categoryData.error || "Kategori alınamadı")
        }

        const dynamicCategory: Category = isDynamicNewSeason
          ? { id: -1, name: "Yeni Sezon", slug: "new-season" }
          : isDynamicDiscount
            ? { id: -2, name: "İndirimdekiler", slug: "indirimdekiler" }
            : categoryData

        setCategory(dynamicCategory)

        const productsRes = await fetch(
          isDynamicNewSeason
            ? `/api/products?isNew=true`
            : isDynamicDiscount
              ? `/api/products?discounted=true`
              : `/api/products?category=${encodeURIComponent(dynamicCategory.name)}`
        )
        const productsData = await productsRes.json()

        if (!productsRes.ok) throw new Error(productsData.error || "Ürünler alınamadı")

        setProducts(productsData)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    return b.id - a.id
  })

  return (
    // AnnouncementBar kaldırıldı — layout.tsx'deki StoreNavbar üzerinden geliyor
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">{category?.name || slug}</span>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="inline-flex items-center rounded-full border border-black/10 bg-[#f3f1ec] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-gray-700 mb-3">
              Kategori
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">{category?.name || slug}</h1>
            <p className="text-gray-500 text-sm mt-1">{sortedProducts.length} ürün bulundu</p>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm"
          >
            <option value="new">En Yeniler</option>
            <option value="price-asc">Fiyat Artan</option>
            <option value="price-desc">Fiyat Azalan</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-3xl aspect-[5/6]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center text-gray-500">
            Bu kategoride ürün yok.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                href={`/product/${product.id}?from=${slug}`}
              />
            ))}
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}
