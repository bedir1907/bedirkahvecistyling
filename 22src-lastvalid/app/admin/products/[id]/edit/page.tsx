"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type Category = {
  id: number
  name: string
  slug: string
}

type Product = {
  id: number
  name: string
  slug: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  description: string
  sizes: string[]
  colors: string[]
  stock: number
  featured: boolean
  isNew: boolean
  isActive: boolean
  displayOrder: number
}

type Props = {
  params: Promise<{
    id: string
  }>
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    name: "",
    slug: "",
    price: "",
    oldPrice: "",
    image: "",
    category: "",
    description: "",
    sizes: "",
    colors: "",
    stock: "",
    featured: false,
    isNew: false,
    isActive: true,
    displayOrder: "0",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories/list"),
        ])

        const productData = await productRes.json()
        const categoriesData = await categoriesRes.json()

        if (!productRes.ok) {
          throw new Error(productData.error || "Ürün getirilemedi")
        }

        setCategories(categoriesData)

        const data: Product = productData

        setForm({
          name: data.name,
          slug: data.slug,
          price: String(data.price),
          oldPrice: data.oldPrice ? String(data.oldPrice) : "",
          image: data.image,
          category: data.category,
          description: data.description,
          sizes: data.sizes.join(", "),
          colors: data.colors.join(", "),
          stock: String(data.stock),
          featured: data.featured,
          isNew: data.isNew,
          isActive: data.isActive,
          displayOrder: String(data.displayOrder ?? 0),
        })
      } catch (error) {
        console.error(error)
        alert("Ürün yüklenirken hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          sizes: form.sizes.split(",").map((item) => item.trim()).filter(Boolean),
          colors: form.colors.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ürün güncellenemedi")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Ürün güncellenirken hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-3xl mx-auto py-10">Yükleniyor...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ürünü Düzenle</h1>
            <p className="text-gray-600 mt-1">Ürün bilgilerini güncelle</p>
          </div>

          <Link
            href="/admin/products"
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
            <label className="block mb-2 font-medium">Ürün Adı</label>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Fiyat</label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                className="w-full border rounded px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Eski Fiyat</label>
              <input
                name="oldPrice"
                value={form.oldPrice}
                onChange={handleChange}
                type="number"
                className="w-full border rounded px-4 py-3"
              />
            </div>
          </div>

          <div className="space-y-3">
  <label className="block font-medium">Kapak Görseli</label>

  <div className="flex flex-wrap items-center gap-3">
    <CloudinaryUploadButton
      buttonText="Bilgisayardan Kapak Görseli Seç"
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
        alt="Ürün kapak görsel önizleme"
        className="w-full max-w-sm h-56 object-cover rounded-lg border"
      />
    </div>
  ) : (
    <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
      Henüz kapak görseli seçilmedi.
    </div>
  )}
</div>

          <div>
            <label className="block mb-2 font-medium">Kategori</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Açıklama</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-4 py-3 min-h-[120px]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Bedenler (virgülle)</label>
              <input
                name="sizes"
                value={form.sizes}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Renkler (virgülle)</label>
              <input
                name="colors"
                value={form.colors}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Stok</label>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                className="w-full border rounded px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Vitrin Sırası</label>
              <input
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                type="number"
                className="w-full border rounded px-4 py-3"
              />
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            <span>Öne çıkan ürün</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isNew"
              checked={form.isNew}
              onChange={handleChange}
            />
            <span>Yeni gelen ürün</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span>Aktif ürün</span>
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