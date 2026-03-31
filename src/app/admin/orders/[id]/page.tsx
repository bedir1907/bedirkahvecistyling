"use client"

import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"

type OrderItem = {
  id: number
  productId: number
  productName: string
  color: string | null
  size: string | null
  price: number
  quantity: number
}

type Order = {
  id: number
  orderNumber: string
  customerId: number | null
  name: string
  email: string
  phone: string
  city: string
  district: string
  address: string
  note: string | null
  totalPrice: number
  status: string
  stockRestored: boolean
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

type Props = {
  params: Promise<{
    id: string
  }>
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Ödeme Alındı"
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

function getAvailableStatuses(currentStatus: string) {
  switch (currentStatus) {
    case "PENDING":
      return ["PENDING", "CANCELLED"]

    case "PAID":
      return ["APPROVED", "CANCELLED"]

    case "APPROVED":
      return ["SHIPPED", "CANCELLED"]

    case "SHIPPED":
      return ["DELIVERED"]

    case "DELIVERED":
      return ["DELIVERED"]

    case "CANCELLED":
      return ["CANCELLED"]

    case "REFUNDED":
      return ["REFUNDED"]

    case "FAILED":
    case "FAILED_PAYMENT":
      return [currentStatus]

    default:
      return [currentStatus]
  }
}

export default function AdminOrderDetailPage({ params }: Props) {
  const { id } = use(params)

  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refunding, setRefunding] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Sipariş getirilemedi")
        }

        setOrder(data)
        setStatus(data.status)
      } catch (error) {
        alert(error instanceof Error ? error.message : "Sipariş getirilemedi")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  async function updateStatus() {
    if (!order) return

    try {
      setSaving(true)

      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Sipariş güncellenemedi")
      }

      setOrder(data)
      setStatus(data.status)
      alert("Sipariş durumu güncellendi")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Sipariş güncellenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function refundOrder() {
    if (!order) return

    const confirmed = window.confirm(
      "Bu siparişin ödemesini iade etmek istediğine emin misin?"
    )
    if (!confirmed) return

    try {
      setRefunding(true)

      const res = await fetch(`/api/admin/orders/${order.id}/refund`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "İade yapılamadı")
      }

      const refreshRes = await fetch(`/api/admin/orders/${order.id}`)
      const refreshedOrder = await refreshRes.json()

      if (!refreshRes.ok) {
        throw new Error(refreshedOrder.error || "Sipariş yenilenemedi")
      }

      setOrder(refreshedOrder)
      setStatus(refreshedOrder.status)

      alert("İade başarılı")
    } catch (error) {
      alert(error instanceof Error ? error.message : "İade yapılamadı")
    } finally {
      setRefunding(false)
    }
  }

  const availableStatuses = useMemo(() => {
    return order ? getAvailableStatuses(order.status) : []
  }, [order])
useEffect(() => {
  if (!order) return

  const nextStatuses = getAvailableStatuses(order.status)

  if (!nextStatuses.includes(status)) {
    setStatus(nextStatuses[0] || "")
  }
}, [order, status])
  if (loading) {
    return (
      <main>
        <div className="max-w-[1200px] mx-auto">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main>
        <div className="max-w-[1200px] mx-auto">
          <p className="text-gray-500">Sipariş bulunamadı.</p>
        </div>
      </main>
    )
  }

  const isCancelled = order.status === "CANCELLED"
  const isRefunded = order.status === "REFUNDED"
  const isFailed =
    order.status === "FAILED" || order.status === "FAILED_PAYMENT"
  const isSameStatus = status === order.status
  const canRefund = ["PAID", "APPROVED", "SHIPPED", "DELIVERED"].includes(
    order.status
  )

  return (
    <main>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/admin/orders"
              className="text-sm text-gray-500 hover:text-black transition"
            >
              ← Siparişlere Dön
            </Link>

            <h1 className="text-3xl font-bold mt-2">{order.orderNumber}</h1>

            <p className="text-gray-600 mt-1">
              {new Date(order.createdAt).toLocaleString("tr-TR")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>

            {order.stockRestored && order.status === "CANCELLED" ? (
              <span className="text-sm text-gray-500">Stok iade edildi</span>
            ) : null}

            {order.status === "REFUNDED" ? (
              <span className="text-sm text-gray-500">Ödeme iade edildi</span>
            ) : null}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Sipariş Ürünleri</h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-2xl p-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Renk: {item.color || "-"} • Beden: {item.size || "-"}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.quantity} adet × ₺{item.price}
                      </div>
                    </div>

                    <div className="font-semibold">
                      ₺{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-6">
              <h2 className="text-xl font-semibold mb-4">Teslimat Bilgileri</h2>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Ad Soyad</div>
                  <div className="font-medium">{order.name}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Telefon</div>
                  <div className="font-medium">{order.phone}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">E-posta</div>
                  <div className="font-medium">{order.email}</div>
                </div>

                <div>
                  <div className="text-gray-500 mb-1">Şehir / İlçe</div>
                  <div className="font-medium">
                    {order.city} / {order.district}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-gray-500 mb-1">Adres</div>
                  <div className="font-medium whitespace-pre-line">
                    {order.address}
                  </div>
                </div>

                {order.note ? (
                  <div className="md:col-span-2">
                    <div className="text-gray-500 mb-1">Sipariş Notu</div>
                    <div className="font-medium whitespace-pre-line">
                      {order.note}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl border p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold mb-5">Sipariş Yönetimi</h2>

            <div className="space-y-5">
              <div>
                <div className="text-sm text-gray-500 mb-2">Sonraki İşlem</div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isCancelled || isRefunded || isFailed}
                  className={`w-full border rounded-xl px-4 py-3 ${
                    isCancelled || isRefunded || isFailed
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {availableStatuses.map((item) => (
                    <option key={item} value={item}>
                      {getStatusLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={updateStatus}
                disabled={
  saving ||
  isCancelled ||
  isRefunded ||
  isFailed ||
  !status
}
                className="w-full bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelled
                  ? "Sipariş İptal Edildi"
                  : isRefunded
                    ? "Sipariş İade Edildi"
                    : isFailed
                      ? "Ödeme Alınamadı"
                      : saving
                        ? "Kaydediliyor..."
                        : !status
                           ? "İşlem Seçiniz"
                           : "Durumu Güncelle"}
              </button>

              {canRefund && (
                <button
                  type="button"
                  onClick={refundOrder}
                  disabled={refunding}
                  className="w-full border border-purple-600 text-purple-700 px-5 py-3 rounded-xl hover:bg-purple-600 hover:text-white transition disabled:opacity-50"
                >
                  {refunding ? "İade Ediliyor..." : "Ödemeyi İade Et"}
                </button>
              )}

              {isCancelled && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Bu sipariş iptal edildiği için tekrar değiştirilemez.
                </div>
              )}

              {isRefunded && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  Bu siparişin ödemesi iade edildi. Sipariş durumu tekrar
                  değiştirilemez.
                </div>
              )}

              {isFailed && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Bu siparişte ödeme tamamlanmadı. Operasyon süreci başlatılamaz.
                </div>
              )}

              <div className="border-t pt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Sipariş No</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Toplam</span>
                  <span className="font-semibold">₺{order.totalPrice}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Ürün Adedi</span>
                  <span className="font-medium">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}