"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage("")

      const res = await fetch("/api/customer/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Şifre güncellenemedi")
      }

      setSuccess(true)
      setMessage(data.message || "Şifre başarıyla güncellendi.")
    } catch (error) {
      setSuccess(false)
      setMessage(
        error instanceof Error ? error.message : "Şifre güncellenemedi"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fafaf8]">
      <div className="w-full max-w-md border border-black/10 rounded-3xl p-8 bg-white">
        <h1 className="text-3xl font-medium tracking-tight mb-2">
          Şifre Sıfırla
        </h1>
        <p className="text-gray-500 mb-6">
          Yeni şifreni belirle.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/10 rounded-2xl px-4 py-3"
                placeholder="Yeni şifre"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-2">
                Yeni Şifre Tekrar
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-black/10 rounded-2xl px-4 py-3"
                placeholder="Yeni şifre tekrar"
              />
            </div>

            <p className="text-xs text-gray-500 leading-6">
              Şifren en az 8 karakter olmalı ve en az 1 büyük harf, 1 küçük harf,
              1 rakam ve 1 özel karakter içermelidir.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-2xl px-4 py-3 disabled:opacity-50"
            >
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-[#fafaf8] px-4 py-3 text-sm text-gray-700">
              {message}
            </div>

            <Link
              href="/giris"
              className="w-full inline-flex items-center justify-center bg-black text-white rounded-2xl px-4 py-3"
            >
              Giriş Yap
            </Link>
          </div>
        )}

        {!success && message ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        ) : null}
      </div>
    </main>
  )
}