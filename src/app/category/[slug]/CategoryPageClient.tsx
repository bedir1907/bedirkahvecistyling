"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import ProductCard from "@/components/ProductCard"
import StoreFooter from "@/components/store/StoreFooter"
import AutoplayVideo from "@/components/store/AutoplayVideo"

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
  image?: string | null
  video?: string | null
}

type Props = {
  params: Promise<{ slug: string }>
}

const VIRTUAL_SLUGS: Record<string, { name: string; apiParam: string }> = {
  "new-season": { name: "Yeni Sezon", apiParam: "isNew=true" },
  "indirimdekiler": { name: "İndirimdekiler", apiParam: "discounted=true" },
  "haftanin-urunleri": { name: "Haftanın Ürünleri", apiParam: "featured=true" },
  "en-yeniler": { name: "En Yeniler", apiParam: "isNew=true" },
}

export default function CategoryPageClient({ params }: Props) {
  const { slug } = use(params)

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState("new")
  const [discountMap, setDiscountMap] = useState<Record<number, number>>({})

  const virtualSlug = VIRTUAL_SLUGS[slug]

  useEffect(() => {
    async function fetchData() {
      try {
        if (virtualSlug) {
          const [catRes, prodRes] = await Promise.all([
            fetch(`/api/categories/${slug}`),
            fetch(`/api/products?${virtualSlug.apiParam}`),
          ])
          const catData = catRes.ok ? await catRes.json() : null
          setCategory({
            id: catData?.id ?? -1,
            name: virtualSlug.name,
            slug,
            image: catData?.image ?? null,
            video: catData?.video ?? null,
          })
          const data = await prodRes.json()
          const list = Array.isArray(data) ? data : []
          setProducts(list)
          if (list.length > 0) {
            const dmRes = await fetch("/api/collections/discount-map", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productIds: list.map((p: Product) => p.id) }),
            })
            const dmData = await dmRes.json()
            setDiscountMap(dmData.discounts ?? {})
          }
          return
        }

        // Slug ile filtrele — API içinde kategori adını bulup eşleştiriyor
        const [categoryRes, productsRes] = await Promise.all([
          fetch(`/api/categories/${slug}`),
          fetch(`/api/products?categorySlug=${encodeURIComponent(slug)}`),
        ])

        const categoryData = await categoryRes.json()
        if (!categoryRes.ok) throw new Error(categoryData.error || "Kategori bulunamadı")

        const productsData = await productsRes.json()

        setCategory(categoryData)
        setProducts(Array.isArray(productsData) ? productsData : [])

        const allProducts = Array.isArray(productsData) ? productsData : []
        if (allProducts.length > 0) {
          const dmRes = await fetch("/api/collections/discount-map", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: allProducts.map((p: Product) => p.id) }),
          })
          const dmData = await dmRes.json()
          setDiscountMap(dmData.discounts ?? {})
        }
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

  const hasBanner = !!(category?.video || category?.image)

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <img
          src="/bk-logo.svg"
          alt="Yükleniyor"
          className="w-24 h-24 rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Başlık bandı */}
      <section className={`relative w-full border-b ${hasBanner ? "bg-gray-900 min-h-70 md:min-h-90" : "bg-[#f7f7f5]"} overflow-hidden`}>
        {category?.video ? (
          <AutoplayVideo src={category.video} />
        ) : category?.image ? (
          <img
            src={category.image}
            alt={category.name ?? ""}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : null}
        {hasBanner && <div className="absolute inset-0 bg-black/50" />}
        <div className={`relative max-w-7xl mx-auto px-4 py-12 md:py-16 ${hasBanner ? "text-white" : "text-black"}`}>
          <div className={`text-sm mb-4 flex flex-wrap items-center gap-2 ${hasBanner ? "text-white/70" : "text-gray-500"}`}>
            <Link href="/" className="hover:opacity-100 transition">Anasayfa</Link>
            <span>/</span>
            <span>{category?.name || slug}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className={`inline-flex items-center border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] mb-3 ${hasBanner ? "border-white/30 bg-white/10 text-white" : "border-black/10 bg-[#f3f1ec] text-gray-700"}`}>
                Kategori
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">{category?.name || slug}</h1>
              <p className={`text-sm mt-1 ${hasBanner ? "text-white/70" : "text-gray-500"}`}>{sortedProducts.length} ürün bulundu</p>
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
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
                href={`/product/${product.id}?from=${slug}`}
                collectionDiscount={discountMap[product.id] ?? null}
              />
            ))}
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}
