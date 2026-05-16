"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default function EditCategoryPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
    isFeatured: false,
    isActive: true,
    displayOrder: "0",
  })

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/admin/categories/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Kategori alınamadı")
        }

        setForm({
          name: data.name || "",
          slug: data.slug || "",
          image: data.image || "",
          isFeatured: data.isFeatured,
          isActive: data.isActive,
          displayOrder: String(data.displayOrder ?? 0),
        })
      } catch (error) {
        alert(error instanceof Error ? error.message : "Kategori alınamadı")
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategori güncellenemedi")
      }

      router.push("/bksy0net1mp4neli/categories")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategori güncellenemedi")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-10">Yükleniyor...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kategoriyi Düzenle</h1>
            <p className="text-gray-600 mt-1">Kategori bilgilerini güncelle</p>
          </div>

          <Link
            href="/bksy0net1mp4neli/categories"
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
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block font-medium">Kategori Görseli</label>

            <div className="flex flex-wrap items-center gap-3">
              <CloudinaryUploadButton
                buttonText="Bilgisayardan Görsel Seç"
                onUploadSuccess={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    image: url,
                  }))
                }
              />

              {form.image ? (
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      image: "",
                    }))
                  }
                  className="border border-red-200 text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 transition"
                >
                  Görseli Kaldır
                </button>
              ) : null}
            </div>

            {form.image ? (
              <div className="rounded-xl border p-3 bg-gray-50">
                <img
                  src={form.image}
                  alt="Kategori görsel önizleme"
                  className="w-full max-w-sm h-48 object-cover rounded-lg border"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
                Henüz kategori görseli seçilmedi.
              </div>
            )}
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
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </div>
    </main>
  )
}