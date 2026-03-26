"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreNavbar from "@/components/store/StoreNavbar"
import StoreFooter from "@/components/store/StoreFooter"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      <StoreNavbar />

      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="rounded-3xl border bg-white p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6 text-2xl">
            ✓
          </div>

          <h1 className="text-3xl font-semibold mb-3">Siparişin Alındı</h1>
          <p className="text-gray-600 mb-3">
            Siparişin başarıyla oluşturuldu.
          </p>

          {orderId ? (
            <p className="text-sm text-gray-500 mb-8">
              Sipariş Numaran: <span className="font-medium">#{orderId}</span>
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition"
            >
              Anasayfaya Dön
            </Link>

            <Link
              href="/cart"
              className="px-6 py-3 rounded-2xl border hover:bg-black hover:text-white transition"
            >
              Sepete Git
            </Link>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}