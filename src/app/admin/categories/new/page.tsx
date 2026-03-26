"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewCategoryPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
    isFeatured: false,
    isActive: true,
    displayOrder: "0",
  })

  const [loading, setLoading] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategori eklenemedi")
      }

      router.push("/admin/categories")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategori eklenemedi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Yeni Kategori Ekle</h1>
            <p className="text-gray-600 mt-1">
              Yeni kategori bilgilerini gir
            </p>
          </div>

          <Link
            href="/admin/categories"
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
            <label className="block mb-2 font-medium">Kategori Adı</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              placeholder="T-Shirt"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              placeholder="t-shirt"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Görsel URL</label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Vitrin Sırası</label>
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            <span>Ana sayfada göster</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span>Aktif kategori</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Kategoriyi Kaydet"}
          </button>
        </form>
      </div>
    </main>
  )
}