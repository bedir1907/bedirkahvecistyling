"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function CheckoutFailClient() {
  const searchParams = useSearchParams()

  const error =
    searchParams.get("error") ||
    "Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin."

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black">
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-black/10 rounded-[28px] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Ödeme Sonucu
          </p>

          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            Ödeme Başarısız
          </h1>

          <p className="text-gray-600 mt-4 leading-7">
            {error}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Checkout’a Dön
            </Link>

            <Link
              href="/cart"
              className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium hover:bg-gray-50 transition"
            >
              Sepete Dön
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}