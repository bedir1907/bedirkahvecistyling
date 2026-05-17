"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { formatPrice } from "@/lib/format"

type OrderItem = {
  id: number
  productName: string
  color: string | null
  size: string | null
  price: number
  quantity: number
}

type Order = {
  id: number
  orderNumber: string
  name: string
  email: string
  phone: string
  city: string
  district: string
  totalPrice: number
  status: string
  displayStatus?: string
  stockRestored: boolean
  createdAt: string
  items: OrderItem[]
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    PAID: "Sipariş Oluşturuldu", APPROVED: "Sipariş Onaylandı",
    PENDING: "Beklemede", FAILED: "Ödeme Başarısız",
    FAILED_PAYMENT: "Ödeme Alınamadı", SHIPPED: "Kargoya Verildi",
    DELIVERED: "Teslim Edildi", CANCELLED: "İptal Edildi", REFUNDED: "İade Edildi",
  }
  return map[status] ?? status
}

function getStatusClass(status: string) {
  const map: Record<string, string> = {
    PAID: "bg-green-100 text-green-700", APPROVED: "bg-indigo-100 text-indigo-700",
    PENDING: "bg-yellow-100 text-yellow-700", FAILED: "bg-red-100 text-red-700",
    FAILED_PAYMENT: "bg-red-100 text-red-700", SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-gray-100 text-gray-600",
    REFUNDED: "bg-purple-100 text-purple-700",
  }
  return map[status] ?? "bg-gray-100 text-gray-700"
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders/list")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Siparişler alınamadı")
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Siparişler alınamadı")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.toLowerCase()
      const currentStatus = order.displayStatus || order.status
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(q) ||
        order.name.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q)
      const matchesStatus = statusFilter ? currentStatus === statusFilter : true
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Siparişler</h1>
        <p className="text-gray-500 mt-1 text-sm">Tüm siparişleri görüntüle ve yönet.</p>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-2xl border p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Sipariş no, ad, e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none sm:w-48"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PAID">Sipariş Oluşturuldu</option>
            <option value="APPROVED">Sipariş Onaylandı</option>
            <option value="PENDING">Beklemede</option>
            <option value="SHIPPED">Kargoya Verildi</option>
            <option value="DELIVERED">Teslim Edildi</option>
            <option value="CANCELLED">İptal Edildi</option>
            <option value="REFUNDED">İade Edildi</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      {/* Mobil: kart görünümü */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">Sipariş bulunamadı.</div>
        ) : (
          filteredOrders.map((order) => {
            const currentStatus = order.displayStatus || order.status
            return (
              <div key={order.id} className="bg-white rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{order.name}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusClass(currentStatus)}`}>
                    {getStatusLabel(currentStatus)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">{order.items.length} ürün • {new Date(order.createdAt).toLocaleDateString("tr-TR")}</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <Link href={`/bksy0net1mp4neli/orders/${order.id}`} className="bg-gray-900 text-white text-xs px-4 py-2 rounded-xl hover:opacity-80 transition">
                    Detay
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop: tablo görünümü */}
      <div className="hidden lg:block bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3.5 font-medium">Sipariş No</th>
              <th className="px-5 py-3.5 font-medium">Müşteri</th>
              <th className="px-5 py-3.5 font-medium">Telefon</th>
              <th className="px-5 py-3.5 font-medium">Ürün</th>
              <th className="px-5 py-3.5 font-medium">Toplam</th>
              <th className="px-5 py-3.5 font-medium">Durum</th>
              <th className="px-5 py-3.5 font-medium">Tarih</th>
              <th className="px-5 py-3.5 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-500">Sipariş bulunamadı.</td></tr>
            ) : (
              filteredOrders.map((order) => {
                const currentStatus = order.displayStatus || order.status
                return (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="px-5 py-4 font-medium text-sm">{order.orderNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-sm">{order.name}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.phone}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.items.length} ürün</td>
                    <td className="px-5 py-4 font-semibold text-sm">{formatPrice(order.totalPrice)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusClass(currentStatus)}`}>
                        {getStatusLabel(currentStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-5 py-4">
                      <Link href={`/bksy0net1mp4neli/orders/${order.id}`} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                        Detay
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}