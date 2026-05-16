"use client"

import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { formatPrice } from "@/lib/format"

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
  params: Promise<{ id: string }>
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    PAID: "Ödeme Alındı", APPROVED: "Sipariş Onaylandı",
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

function getAvailableStatuses(currentStatus: string) {
  const map: Record<string, string[]> = {
    PENDING: ["PENDING", "CANCELLED"],
    PAID: ["APPROVED", "CANCELLED"],
    APPROVED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: ["DELIVERED"],
    CANCELLED: ["CANCELLED"],
    REFUNDED: ["REFUNDED"],
    FAILED: ["FAILED"],
    FAILED_PAYMENT: ["FAILED_PAYMENT"],
  }
  return map[currentStatus] ?? [currentStatus]
}

export default function AdminOrderDetailPage({ params }: Props) {
  const { id } = use(params)

  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setError("")
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Sipariş getirilemedi")
        setOrder(data)
        setStatus(data.status)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sipariş getirilemedi")
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  useEffect(() => {
    if (!order) return
    const nextStatuses = getAvailableStatuses(order.status)
    if (!nextStatuses.includes(status)) setStatus(nextStatuses[0] || "")
  }, [order, status])

  async function updateStatus() {
    if (!order) return
    try {
      setSaving(true)
      setError("")
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Sipariş güncellenemedi")
      setOrder(data)
      setStatus(data.status)
      showSuccess("Sipariş durumu güncellendi ✓")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sipariş güncellenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function refundOrder() {
    if (!order) return
    setShowRefundConfirm(false)
    try {
      setRefunding(true)
      setError("")
      const res = await fetch(`/api/admin/orders/${order.id}/refund`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "İade yapılamadı")

      const refreshRes = await fetch(`/api/admin/orders/${order.id}`)
      const refreshedOrder = await refreshRes.json()
      if (!refreshRes.ok) throw new Error(refreshedOrder.error || "Sipariş yenilenemedi")

      setOrder(refreshedOrder)
      setStatus(refreshedOrder.status)
      showSuccess("İade başarıyla gerçekleştirildi ✓")
    } catch (err) {
      setError(err instanceof Error ? err.message : "İade yapılamadı")
    } finally {
      setRefunding(false)
    }
  }

  const availableStatuses = useMemo(() => order ? getAvailableStatuses(order.status) : [], [order])

  if (loading) {
    return (
      <main>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error || "Sipariş bulunamadı."}
        </div>
      </main>
    )
  }

  const isCancelled = order.status === "CANCELLED"
  const isRefunded = order.status === "REFUNDED"
  const isFailed = order.status === "FAILED" || order.status === "FAILED_PAYMENT"
  const canRefund = ["PAID", "APPROVED", "SHIPPED", "DELIVERED"].includes(order.status)

  return (
    <main>
      <div className="max-w-[1200px] mx-auto">

        {/* Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <Link href="/bksy0net1mp4neli/orders" className="text-sm text-gray-500 hover:text-black transition">
              ← Siparişlere Dön
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{order.orderNumber}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date(order.createdAt).toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            {order.stockRestored && order.status === "CANCELLED" && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Stok iade edildi</span>
            )}
            {order.status === "REFUNDED" && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Ödeme iade edildi</span>
            )}
          </div>
        </div>

        {/* Genel mesajlar */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700 mb-4">
            {successMsg}
          </div>
        )}

        {/* İade onay kutusu */}
        {showRefundConfirm && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-4 mb-4">
            <p className="font-semibold text-purple-900 mb-1">İade Onayı</p>
            <p className="text-sm text-purple-700 mb-4">
              {formatPrice(order.totalPrice)} tutarındaki ödeme Iyzico üzerinden iade edilecek. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={refundOrder} disabled={refunding}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50">
                {refunding ? "İade Ediliyor..." : "Evet, İade Et"}
              </button>
              <button type="button" onClick={() => setShowRefundConfirm(false)}
                className="border px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                Vazgeç
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">

          {/* Sol: ürünler + teslimat */}
          <div className="space-y-5">

            {/* Ürünler */}
            <div className="bg-white rounded-2xl border p-5 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Sipariş Ürünleri</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="border rounded-2xl p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Renk: {item.color || "—"} · Beden: {item.size || "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} adet × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-sm shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teslimat */}
            <div className="bg-white rounded-2xl border p-5 md:p-6">
              <h2 className="text-lg font-semibold mb-4">Teslimat Bilgileri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  ["Ad Soyad", order.name],
                  ["Telefon", order.phone],
                  ["E-posta", order.email],
                  ["Şehir / İlçe", `${order.city} / ${order.district}`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-gray-500 mb-0.5">{label}</p>
                    <p className="font-medium">{val}</p>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <p className="text-gray-500 mb-0.5">Adres</p>
                  <p className="font-medium whitespace-pre-line">{order.address}</p>
                </div>
                {order.note && (
                  <div className="sm:col-span-2">
                    <p className="text-gray-500 mb-0.5">Sipariş Notu</p>
                    <p className="font-medium whitespace-pre-line">{order.note}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sağ: sipariş yönetimi */}
          <aside className="bg-white rounded-2xl border p-5 md:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold mb-5">Sipariş Yönetimi</h2>

            <div className="space-y-4">

              {/* Durum seçimi */}
              <div>
                <p className="text-sm text-gray-500 mb-1.5">Sonraki İşlem</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isCancelled || isRefunded || isFailed}
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 ${
                    isCancelled || isRefunded || isFailed ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                  }`}
                >
                  {availableStatuses.map((s) => (
                    <option key={s} value={s}>{getStatusLabel(s)}</option>
                  ))}
                </select>
              </div>

              {/* Güncelle butonu */}
              <button
                type="button"
                onClick={updateStatus}
                disabled={saving || isCancelled || isRefunded || isFailed || !status || status === order.status}
                className="w-full bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "Kaydediliyor..." :
                  isCancelled ? "Sipariş İptal Edildi" :
                  isRefunded ? "Sipariş İade Edildi" :
                  isFailed ? "Ödeme Alınamadı" :
                  "Durumu Güncelle"}
              </button>

              {/* İade butonu */}
              {canRefund && !showRefundConfirm && (
                <button
                  type="button"
                  onClick={() => setShowRefundConfirm(true)}
                  className="w-full border border-purple-300 text-purple-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
                >
                  Ödemeyi İade Et
                </button>
              )}

              {/* Durum bilgi kutuları */}
              {isCancelled && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Bu sipariş iptal edildiği için tekrar değiştirilemez.
                </div>
              )}
              {isRefunded && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
                  Bu siparişin ödemesi iade edildi.
                </div>
              )}
              {isFailed && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Bu siparişte ödeme tamamlanmadı.
                </div>
              )}

              {/* Özet */}
              <div className="border-t pt-4 space-y-2.5 text-sm">
                {[
                  ["Sipariş No", order.orderNumber],
                  ["Toplam", formatPrice(order.totalPrice)],
                  ["Ürün Adedi", String(order.items.reduce((s, i) => s + i.quantity, 0))],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>

            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}