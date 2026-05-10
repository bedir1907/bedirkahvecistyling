"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

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
  switch (status) {
    case "PAID":
      return "Sipariş Oluşturuldu"
    case "APPROVED":
      return "Sipariş Onaylandı"
    case "PENDING":
      return "Beklemede"
    case "FAILED":
      return "Ödeme Başarısız"
    case "FAILED_PAYMENT":
      return "Ödeme Alınamadı"
    case "SHIPPED":
      return "Kargoya Verildi"
    case "DELIVERED":
      return "Teslim Edildi"
    case "CANCELLED":
      return "İptal Edildi"
    case "REFUNDED":
      return "İade Edildi"
    default:
      return status
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700"
    case "APPROVED":
      return "bg-indigo-100 text-indigo-700"
    case "PENDING":
      return "bg-yellow-100 text-yellow-700"
    case "FAILED":
    case "FAILED_PAYMENT":
      return "bg-red-100 text-red-700"
    case "SHIPPED":
      return "bg-blue-100 text-blue-700"
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700"
    case "CANCELLED":
      return "bg-gray-100 text-gray-600"
    case "REFUNDED":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders/list")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Siparişler alınamadı")
        }

        setOrders(data)
      } catch (error) {
        alert(error instanceof Error ? error.message : "Siparişler alınamadı")
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
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Siparişler</h1>
            <p className="text-gray-600 mt-1">
              Tüm siparişleri görüntüle ve durumlarını yönet.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
          <div className="grid md:grid-cols-[1fr_220px] gap-4">
            <input
              type="text"
              placeholder="Sipariş no, ad, e-posta veya telefon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-xl px-4 py-3"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-xl px-4 py-3"
            >
              <option value="">Tüm Durumlar</option>
              <option value="PAID">Sipariş Oluşturuldu</option>
              <option value="APPROVED">Sipariş Onaylandı</option>
              <option value="PENDING">Beklemede</option>
              <option value="FAILED">Ödeme Başarısız</option>
              <option value="FAILED_PAYMENT">Ödeme Alınamadı</option>
              <option value="SHIPPED">Kargoya Verildi</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="CANCELLED">İptal Edildi</option>
              <option value="REFUNDED">İade Edildi</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-4">Sipariş No</th>
                <th className="p-4">Müşteri</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Ürün</th>
                <th className="p-4">Toplam</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const currentStatus = order.displayStatus || order.status

                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 align-middle"
                    >
                      <td className="p-4 font-medium">{order.orderNumber}</td>

                      <td className="p-4">
                        <div className="font-medium">{order.name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>

                      <td className="p-4">{order.phone}</td>

                      <td className="p-4">
                        <div className="text-sm text-gray-700">
                          {order.items.length} ürün
                        </div>
                      </td>

                      <td className="p-4 font-medium">₺{order.totalPrice}</td>

                      <td className="p-4">
                        <div className="flex flex-col items-start gap-2">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                              currentStatus
                            )}`}
                          >
                            {getStatusLabel(currentStatus)}
                          </span>

                          {order.stockRestored && order.status === "CANCELLED" ? (
                            <span className="text-xs text-gray-500">
                              Stok iade edildi
                            </span>
                          ) : null}

                          {order.status === "REFUNDED" ? (
                            <span className="text-xs text-gray-500">
                              Ödeme iade edildi
                            </span>
                          ) : null}
                        </div>
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString("tr-TR")}
                      </td>

                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="border border-black px-4 py-2 rounded-xl hover:bg-black hover:text-white transition"
                        >
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
      </div>
    </main>
  )
}