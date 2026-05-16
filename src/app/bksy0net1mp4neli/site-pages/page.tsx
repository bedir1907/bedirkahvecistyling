"use client"

import { useEffect, useState } from "react"

type EditablePageKey = "about" | "contact" | "shipping" | "returns"

type PageForm = {
  title: string
  content: string
}

type PageState = Record<EditablePageKey, PageForm>

const labels: Record<EditablePageKey, string> = {
  about: "Hakkımızda",
  contact: "İletişim",
  shipping: "Kargo ve Teslimat",
  returns: "İade ve Değişim",
}

const defaultState: PageState = {
  about: {
    title: "Hakkımızda",
    content: "",
  },
  contact: {
    title: "İletişim",
    content: "",
  },
  shipping: {
    title: "Kargo ve Teslimat",
    content: "",
  },
  returns: {
    title: "İade ve Değişim",
    content: "",
  },
}

export default function AdminSitePagesPage() {
  const [form, setForm] = useState<PageState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchPages() {
      try {
        const keys: EditablePageKey[] = ["about", "contact", "shipping", "returns"]

        const results = await Promise.all(
          keys.map(async (key) => {
            const res = await fetch(`/api/admin/site-pages/${key}`)
            const data = await res.json()

            if (!res.ok) {
              return {
                key,
                title: labels[key],
                content: "",
              }
            }

            return {
              key,
              title: data.title || labels[key],
              content: data.content || "",
            }
          })
        )

        const nextState = { ...defaultState }

        for (const item of results) {
          nextState[item.key as EditablePageKey] = {
            title: item.title,
            content: item.content,
          }
        }

        setForm(nextState)
      } catch (error) {
        console.error(error)
        alert("Sayfa içerikleri alınamadı")
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [])

  function handleChange(
    key: EditablePageKey,
    field: "title" | "content",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  async function handleSave() {
    try {
      setSaving(true)

      const keys: EditablePageKey[] = ["about", "contact", "shipping", "returns"]

      for (const key of keys) {
        const page = form[key]

        const res = await fetch(`/api/admin/site-pages/${key}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: page.title,
            content: page.content,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || `${labels[key]} kaydedilemedi`)
        }
      }

      alert("Sayfa içerikleri kaydedildi.")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kaydetme başarısız")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto py-10">
          <div className="bg-white rounded-xl shadow p-8">Yükleniyor...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Sayfa İçerikleri</h1>
            <p className="text-gray-600 mt-1">
              Hakkımızda, iletişim, kargo ve iade metinlerini buradan yönetebilirsin
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white px-5 py-3 rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        <div className="space-y-6">
          {(["about", "contact", "shipping", "returns"] as EditablePageKey[]).map((key) => (
            <div key={key} className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">{labels[key]}</h2>

              <div>
                <label className="block mb-2 font-medium">Başlık</label>
                <input
                  value={form[key].title}
                  onChange={(e) => handleChange(key, "title", e.target.value)}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">İçerik</label>
                <textarea
                  value={form[key].content}
                  onChange={(e) => handleChange(key, "content", e.target.value)}
                  className="w-full border rounded px-4 py-3 min-h-[220px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}