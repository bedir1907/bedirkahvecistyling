"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import AnnouncementBar from "@/components/store/AnnouncementBar"
//import StoreNavbar from "@/components/store/StoreNavbar"
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
  params: Promise<{
    slug: string
  }>
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
          ? {
              id: -1,
              name: "Yeni Sezon",
              slug: "new-season",
            }
          : isDynamicDiscount
            ? {
                id: -2,
                name: "İndirimdekiler",
                slug: "indirimdekiler",
              }
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

        if (!productsRes.ok) {
          throw new Error(productsData.error || "Ürünler alınamadı")
        }

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
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>

          <span>/</span>

          <span className="text-black">{category?.name || slug}</span>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-2">
              Kategori
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              {category?.name || slug}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {sortedProducts.length} ürün bulundu
            </p>
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
          <p>Yükleniyor...</p>
        ) : sortedProducts.length === 0 ? (
          <p>Bu kategoride ürün yok.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                hoverImage={product.hoverImage}
              />
            ))}
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}