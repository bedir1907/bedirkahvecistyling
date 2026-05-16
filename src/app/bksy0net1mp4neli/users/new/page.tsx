"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type AdminRole = "CREATOR" | "MANAGER" | "SALES"

function getRoleDescription(role: AdminRole) {
  switch (role) {
    case "SALES":
      return "Siparişleri görür, müşteri bilgilerini görür, satış ve gönderim süreçlerini yönetir."
    case "MANAGER":
      return "Sales yetkilerine ek olarak ürün, stok ve kategori yönetimi yapar."
    case "CREATOR":
      return "Tüm sistemi yönetir, kullanıcı oluşturur, yetki verir ve tüm kritik işlemleri yapar."
    default:
      return ""
  }
}

export default function NewAdminUserPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES" as AdminRole,
    isActive: true,
  })

  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        throw new Error(data.error || "Kullanıcı oluşturulamadı")
      }

      alert("Kullanıcı oluşturuldu")
      router.push("/bksy0net1mp4neli/users")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kullanıcı oluşturulamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Yeni Kullanıcı Ekle</h1>
          <p className="text-gray-600 mt-1">
            Yeni admin kullanıcı oluştur ve rolünü belirle.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Ad Soyad</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Ad Soyad"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-posta</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="mail@ornek.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Şifre</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Şifre"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="SALES">SALES</option>
              <option value="MANAGER">MANAGER</option>
              <option value="CREATOR">CREATOR</option>
            </select>
          </div>

          <div className="rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {getRoleDescription(form.role)}
          </div>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span>Aktif kullanıcı</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kullanıcıyı Oluştur"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/bksy0net1mp4neli/users")}
              className="border px-5 py-3 rounded-xl"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}