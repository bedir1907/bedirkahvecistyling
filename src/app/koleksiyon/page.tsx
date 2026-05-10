"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import StoreFooter from "@/components/store/StoreFooter"
import { SlidersHorizontal, X } from "lucide-react"

type Product = {
  id: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  isNew: boolean
  featured: boolean
}

type Category = {
  id: number
  name: string
  slug: string
}

export default function KoleksiyonPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sort, setSort] = useState("new")
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ])
        const productsData = await productsRes.json()
        const categoriesData = await categoriesRes.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filtrele
  const filtered = products.filter((p) => {
    if (selectedCategory === "all") return true
    if (selectedCategory === "new") return p.isNew
    if (selectedCategory === "featured") return p.featured
    return p.category === selectedCategory
  })

  // Sırala
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price
    if (sort === "price-desc") return b.price - a.price
    if (sort === "new") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
    return b.id - a.id
  })

  const filterTabs = [
    { key: "all", label: "Tümü" },
    { key: "new", label: "🆕 Yeni Gelenler" },
    { key: "featured", label: "⭐ Öne Çıkanlar" },
    ...categories.map((cat) => ({ key: cat.name, label: cat.name })),
  ]

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          <span className="text-black">Tüm Ürünler</span>
        </div>

        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Koleksiyon</h1>
          <p className="text-gray-500 mt-2 text-sm">
            {loading ? "Yükleniyor..." : `${sorted.length} ürün`}
          </p>
        </div>

        {/* Filtreler — desktop */}
        <div className="hidden md:flex items-center justify-between gap-4 mb-8">
          {/* Kategori tabları */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === tab.key
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-[#f5f3ee] text-black/70 hover:border-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sıralama */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-black/10 rounded-xl px-4 py-2 text-sm shrink-0 focus:outline-none focus:border-black/30"
          >
            <option value="default">Varsayılan</option>
            <option value="new">Yeni Gelenler</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
          </select>
        </div>

        {/* Filtreler — mobil */}
        <div className="md:hidden flex items-center justify-between gap-3 mb-6">
          {/* Aktif filtre göster */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-black text-white text-xs px-3 py-1.5 rounded-full shrink-0 font-medium">
                {filterTabs.find((t) => t.key === selectedCategory)?.label}
                <button type="button" onClick={() => setSelectedCategory("all")}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>

          {/* Filtre butonu */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2.5 text-sm font-medium shrink-0 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal size={15} />
            Filtrele
          </button>
        </div>

        {/* Ürün grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-[3/4]" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-3xl border p-16 text-center">
            <p className="text-gray-400 text-lg mb-4">Bu filtrede ürün bulunamadı.</p>
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition"
            >
              Tüm Ürünleri Göster
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sorted.map((product) => (
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

      {/* Mobil filtre drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setFilterOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[28px] p-5 pb-8 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtre & Sıralama</h2>
              <button type="button" onClick={() => setFilterOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10">
                <X size={17} />
              </button>
            </div>

            {/* Sıralama */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Sıralama</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "default", label: "Varsayılan" },
                  { key: "new", label: "Yeni Gelenler" },
                  { key: "price-asc", label: "Fiyat ↑" },
                  { key: "price-desc", label: "Fiyat ↓" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSort(item.key)}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition ${
                      sort === item.key ? "border-black bg-black text-white" : "border-black/10 hover:border-black"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategoriler */}
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Kategori</p>
              <div className="space-y-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setSelectedCategory(tab.key); setFilterOpen(false) }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                      selectedCategory === tab.key ? "bg-black text-white" : "hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="w-full py-3.5 rounded-2xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              Uygula ({sorted.length} ürün)
            </button>
          </div>
        </div>
      )}

      <StoreFooter />
    </main>
  )
}
