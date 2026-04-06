"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
  emailVerified: boolean
} | null

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("Durum kontrol ediliyor...")
  const [customer, setCustomer] = useState<Customer>(null)

  useEffect(() => {
    async function init() {
      try {
        if (token) {
          const res = await fetch("/api/customer/verify-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || "Doğrulama başarısız")
          }

          setSuccess(true)
          setMessage("E-posta adresin doğrulandı. Artık hesabını kullanabilirsin.")
          return
        }

        const meRes = await fetch("/api/customer/me", { cache: "no-store" })
        const meData = await meRes.json()

        if (meRes.ok && meData.customer) {
          setCustomer(meData.customer)

          if (meData.customer.emailVerified) {
            setSuccess(true)
            setMessage("E-posta adresin zaten doğrulanmış.")
          } else {
            setSuccess(false)
            setMessage(
              "Hesabına giriş yaptın. Devam etmeden önce e-posta adresini doğrulaman gerekiyor."
            )
          }
        } else {
          setSuccess(false)
          setMessage("Doğrulama için önce giriş yapmalısın.")
        }
      } catch (error) {
        setSuccess(false)
        setMessage(
          error instanceof Error ? error.message : "Doğrulama işlemi başarısız"
        )
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [token])

  async function handleResend() {
    try {
      setResending(true)

      const res = await fetch("/api/customer/resend-verification", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Doğrulama e-postası gönderilemedi")
      }

      alert("Doğrulama e-postası tekrar gönderildi.")
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Doğrulama e-postası gönderilemedi"
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fafaf8]">
      <div className="w-full max-w-md border border-black/10 rounded-3xl p-8 bg-white text-center">
        <h1 className="text-3xl font-medium tracking-tight mb-4">
          {loading ? "Kontrol Ediliyor" : success ? "E-posta Doğrulandı" : "E-posta Doğrulama"}
        </h1>

        <p className="text-gray-600 leading-7">{message}</p>

        {!loading && customer && !customer.emailVerified && !token ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-[#fcfcfb] px-4 py-4 text-left">
            <div className="text-sm text-gray-500 mb-2">Doğrulama gönderilen adres</div>
            <div className="font-medium break-all">{customer.email}</div>
          </div>
        ) : null}

        {!loading && customer && !customer.emailVerified && !token ? (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-black text-white text-sm font-medium disabled:opacity-50"
            >
              {resending ? "Gönderiliyor..." : "Doğrulama E-postasını Tekrar Gönder"}
            </button>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-black/10 text-sm font-medium hover:bg-gray-50 transition"
            >
              Şimdilik Ana Sayfaya Dön
            </Link>
          </div>
        ) : null}

        {!loading && success ? (
          <div className="mt-6">
            <Link
              href="/hesabim"
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-black text-white text-sm font-medium"
            >
              Hesabıma Git
            </Link>
          </div>
        ) : null}

        {!loading && !customer && !token ? (
          <div className="mt-6">
            <Link
              href="/giris"
              className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-black text-white text-sm font-medium"
            >
              Giriş Yap
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  )
}