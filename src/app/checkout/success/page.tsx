"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import AnnouncementBar from "@/components/store/AnnouncementBar"
//import StoreNavbar from "@/components/store/StoreNavbar"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const queryOrderNumber = searchParams.get("orderNumber")
  const clearCart = useCartStore((state) => state.clearCart)

  const fallbackOrderNumber =
    typeof window !== "undefined"
      ? localStorage.getItem("pendingOrderNumber")
      : null

  const orderNumber = useMemo(() => {
    return queryOrderNumber || fallbackOrderNumber || ""
  }, [queryOrderNumber, fallbackOrderNumber])

  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState("Ödemeniz kontrol ediliyor...")

  useEffect(() => {
    async function verify() {
      if (!orderNumber) {
        setVerifying(false)
        setVerified(false)
        setMessage("Sipariş numarası bulunamadı.")
        return
      }

      try {
        const res = await fetch("/api/payment/iyzico/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderNumber }),
        })

        const data = await res.json()

        if (data.state === "PAID") {
          clearCart()
          localStorage.removeItem("pendingOrderNumber")
          setVerified(true)
          setMessage("Ödemeniz başarıyla doğrulandı.")
        } else {
          setVerified(false)
          setMessage(data.message || "Ödeme henüz doğrulanamadı.")
        }
      } catch {
        setVerified(false)
        setMessage("Ödeme doğrulaması sırasında hata oluştu.")
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [orderNumber, clearCart])

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      

      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="rounded-3xl border bg-white p-10 text-center">
          <div className="text-5xl mb-5">{verified ? "✓" : "…"}</div>

          <h1 className="text-3xl font-semibold tracking-tight">
            {verifying
              ? "Ödeme Kontrol Ediliyor"
              : verified
                ? "Siparişiniz Alındı"
                : "Ödeme Doğrulanamadı"}
          </h1>

          <p className="text-gray-600 mt-3">{message}</p>

          {orderNumber ? (
            <p className="mt-4 text-sm text-gray-500">
              Sipariş Numaranız:{" "}
              <span className="font-medium text-black">{orderNumber}</span>
            </p>
          ) : null}

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition"
            >
              Alışverişe Dön
            </Link>

            {!verified && !verifying ? (
              <Link
                href="/checkout"
                className="px-6 py-3 rounded-2xl border hover:bg-gray-50 transition"
              >
                Checkout'a Dön
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}