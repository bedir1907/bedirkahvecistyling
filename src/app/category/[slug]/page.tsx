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
}

type Category = {
  id: number
  name: string
  slug: string
}

type Props = {
  params: Promise<{ slug: string }>
}

// Bu slug'lar DB'de kategori olsa bile özel filtre kullanır
const VIRTUAL_SLUGS: Record<string, { name: string; apiParam: string }> = {
  "new-season": { name: "Yeni Sezon", apiParam: "isNew=true" },
  "indirimdekiler": { name: "İndirimdekiler", apiParam: "discounted=true" },
}

export default function CategoryPage({ params }: Props) {
  const { slug } = use(params)

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("new")

  const virtualSlug = VIRTUAL_SLUGS[slug]

  useEffect(() => {
    async function fetchData() {
      try {
        // Sanal kategori mi?
        if (virtualSlug) {
          setCategory({ id: -1, name: virtualSlug.name, slug })
          const res = await fetch(`/api/products?${virtualSlug.apiParam}`)
          const data = await res.json()
          setProducts(Array.isArray(data) ? data : [])
          return
        }

        // Normal DB kategorisi
        const [categoryRes, productsRes] = await Promise.all([
          fetch(`/api/categories/${slug}`),
          fetch(`/api/products?category=${encodeURIComponent(slug)}`),
        ])

        const categoryData = await categoryRes.json()
        if (!categoryRes.ok) throw new Error(categoryData.error || "Kategori bulunamadı")

        const productsData = await productsRes.json()

        setCategory(categoryData)
        setProducts(Array.isArray(productsData) ? productsData : [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, virtualSlug])

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    return b.id - a.id
  })

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">{category?.name || slug}</span>
        </div>

        {/* Başlık + sıralama */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="inline-flex items-center rounded-full border border-black/10 bg-[#f3f1ec] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-gray-700 mb-3">
              Kategori
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {category?.name || slug}
            </h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-1">
                {sortedProducts.length} ürün bulundu
              </p>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/30 md:w-48"
          >
            <option value="new">En Yeniler</option>
            <option value="price-asc">Fiyat Artan</option>
            <option value="price-desc">Fiyat Azalan</option>
          </select>
        </div>

        {/* Ürünler */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-[3/4]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-16 text-center">
            <p className="text-gray-400 text-lg mb-4">Bu kategoride henüz ürün yok.</p>
            /
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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