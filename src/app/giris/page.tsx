"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      setLoading(true)

      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Giriş yapılamadı")

      router.push("/hesabim")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fafaf8]">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block leading-none">
            <span className="block text-[15px] font-semibold tracking-[0.22em] uppercase text-black">Bedir Kahveci</span>
            <span className="block text-[10px] font-light tracking-[0.35em] uppercase text-black/40">Styling</span>
          </Link>
        </div>

        <div className="border border-black/10 rounded-3xl p-8 bg-white shadow-sm">
          <h1 className="text-2xl font-medium tracking-tight mb-1">Giriş Yap</h1>
          <p className="text-gray-500 text-sm mb-7">Müşteri hesabınla giriş yap.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                placeholder="ornek@mail.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-xl px-4 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link href="/sifremi-unuttum" className="text-gray-500 hover:text-black transition">
              Şifremi unuttum
            </Link>
            <Link href="/kayit" className="text-black font-medium hover:opacity-70 transition">
              Hesap oluştur →
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}