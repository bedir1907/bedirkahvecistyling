"use client"

import { use, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"
import { slugify } from "@/lib/slugify"

type Category = { id: number; name: string; slug: string }
type ProductVariant = { id: number | string; size: string; stock: number; sku?: string | null }
type NewVariantDraft = { id: string; size: string; stock: number }
type SiblingProduct = { id: number; name: string; color: string | null; image: string }

type Props = { params: Promise<{ id: string }> }

const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
const NUMBER_SIZES = ["32", "34", "36", "38", "40", "42", "44"]
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80"

function makeId() { return Math.random().toString(36).slice(2, 10) }

function detectSizeType(variants: Array<{ size: string }>) {
  if (!variants?.length) return "letter" as const
  const sizes = variants.map((v) => v.size?.trim()).filter(Boolean)
  if (!sizes.length) return "letter" as const
  if (sizes.every((s) => /^\d+$/.test(s))) return "number" as const
  const known = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
  if (sizes.every((s) => known.includes(s.toUpperCase()))) return "letter" as const
  return "custom" as const
}

function sortVariants(variants: ProductVariant[], sizeType: string): ProductVariant[] {
  const order =
    sizeType === "letter"
      ? ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
      : sizeType === "number"
      ? variants.map((v) => v.size).sort((a, b) => Number(a) - Number(b))
      : []
  return [...variants].sort((a, b) => {
    const ai = order.indexOf(a.size)
    const bi = order.indexOf(b.size)
    if (ai === -1 && bi === -1) return a.size.localeCompare(b.size, "tr", { numeric: true })
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

export default function EditProductPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [siblings, setSiblings] = useState<SiblingProduct[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [sizeType, setSizeType] = useState<"letter" | "number" | "custom">("letter")

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
    async function load() {
      try {
        const [productRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/admin/categories/list"),
        ])
        const product = await productRes.json()
        const cats = await catRes.json()
        if (!productRes.ok) throw new Error(product.error || "Ürün getirilemedi")

        setCategories(cats)
        setSiblings(Array.isArray(product.siblingProducts) ? product.siblingProducts : [])
        const pvs = Array.isArray(product.productVariants) ? product.productVariants : []
        const st = detectSizeType(pvs)
        setSizeType(st)
        setVariants(sortVariants(pvs, st))
        setForm({
          productCode: product.productCode ?? "",
          name: product.name ?? "",
          slug: product.slug ?? "",
          color: product.color ?? "",
          groupCode: product.groupCode ?? "",
          price: String(product.price ?? ""),
          oldPrice: product.oldPrice ? String(product.oldPrice) : "",
          image: product.image ?? "",
          category: product.category ?? "",
          description: product.description ?? "",
          featured: Boolean(product.featured),
          isNew: Boolean(product.isNew),
          isActive: Boolean(product.isActive),
          displayOrder: String(product.displayOrder ?? 0),
        })
      } catch (err) {
        console.error(err)
        alert("Ürün yüklenirken hata oluştu")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
      return
    }
    if (name === "productCode") {
      setForm((prev) => ({ ...prev, productCode: value.replace(/\D/g, "") }))
      return
    }
    if (name === "name") {
      setForm((prev) => ({ ...prev, name: value, slug: slugify(value) }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function addVariant(size: string) {
    setVariants((prev) => {
      if (prev.some((v) => v.size === size)) return prev
      return sortVariants([...prev, { id: `temp-${makeId()}`, size, stock: 0, sku: null }], sizeType)
    })
  }

  function addCustomVariant() {
    setVariants((prev) => [...prev, { id: `temp-${makeId()}`, size: "", stock: 0, sku: null }])
  }

  function removeVariant(vid: number | string) {
    setVariants((prev) => prev.filter((v) => v.id !== vid))
  }

  function updateVariant(vid: number | string, field: "size" | "stock", value: string | number) {
    setVariants((prev) => {
      const updated = prev.map((v) =>
        v.id === vid ? { ...v, [field]: field === "stock" ? Number(value) : value } : v
      )
      const hasEmpty = updated.some((v) => !v.size?.trim())
      return hasEmpty ? updated : sortVariants(updated, sizeType)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ürün güncellenemedi")

      const varRes = await fetch(`/api/admin/products/${id}/variants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variants: variants
            .filter((v) => String(v.size || "").trim())
            .map((v) => ({
              id: typeof v.id === "number" ? v.id : undefined,
              size: String(v.size).trim(),
              stock: Number(v.stock ?? 0),
              sku: v.sku || null,
            })),
        }),
      })
      const varData = await varRes.json()
      if (!varRes.ok) throw new Error(varData.error || "Varyantlar güncellenemedi")

      router.push("/bksy0net1mp4neli/products")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  const availableSizes = sizeType === "letter" ? LETTER_SIZES : sizeType === "number" ? NUMBER_SIZES : []

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünü Düzenle</h1>
          <p className="text-sm text-gray-500 mt-0.5">{form.name || "—"}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/bksy0net1mp4neli/products/${id}/images`}
            className="text-sm border border-gray-300 px-3 py-2 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
          >
            Görseller
          </Link>
          <Link
            href="/bksy0net1mp4neli/products"
            className="text-sm border border-gray-300 px-3 py-2 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition"
          >
            Geri
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Temel bilgiler */}
        <div className="bg-white rounded-2xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Temel Bilgiler</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Kodu</label>
              <input name="productCode" value={form.productCode} onChange={handleChange}
                inputMode="numeric" placeholder="12345678"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400">
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
              <input name="color" value={form.color} onChange={handleChange} required placeholder="Krem"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Code</label>
              <input name="groupCode" value={form.groupCode} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
              <input name="price" value={form.price} onChange={handleChange} type="number" required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eski Fiyat (₺)</label>
              <input name="oldPrice" value={form.oldPrice} onChange={handleChange} type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vitrin Sırası</label>
              <input name="displayOrder" value={form.displayOrder} onChange={handleChange} type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 min-h-25 resize-none" />
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            {[
              { name: "featured", label: "Öne Çıkan" },
              { name: "isNew", label: "Yeni" },
              { name: "isActive", label: "Aktif" },
            ].map(({ name, label }) => (
              <label key={name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={name}
                  checked={form[name as keyof typeof form] as boolean}
                  onChange={handleChange}
                  className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Kapak Görseli */}
        <div className="bg-white rounded-2xl border p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Kapak Görseli</h2>
          <div className="flex flex-wrap gap-2">
            <CloudinaryUploadButton
              buttonText="Görsel Yükle"
              onUploadSuccess={(url) => setForm((prev) => ({ ...prev, image: url }))}
            />
            {form.image && (
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                className="text-sm border border-red-200 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition">
                Kaldır
              </button>
            )}
          </div>
          {form.image ? (
            <div className="relative w-full h-48 rounded-xl overflow-hidden border bg-gray-50">
              <Image src={form.image} alt="Kapak" fill className="object-cover" sizes="600px" />
            </div>
          ) : (
            <div className="border border-dashed rounded-xl p-6 text-sm text-gray-400 text-center">
              Henüz kapak görseli yok
            </div>
          )}
        </div>

        {/* Bedenler & Stok */}
        <div className="bg-white rounded-2xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Bedenler & Stok</h2>

          <div className="flex gap-2">
            {(["letter", "number", "custom"] as const).map((type) => (
              <button key={type} type="button"
                onClick={() => { setSizeType(type); setVariants([]) }}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  sizeType === type ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 hover:border-gray-400"
                }`}>
                {type === "letter" ? "Harf" : type === "number" ? "Numara" : "Özel"}
              </button>
            ))}
          </div>

          {sizeType !== "custom" ? (
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const exists = variants.some((v) => v.size === size)
                return (
                  <button key={size} type="button" onClick={() => addVariant(size)}
                    className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                      exists ? "bg-black text-white border-black" : "border-gray-200 hover:border-gray-900"
                    }`}>
                    {size}
                  </button>
                )
              })}
            </div>
          ) : (
            <button type="button" onClick={addCustomVariant}
              className="border border-gray-200 px-4 py-2 rounded-xl text-sm hover:border-gray-900 transition">
              + Özel Beden Ekle
            </button>
          )}

          {variants.length === 0 ? (
            <div className="border border-dashed rounded-xl p-4 text-sm text-gray-400 text-center">
              Henüz beden eklenmedi
            </div>
          ) : (
            <div className="space-y-2">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 bg-gray-50">
                  {sizeType === "custom" ? (
                    <input value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)}
                      placeholder="Beden" className="border border-gray-200 rounded-lg px-3 py-1.5 w-24 text-sm focus:outline-none" />
                  ) : (
                    <span className="font-semibold text-gray-900 w-12 text-sm">{v.size}</span>
                  )}
                  <div className="flex items-center gap-1.5 flex-1">
                    <button type="button" onClick={() => updateVariant(v.id, "stock", Math.max(0, Number(v.stock) - 1))}
                      className="w-7 h-7 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition">−</button>
                    <input type="number" min={0} value={v.stock}
                      onChange={(e) => updateVariant(v.id, "stock", e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 w-16 text-center text-sm focus:outline-none" />
                    <button type="button" onClick={() => updateVariant(v.id, "stock", Number(v.stock) + 1)}
                      className="w-7 h-7 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition">+</button>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    Number(v.stock) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {Number(v.stock) > 0 ? "Stokta" : "Tükendi"}
                  </span>
                  <button type="button" onClick={() => removeVariant(v.id)}
                    className="text-red-400 hover:text-red-600 text-sm px-1 transition">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aynı gruptaki renkler */}
        {siblings.length > 0 && (
          <div className="bg-white rounded-2xl border p-5 space-y-3">
            <h2 className="font-semibold text-gray-800">Aynı Gruptaki Renkler</h2>
            <div className="flex flex-wrap gap-3">
              {siblings.map((s) => (
                <div key={s.id} className="flex items-center gap-2 border border-gray-100 rounded-xl px-3 py-2 bg-gray-50">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    <Image src={s.image || FALLBACK_IMAGE} alt={s.color || s.name} fill className="object-cover" sizes="36px" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.color || "—"}</p>
                    <p className="text-xs text-gray-400 truncate max-w-25">{s.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kaydet */}
        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving}
            className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 transition">
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
          <Link href="/bksy0net1mp4neli/products"
            className="px-5 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition text-center">
            İptal
          </Link>
        </div>
      </form>
    </div>
  )
}
