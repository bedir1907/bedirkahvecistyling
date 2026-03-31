"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kayıt oluşturulamadı")
      }

      router.push("/hesabim")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kayıt oluşturulamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md border rounded-2xl p-8 bg-white">
        <h1 className="text-3xl font-bold mb-2">Kayıt Ol</h1>
        <p className="text-gray-500 mb-6">Yeni müşteri hesabı oluştur.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-2">Ad Soyad</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Ad Soyad"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-2">Telefon</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="05xx xxx xx xx"
            />
          </div>

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
              placeholder="En az 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-xl px-4 py-3 disabled:opacity-50"
          >
            {loading ? "Kayıt Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium text-black underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </main>
  )
}