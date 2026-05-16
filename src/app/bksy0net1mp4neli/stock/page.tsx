"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Product = {
  id: number
  name: string
  category: string
  stock: number
  isActive: boolean
}

function getStockBadge(stock: number) {
  if (stock === 0) return "bg-red-100 text-red-700"
  if (stock <= 5) return "bg-yellow-100 text-yellow-700"
  return "bg-green-100 text-green-700"
}

function getStockLabel(stock: number) {
  if (stock === 0) return "Tükendi"
  if (stock <= 5) return "Düşük Stok"
  return "Stok İyi"
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

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.isActive)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => {
        if (filter === "low") return p.stock > 0 && p.stock <= 5
        if (filter === "out") return p.stock === 0
        if (filter === "good") return p.stock > 5
        return true
      })
      .sort((a, b) => a.stock - b.stock)
  }, [products, search, filter])

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Stok Takip</h1>
        <p className="text-gray-500 mt-1 text-sm">Aktif ürünlerin stok durumu.</p>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-2xl border p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none sm:w-44"
          >
            <option value="all">Tüm Stoklar</option>
            <option value="out">Tükenenler</option>
            <option value="low">Düşük Stok</option>
            <option value="good">Stok İyi</option>
          </select>
        </div>
      </div>

      {/* Mobil: kart görünümü */}
      <div className="lg:hidden space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse h-16" />)
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">Ürün bulunamadı.</div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl border px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStockBadge(product.stock)}`}>
                  {product.stock > 0 ? `${product.stock} adet` : "Tükendi"}
                </span>
                <Link href={`/admin/products/${product.id}/edit`} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                  Düzenle
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: tablo */}
      <div className="hidden lg:block bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3.5 font-medium">Ürün</th>
              <th className="px-5 py-3.5 font-medium">Kategori</th>
              <th className="px-5 py-3.5 font-medium">Stok</th>
              <th className="px-5 py-3.5 font-medium">Durum</th>
              <th className="px-5 py-3.5 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-500">Ürün bulunamadı.</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-5 py-4 font-medium text-sm text-gray-900">{product.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{product.category}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{product.stock}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStockBadge(product.stock)}`}>
                      {getStockLabel(product.stock)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}