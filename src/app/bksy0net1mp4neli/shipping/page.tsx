"use client"

import { useEffect, useState } from "react"
import { formatPrice } from "@/lib/format"

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fee, setFee] = useState("")
  const [freeAbove, setFreeAbove] = useState("")
  const [hasFreeThreshold, setHasFreeThreshold] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/shipping")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Ayarlar alınamadı")
        setFee(String(data.fee ?? 0))
        setFreeAbove(data.freeAbove ? String(data.freeAbove) : "")
        setHasFreeThreshold(data.freeAbove !== null && data.freeAbove !== undefined)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ayarlar alınamadı")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  async function save() {
    setSaving(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fee: Number(fee) || 0,
          freeAbove: hasFreeThreshold && freeAbove ? Number(freeAbove) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi")
      setSuccess("Kargo ayarları güncellendi ✓")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi")
    } finally {
      setSaving(false)
    }
  }

  const feeNum = Number(fee) || 0
  const freeAboveNum = Number(freeAbove) || 0

  if (loading) {
    return (
      <main>
        <div className="max-w-lg animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kargo Ayarları</h1>
          <p className="text-gray-500 mt-1 text-sm">Kargo ücretini ve ücretsiz kargo eşiğini ayarla.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">{success}</div>}

        <div className="bg-white rounded-2xl border p-6 space-y-5">

          {/* Kargo ücreti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kargo Ücreti (₺)
            </label>
            <input
              type="number"
              min="0"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition"
              placeholder="ör: 49"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              0 girersen kargo ücretsiz olur.
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* Ücretsiz kargo eşiği */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900 text-sm">Belirli Tutarın Üzerinde Ücretsiz Kargo</p>
                <p className="text-xs text-gray-500 mt-0.5">Sipariş tutarı bu eşiği geçince kargo ücretsiz olur</p>
              </div>
              <button
                type="button"
                onClick={() => { setHasFreeThreshold(p => !p); if (hasFreeThreshold) setFreeAbove("") }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${hasFreeThreshold ? "bg-black" : "bg-gray-200"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${hasFreeThreshold ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>

            {hasFreeThreshold && (
              <input
                type="number"
                min="0"
                value={freeAbove}
                onChange={(e) => setFreeAbove(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition"
                placeholder="ör: 500"
              />
            )}
          </div>

          {/* Önizleme */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-4">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Müşteri Görünümü</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kargo</span>
                <span className="font-medium">{feeNum === 0 ? "Ücretsiz" : formatPrice(feeNum)}</span>
              </div>
              {hasFreeThreshold && freeAboveNum > 0 && feeNum > 0 && (
                <p className="text-xs text-green-600">
                  {formatPrice(freeAboveNum)} ve üzeri siparişlerde ücretsiz kargo
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </main>
  )
}