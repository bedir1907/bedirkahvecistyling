"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

const LOW_STOCK_LIMIT = 5

type Variant = {
  id: number
  size: string
  stock: number
  sku: string | null
}

type Product = {
  id: number
  name: string
  color: string | null
  category: string
  isActive: boolean
  variants: Variant[]
}

type StockRow = {
  productId: number
  productName: string
  color: string | null
  category: string
  variant: Variant
}

type StockGroup = {
  productId: number
  productName: string
  color: string | null
  category: string
  variants: Variant[]
}

function getStockBadge(stock: number) {
  if (stock === 0) return "bg-red-100 text-red-700"
  return "bg-yellow-100 text-yellow-700"
}

function getStockLabel(stock: number) {
  if (stock === 0) return "Tükendi"
  return "Düşük Stok"
}

function editHref(productId: number) {
  return `/bksy0net1mp4neli/products?edit=${productId}`
}

export default function AdminStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/products/list")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Ürünler alınamadı")
        setProducts(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stockRows = useMemo(() => {
    const q = search.trim().toLowerCase()

    return products
      .filter((product) => product.isActive)
      .flatMap((product) =>
        product.variants
          .filter((variant) => Number.isFinite(variant.id) && variant.size.trim())
          .filter((variant) => {
            if (filter === "out") return variant.stock === 0
            if (filter === "low") return variant.stock > 0 && variant.stock <= LOW_STOCK_LIMIT
            return variant.stock <= LOW_STOCK_LIMIT
          })
          .filter((variant) => {
            if (!q) return true

            return (
              product.name.toLowerCase().includes(q) ||
              String(product.color || "").toLowerCase().includes(q) ||
              product.category.toLowerCase().includes(q) ||
              variant.size.toLowerCase().includes(q) ||
              String(variant.sku || "").toLowerCase().includes(q)
            )
          })
          .map((variant): StockRow => ({
            productId: product.id,
            productName: product.name,
            color: product.color,
            category: product.category,
            variant,
          }))
      )
      .sort(
        (a, b) =>
          a.variant.stock - b.variant.stock ||
          a.productName.localeCompare(b.productName, "tr") ||
          a.variant.size.localeCompare(b.variant.size, "tr", { numeric: true })
      )
  }, [products, search, filter])

  const stockGroups = useMemo(() => {
    const groups = new Map<number, StockGroup>()

    for (const row of stockRows) {
      const group = groups.get(row.productId)

      if (group) {
        group.variants.push(row.variant)
        continue
      }

      groups.set(row.productId, {
        productId: row.productId,
        productName: row.productName,
        color: row.color,
        category: row.category,
        variants: [row.variant],
      })
    }

    return Array.from(groups.values())
  }, [stockRows])

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Stok Takip</h1>
        <p className="text-gray-500 mt-1 text-sm">Düşük veya tükenen varyantları ürün altında görüntüle.</p>
      </div>

      <div className="bg-white rounded-2xl border p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ürün adı, renk, kategori, beden veya SKU ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none sm:w-44"
          >
            <option value="all">Tüm Uyarılar</option>
            <option value="out">Tükenenler</option>
            <option value="low">Düşük Stok</option>
          </select>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse h-20" />
          ))
        ) : stockGroups.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">Düşük stoklu varyant bulunamadı.</div>
        ) : (
          stockGroups.map((group) => (
            <div key={group.productId} className="bg-white rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{group.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {group.color || "-"} · {group.category}
                  </p>
                </div>
                <Link
                  href={editHref(group.productId)}
                  className="shrink-0 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                >
                  Düzenle
                </Link>
              </div>
              <div className="space-y-1.5">
                {group.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                    <span className="text-xs font-medium text-gray-700">Beden: {variant.size}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">{variant.stock} adet</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStockBadge(variant.stock)}`}>
                        {getStockLabel(variant.stock)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3.5 font-medium">Ürün</th>
              <th className="px-5 py-3.5 font-medium">Renk</th>
              <th className="px-5 py-3.5 font-medium">Kategori</th>
              <th className="px-5 py-3.5 font-medium">Beden</th>
              <th className="px-5 py-3.5 font-medium">Stok</th>
              <th className="px-5 py-3.5 font-medium">Durum</th>
              <th className="px-5 py-3.5 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">Yükleniyor...</td>
              </tr>
            ) : stockGroups.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-500">Düşük stoklu varyant bulunamadı.</td>
              </tr>
            ) : (
              stockGroups.map((group) =>
                group.variants.map((variant, variantIndex) => (
                  <tr key={variant.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    {variantIndex === 0 ? (
                      <td
                        className="px-5 py-4 font-medium text-sm text-gray-900 align-top"
                        rowSpan={group.variants.length}
                      >
                        {group.productName}
                      </td>
                    ) : null}
                    {variantIndex === 0 ? (
                      <td
                        className="px-5 py-4 text-sm text-gray-500 align-top"
                        rowSpan={group.variants.length}
                      >
                        {group.color || "-"}
                      </td>
                    ) : null}
                    {variantIndex === 0 ? (
                      <td
                        className="px-5 py-4 text-sm text-gray-500 align-top"
                        rowSpan={group.variants.length}
                      >
                        {group.category}
                      </td>
                    ) : null}
                    <td className="px-5 py-4 text-sm text-gray-700 font-medium">{variant.size}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{variant.stock}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStockBadge(variant.stock)}`}>
                        {getStockLabel(variant.stock)}
                      </span>
                    </td>
                    {variantIndex === 0 ? (
                      <td className="px-5 py-4 align-top" rowSpan={group.variants.length}>
                        <Link
                          href={editHref(group.productId)}
                          className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
                        >
                          Düzenle
                        </Link>
                      </td>
                    ) : null}
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
