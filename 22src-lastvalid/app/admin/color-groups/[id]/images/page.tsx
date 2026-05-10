"use client"

import Image from "next/image"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type ColorGroupImage = {
  id: number
  url: string
  alt?: string | null
  sortOrder: number
  isCover: boolean
}

type ColorGroupDetail = {
  id: number
  colorName: string
  product: {
    id: number
    name: string
  }
}

type Props = {
  params: Promise<{
    id: string
  }>
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

export default function AdminColorGroupImagesPage({ params }: Props) {
  const { id } = use(params)

  const [images, setImages] = useState<ColorGroupImage[]>([])
  const [detail, setDetail] = useState<ColorGroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    url: "",
    alt: "",
    sortOrder: "0",
    isCover: false,
  })

  async function fetchData() {
    try {
      const [imagesRes, groupRes] = await Promise.all([
        fetch(`/api/admin/color-groups/${id}/images`),
        fetch(`/api/admin/color-groups/${id}`),
      ])

      const imagesData = await imagesRes.json()
      const groupData = await groupRes.json()

      if (!imagesRes.ok) {
        throw new Error(imagesData.error || "Görseller alınamadı")
      }

      if (!groupRes.ok) {
        throw new Error(groupData.error || "Renk bilgisi alınamadı")
      }

      setImages(imagesData)
      setDetail({
        id: groupData.id,
        colorName: groupData.colorName,
        product: {
          id: groupData.productId ?? groupData.product?.id ?? 0,
          name: groupData.product?.name ?? "Ürün",
        },
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Veriler alınamadı")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

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

  async function addImage() {
    if (!form.url.trim()) {
      alert("Görsel URL zorunlu")
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/color-groups/${id}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: form.url,
          alt: form.alt,
          sortOrder: Number(form.sortOrder || 0),
          isCover: form.isCover,
        }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || "Görsel eklenemedi")
      }

      setForm({
        url: "",
        alt: "",
        sortOrder: "0",
        isCover: false,
      })

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Görsel eklenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function makeCover(imageId: number) {
    try {
      const res = await fetch(`/api/admin/color-group-images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCover: true,
        }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || "Kapak seçilemedi")
      }

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kapak seçilemedi")
    }
  }

  async function deleteImage(imageId: number) {
    const confirmed = window.confirm("Bu görseli silmek istediğine emin misin?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/color-group-images/${imageId}`, {
        method: "DELETE",
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || "Görsel silinemedi")
      }

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Görsel silinemedi")
    }
  }

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>
  }

  return (
    <main className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Renk Görselleri</h1>
          <p className="text-gray-600 mt-1">
            {detail?.product.name} / {detail?.colorName}
          </p>
        </div>

        <Link
          href="/admin/products"
          className="border border-black px-4 py-3 rounded-xl hover:bg-black hover:text-white"
        >
          Ürünlere Dön
        </Link>
      </div>

      <div className="bg-white border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Yeni Görsel Ekle</h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <input
            name="url"
            value={form.url}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3 md:col-span-2 xl:col-span-4"
            placeholder="Görsel URL"
          />

          <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
            <CloudinaryUploadButton
              buttonText="Renk Görseli Yükle"
              onUploadSuccess={(url) =>
                setForm((prev) => ({ ...prev, url }))
              }
            />

            {form.url && (
              <span className="text-sm text-green-700 self-center">
                Görsel hazır
              </span>
            )}
          </div>

          <input
            name="alt"
            value={form.alt}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3"
            placeholder="Alt metin"
          />

          <input
            name="sortOrder"
            type="number"
            value={form.sortOrder}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3"
            placeholder="Sıra"
          />

          <label className="flex items-center gap-2 text-[15px]">
            <input
              type="checkbox"
              name="isCover"
              checked={form.isCover}
              onChange={handleChange}
            />
            <span>Kapak görsel olsun</span>
          </label>

          <div>
            <button
              type="button"
              onClick={addImage}
              disabled={saving}
              className="border border-black px-4 py-3 rounded-xl hover:bg-black hover:text-white disabled:opacity-50"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="bg-white border rounded-2xl p-8 text-gray-500">
          Bu renk için henüz görsel yok.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white border rounded-2xl overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={img.url || FALLBACK_IMAGE}
                  alt={img.alt || detail?.colorName || "Renk görseli"}
                  fill
                  className="object-cover"
                  sizes="400px"
                />

                {img.isCover && (
                  <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-2 rounded-full">
                    Kapak
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-600 break-all">
                  {img.alt || "Alt metin yok"}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Sıra: {img.sortOrder}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => makeCover(img.id)}
                      className="border border-black px-3 py-2 rounded-xl hover:bg-black hover:text-white"
                    >
                      Kapak Yap
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteImage(img.id)}
                    className="border border-red-500 text-red-500 px-3 py-2 rounded-xl hover:bg-red-500 hover:text-white"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}