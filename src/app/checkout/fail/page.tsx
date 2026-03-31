"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import AnnouncementBar from "@/components/store/AnnouncementBar"
//import StoreNavbar from "@/components/store/StoreNavbar"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"

export default function CheckoutFailPage() {
  const router = useRouter()
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

  const [checking, setChecking] = useState(true)
  const [message, setMessage] = useState(
    "Ödeme sonucu tekrar kontrol ediliyor..."
  )

  useEffect(() => {
    async function verify() {
      if (!orderNumber) {
        setChecking(false)
        setMessage("Ödeme tamamlanamadı. Yeniden deneyebilirsin.")
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
          router.replace(
            `/checkout/success?orderNumber=${encodeURIComponent(orderNumber)}`
          )
          return
        }

        if (data.state === "PENDING") {
          setMessage(
            "Ödeme henüz kesinleşmemiş görünüyor. Birkaç saniye sonra tekrar deneyebilirsin."
          )
        } else {
          setMessage(data.message || "Ödeme tamamlanamadı. Yeniden deneyebilirsin.")
        }
      } catch {
        setMessage("Ödeme kontrolü sırasında hata oluştu. Yeniden deneyebilirsin.")
      } finally {
        setChecking(false)
      }
    }

    verify()
  }, [orderNumber, router, clearCart])

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      

      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="rounded-3xl border bg-white p-10 text-center">
          <div className="text-5xl mb-5">!</div>

          <h1 className="text-3xl font-semibold tracking-tight">
            {checking ? "Ödeme Kontrol Ediliyor" : "Ödeme Tamamlanamadı"}
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
              href="/checkout"
              className="px-6 py-3 rounded-2xl bg-black text-white hover:opacity-90 transition"
            >
              Tekrar Dene
            </Link>

            {orderNumber ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-2xl border hover:bg-gray-50 transition"
              >
                Ödemeyi Tekrar Kontrol Et
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}