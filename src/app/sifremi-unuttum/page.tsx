"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage("")

      const res = await fetch("/api/customer/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "İşlem başarısız")
      }

      setMessage(
        data.message ||
          "Eğer bu e-posta sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir."
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "İşlem başarısız"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fafaf8]">
      <div className="w-full max-w-md border border-black/10 rounded-3xl p-8 bg-white">
        <h1 className="text-3xl font-medium tracking-tight mb-2">
          Şifremi Unuttum
        </h1>
        <p className="text-gray-500 mb-6">
          E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/10 rounded-2xl px-4 py-3"
              placeholder="ornek@mail.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-2xl px-4 py-3 disabled:opacity-50"
          >
            {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-gray-700">
            {message}
          </div>
        ) : null}

        <div className="mt-6 text-sm text-center">
          <Link href="/giris" className="text-black underline">
            Giriş ekranına dön
          </Link>
        </div>
      </div>
    </main>
  )
}