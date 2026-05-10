"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) { setProducts([]); return }

    async function fetchResults() {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [q])

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Arama</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            {q ? `"${q}" için sonuçlar` : "Arama"}
          </h1>
          {!loading && q && (
            <p className="text-gray-500 text-sm mt-1">
              {products.length > 0 ? `${products.length} ürün bulundu` : "Sonuç bulunamadı"}
            </p>
          )}
        </div>

        {!q.trim() ? (
          <p className="text-gray-500">Arama yapmak için navbar&apos;daki arama butonunu kullanın.</p>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-3xl aspect-[5/6]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border p-12 text-center">
            <p className="text-gray-500 mb-4">
              <strong>&quot;{q}&quot;</strong> için sonuç bulunamadı.
            </p>
            <Link href="/" className="inline-flex px-6 py-3 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Anasayfaya Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.image}
                category={product.category}
              />
            ))}
          </div>
        )}
      </section>
      <StoreFooter />
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SearchContent />
    </Suspense>
  )
}