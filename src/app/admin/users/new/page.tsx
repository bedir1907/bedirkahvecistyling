"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewUserPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES",
  })

  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kullanıcı eklenemedi")
      }

      router.push("/admin/users")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Yeni Kullanıcı Ekle</h1>
            <p className="text-gray-600 mt-1">
              Yetkili kullanıcı oluştur
            </p>
          </div>

          <Link
            href="/admin/users"
            className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white"
          >
            Geri Dön
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-5"
        >
          <div>
            <label className="block mb-2 font-medium">Ad Soyad</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Şifre</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
            >
              <option value="SALES">SALES</option>
              <option value="MANAGER">MANAGER</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Kullanıcıyı Kaydet"}
          </button>
        </form>
      </div>
    </main>
  )
}