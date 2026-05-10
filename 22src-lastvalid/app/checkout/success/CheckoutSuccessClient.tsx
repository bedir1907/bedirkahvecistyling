"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black">
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-black/10 rounded-[28px] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Sipariş Sonucu
          </p>

          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Ödeme Başarılı
          </h1>

          <p className="text-gray-600 mt-4 leading-7">
            Siparişin başarıyla alındı.
            {orderNumber ? ` Sipariş numaran: ${orderNumber}` : ""}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/siparislerim"
              className="inline-flex items-center justify-center rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Siparişlerime Git
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium hover:bg-gray-50 transition"
            >
              Anasayfaya Dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}