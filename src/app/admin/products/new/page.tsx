"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type Category = {
  id: number
  name: string
  slug: string
}

export default function NewProductPage() {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    productCode: "",
    name: "",
    slug: "",
    color: "",
    groupCode: "",
    price: "",
    oldPrice: "",
    image: "",
    category: "",
    description: "",
    featured: false,
    isNew: false,
    isActive: true,
    displayOrder: "0",
  })

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/admin/categories/list")
        const data = await res.json()
        setCategories(data)
        if (data.length > 0) {
          setForm((prev) => ({ ...prev, category: data[0].name }))
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchCategories()
  }, [])

  // İsimden otomatik slug üret
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const slug = value
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
    setForm((prev) => ({ ...prev, name: value, slug }))
  }

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
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: form.productCode,
          name: form.name,
          slug: form.slug,
          color: form.color,
          groupCode: form.groupCode,
          price: Number(form.price),
          oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
          image: form.image,
          category: form.category,
          description: form.description,
          featured: form.featured,
          isNew: form.isNew,
          isActive: form.isActive,
          displayOrder: Number(form.displayOrder),
          sizes: [],
          colors: [],
          stock: 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ürün eklenemedi")
      }

      // Ürün oluşturulduktan sonra renk grupları sayfasına yönlendir
      router.push(`/admin/color-groups/${data.id}/images`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ürün eklenemedi")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-black/40 transition text-sm"

  return (
    <main>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Ürünü kaydettikten sonra renk grupları ve beden/stok bilgilerini ekleyebilirsiniz.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-sm border rounded-xl px-4 py-2 hover:bg-gray-50 transition"
        >
          ← Geri
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

        {/* Temel Bilgiler */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Ürün Kodu <span className="text-red-500">*</span>
              </label>
              <input
                name="productCode"
                value={form.productCode}
                onChange={handleChange}
                className={inputCls}
                placeholder="En az 8 haneli sayı (ör: 10000001)"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Sadece rakam, en az 8 hane</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Group Code <span className="text-red-500">*</span>
              </label>
              <input
                name="groupCode"
                value={form.groupCode}
                onChange={handleChange}
                className={inputCls}
                placeholder="ör: GROUP-001"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Aynı ürünün farklı renkleri aynı kodu paylaşır</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Ürün Adı <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleNameChange}
              className={inputCls}
              placeholder="ör: Basic Oversize Tişört"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className={inputCls}
                placeholder="otomatik oluşur"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Renk <span className="text-red-500">*</span>
              </label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                className={inputCls}
                placeholder="ör: Siyah"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputCls}
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Açıklama</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputCls} min-h-[120px]`}
              placeholder="Ürün açıklaması..."
            />
          </div>
        </div>

        {/* Fiyat */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Fiyat</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Satış Fiyatı (₺) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                className={inputCls}
                placeholder="599"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Eski Fiyat (₺) <span className="text-gray-400 font-normal">opsiyonel</span>
              </label>
              <input
                name="oldPrice"
                value={form.oldPrice}
                onChange={handleChange}
                type="number"
                className={inputCls}
                placeholder="799"
              />
            </div>
          </div>
        </div>

        {/* Kapak Görseli */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Kapak Görseli</h2>
          <p className="text-sm text-gray-500">
            Bu görsel ürün listelerinde gösterilir. Renk grupları sayfasından her renk için ayrı görseller ekleyebilirsiniz.
          </p>

          <CloudinaryUploadButton
            buttonText="Kapak Görseli Yükle"
            onUploadSuccess={(url) => setForm((prev) => ({ ...prev, image: url }))}
          />

          {form.image && (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border">
              <img src={form.image} alt="Kapak" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black transition"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Vitrin Ayarları */}
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Vitrin Ayarları</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Vitrin Sırası</label>
              <input
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                type="number"
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: "featured", label: "⭐ Öne çıkan ürün", sub: "Ana sayfada öne çıkan bölümünde göster" },
              { name: "isNew", label: "🆕 Yeni gelen ürün", sub: "Yeni gelenler bölümünde göster" },
              { name: "isActive", label: "✅ Aktif", sub: "Mağazada görünsün" },
            ].map((item) => (
              <label key={item.name} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.name}
                  checked={form[item.name as keyof typeof form] as boolean}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Ürünü Kaydet →"}
          </button>
          <Link
            href="/admin/products"
            className="border px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            İptal
          </Link>
        </div>
      </form>
    </main>
  )
}
