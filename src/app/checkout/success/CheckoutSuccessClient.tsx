"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useCartStore } from "@/store/cartStore"

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  const clearCart = useCartStore((state) => state.clearCart)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Sepeti temizle
    clearCart()
    // localStorage'ı temizle
    try {
      localStorage.removeItem("pendingOrderNumber")
    } catch {}
    // Animasyon için kısa gecikme
    setTimeout(() => setShow(true), 100)
  }, [clearCart])

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black flex items-center justify-center px-4 py-16">
      <div
        className={`w-full max-w-lg transition-all duration-500 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="bg-white border border-black/10 rounded-[28px] p-8 md:p-10 text-center">

          {/* Başarı ikonu */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">
            Sipariş Onaylandı
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Ödeme Başarılı! 🎉
          </h1>

          <p className="text-gray-500 leading-7 text-sm mb-2">
            Siparişin başarıyla alındı. En kısa sürede hazırlanıp kargoya verilecek.
          </p>

          {orderNumber && (
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-black/8 rounded-2xl px-4 py-2.5 mt-3 mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Sipariş No</span>
              <span className="font-semibold text-black text-sm">{orderNumber}</span>
            </div>
          )}

          <p className="text-xs text-gray-400 mb-8">
            Sipariş onay e-postası kayıtlı e-posta adresine gönderildi.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/siparislerim"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Siparişlerimi Görüntüle
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-black/10 px-6 py-3 text-sm font-medium hover:bg-gray-50 transition"
            >
              Alışverişe Devam Et
            </Link>
          </div>

        </div>

        {/* Güven notu */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {["🔒 Güvenli ödeme", "🚚 Ücretsiz kargo", "↩️ Kolay iade"].map((item) => (
            <span key={item} className="text-xs text-gray-400">{item}</span>
          ))}
        </div>

      </div>
    </main>
  )
}