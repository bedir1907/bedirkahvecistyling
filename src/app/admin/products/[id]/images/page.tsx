"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type ProductImage = {
  id: number
  url: string
  alt: string | null
  color: string | null
  sortOrder: number
  isCover: boolean
}

type Product = {
  id: number
  name: string
  colors: string[]
}

type Props = {
  params: Promise<{
    id: string
  }>
}

export default function AdminProductImagesPage({ params }: Props) {
  const { id } = use(params)

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    url: "",
    alt: "",
    color: "",
  })

  async function fetchData() {
    try {
      const [productRes, imagesRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch(`/api/admin/products/${id}/images`),
      ])

      const productData = await productRes.json()
      const imagesData = await imagesRes.json()

      if (!productRes.ok) {
        throw new Error(productData.error || "Ürün getirilemedi")
      }

      if (!imagesRes.ok) {
        throw new Error(imagesData.error || "Görseller getirilemedi")
      }

      setProduct(productData)
      setImages(imagesData)
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function addImage() {
    if (!form.url.trim()) {
      alert("Görsel URL zorunlu")
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${id}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Görsel eklenemedi")
      }

      setForm({
        url: "",
        alt: "",
        color: "",
      })

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Görsel eklenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function deleteImage(imageId: number) {
    const confirmed = window.confirm("Bu görseli silmek istediğine emin misin?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/product-images/${imageId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Görsel silinemedi")
      }

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Görsel silinemedi")
    }
  }

  async function makeCover(imageId: number) {
    try {
      const res = await fetch(`/api/admin/product-images/${imageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          makeCover: true,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kapak görsel seçilemedi")
      }

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kapak görsel seçilemedi")
    }
  }

  if (loading) {
    return <div className="p-10">Yükleniyor...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ürün Görselleri</h1>
            <p className="text-gray-600 mt-1">
              {product?.name || "Ürün"} için görselleri yönet
            </p>
          </div>

          <Link
            href="/admin/products"
            className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white"
          >
            Ürünlere Dön
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-8">
  <h2 className="text-xl font-semibold mb-4">Yeni Görsel Ekle</h2>

  <div className="grid md:grid-cols-[1fr_1fr_220px] gap-4 mb-4">
    <input
      name="url"
      value={form.url}
      onChange={handleChange}
      placeholder="Görsel URL"
      className="border rounded px-4 py-3"
    />

    <input
      name="alt"
      value={form.alt}
      onChange={handleChange}
      placeholder="Alt metin"
      className="border rounded px-4 py-3"
    />

    <select
      name="color"
      value={form.color}
      onChange={handleChange}
      className="border rounded px-4 py-3"
    >
      <option value="">Genel görsel</option>
      {product?.colors?.map((color) => (
        <option key={color} value={color}>
          {color}
        </option>
      ))}
    </select>
  </div>

  <div className="flex flex-wrap gap-3">
    <CloudinaryUploadButton
      buttonText="Görsel Yükle"
      onUploadSuccess={(url) =>
        setForm((prev) => ({ ...prev, url }))
      }
    />
{form.url && (
  <div className="mt-4">
    <img
      src={form.url}
      alt="Önizleme"
      className="w-32 h-32 object-cover rounded border"
    />
  </div>
)}
    <button
      type="button"
      onClick={addImage}
      disabled={saving}
      className="bg-black text-white px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
    >
      {saving ? "Ekleniyor..." : "Ekle"}
    </button>

    {form.url && (
      <span className="text-sm text-green-700 self-center">
        Görsel hazır
      </span>
    )}
  </div>
</div>

        <div className="grid md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-xl shadow overflow-hidden"
            >
              <div className="relative">
                <Image
                  src={img.url}
                  alt={img.alt || product?.name || "Ürün görseli"}
                  width={500}
                  height={500}
                  className="w-full h-64 object-cover"
                />

                {img.isCover && (
                  <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 rounded-full">
                    Kapak
                  </span>
                )}

                {img.color && (
                  <span className="absolute top-3 right-3 bg-white text-black text-xs px-3 py-1 rounded-full border">
                    {img.color}
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-600 break-all mb-2">
                  {img.alt || "Alt metin yok"}
                </p>

                <p className="text-xs text-gray-500 mb-4">
                  {img.color || "Genel görsel"}
                </p>

                <div className="flex gap-2">
                  {!img.isCover && (
                    <button
                      type="button"
                      onClick={() => makeCover(img.id)}
                      className="border border-black px-3 py-2 rounded hover:bg-black hover:text-white"
                    >
                      Kapak Yap
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteImage(img.id)}
                    className="border border-red-500 text-red-500 px-3 py-2 rounded hover:bg-red-500 hover:text-white"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 mt-6">
            Bu ürün için henüz görsel yok.
          </div>
        )}
      </div>
    </main>
  )
}