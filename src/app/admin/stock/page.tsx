"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type Product = {
  id: number
  name: string
  category: string
  stock: number
  isActive: boolean
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

        if (!res.ok) {
          throw new Error(data.error || "Ürünler alınamadı")
        }

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
      .filter((product) => product.isActive)
      .filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((product) => {
        if (filter === "low") return product.stock > 0 && product.stock <= 5
        if (filter === "out") return product.stock === 0
        if (filter === "good") return product.stock > 5
        return true
      })
      .sort((a, b) => a.stock - b.stock)
  }, [products, search, filter])

  function getStockBadge(stock: number) {
    if (stock === 0) {
      return "bg-red-100 text-red-700"
    }

    if (stock <= 5) {
      return "bg-yellow-100 text-yellow-700"
    }

    return "bg-green-100 text-green-700"
  }

  function getStockLabel(stock: number) {
    if (stock === 0) return "Tükendi"
    if (stock <= 5) return "Düşük Stok"
    return "Stok İyi"
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stok Takip</h1>
        <p className="text-gray-600 mt-2">
          Sadece aktif ürünlerin stok durumunu buradan takip edebilirsin.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <div className="grid md:grid-cols-[1fr_220px] gap-4">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-xl px-4 py-3"
          >
            <option value="all">Tüm Stoklar</option>
            <option value="low">Düşük Stok</option>
            <option value="out">Tükenenler</option>
            <option value="good">Stok İyi</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
           <tr className="text-left">
            <th className="p-4">Ürün</th>
            <th className="p-4">Kategori</th>
            <th className="p-4">Stok</th>
            <th className="p-4">Durum</th>
            <th className="p-4">İşlem</th>
           </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Uygun ürün bulunamadı.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0">
  <td className="p-4 font-medium text-gray-900">
    {product.name}
  </td>
  <td className="p-4 text-gray-600">{product.category}</td>
  <td className="p-4 text-gray-900">{product.stock}</td>
  <td className="p-4">
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStockBadge(
        product.stock
      )}`}
    >
      {getStockLabel(product.stock)}
    </span>
  </td>
  <td className="p-4">
    <Link
  href={`/admin/products?edit=${product.id}`}
  className="inline-flex border border-black px-3 py-2 rounded-xl hover:bg-black hover:text-white"
>
  Ürünü Düzenle
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