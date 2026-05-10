"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Giriş yapılamadı")
      }

      router.push("/hesabim")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Giriş yapılamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border rounded-2xl p-8 bg-white">
        <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
        <p className="text-gray-500 mb-6">Müşteri hesabınla giriş yap.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="ornek@mail.com"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="••••••••"
            />
          </div>

          <div className="text-right">
            <Link
              href="/sifremi-unuttum"
              className="text-sm text-gray-600 hover:text-black transition underline"
            >
              Şifremi unuttum
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-xl px-4 py-3 disabled:opacity-50"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-medium text-black underline">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </main>
  )
}