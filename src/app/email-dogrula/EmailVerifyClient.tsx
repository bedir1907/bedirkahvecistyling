"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function EmailVerifyClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setSuccess(false)
        setMessage("Doğrulama bağlantısı geçersiz.")
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/customer/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "E-posta doğrulanamadı")
        }

        setSuccess(true)
        setMessage(data.message || "E-posta adresin başarıyla doğrulandı.")
      } catch (error) {
        setSuccess(false)
        setMessage(
          error instanceof Error
            ? error.message
            : "E-posta doğrulanamadı"
        )
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black">
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-black/10 rounded-[28px] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Hesap İşlemleri
          </p>

          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
            E-posta Doğrulama
          </h1>

          {loading ? (
            <p className="text-gray-600 mt-4 leading-7">
              Doğrulama işlemi yapılıyor...
            </p>
          ) : (
            <p
              className={`mt-4 leading-7 ${
                success ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/giris"
              className="inline-flex items-center justify-center rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90 transition"
            >
              Giriş Yap
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