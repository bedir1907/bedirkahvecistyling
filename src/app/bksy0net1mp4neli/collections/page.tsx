"use client"

import { useEffect, useState } from "react"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type Product = {
  id: number
  name: string
  image: string
  price: number
  category: string
}

type Collection = {
  id: number
  name: string
  slug: string
  eyebrow: string | null
  description: string | null
  image: string | null
  buttonText: string | null
  buttonLink: string | null
  discount: number | null
  isActive: boolean
  showOnHome: boolean
  displayOrder: number
  products: { product: Product }[]
}

type FormState = {
  name: string
  slug: string
  eyebrow: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  discount: string
  isActive: boolean
  showOnHome: boolean
  displayOrder: string
  productIds: number[]
}

const emptyForm: FormState = {
  name: "", slug: "", eyebrow: "", description: "", image: "",
  buttonText: "", buttonLink: "",
  discount: "", isActive: true, showOnHome: false,
  displayOrder: "0", productIds: [],
}

function nameToSlug(name: string) {
  return name.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

function ProductPicker({ allProducts, selected, onChange }: {
  allProducts: Product[]
  selected: number[]
  onChange: (ids: number[]) => void
}) {
  const [search, setSearch] = useState("")
  const filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-3 border-b bg-gray-50">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Ürün ara..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        />
        <p className="text-xs text-gray-400 mt-1.5">{selected.length} ürün seçili</p>
      </div>
      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Ürün bulunamadı</p>
        ) : filtered.map(p => {
          const isSelected = selected.includes(p.id)
          return (
            <label key={p.id} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition ${isSelected ? "bg-gray-50" : "hover:bg-gray-50"}`}>
              <input type="checkbox" checked={isSelected} onChange={() => toggle(p.id)} className="w-4 h-4 shrink-0" />
              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category} · {p.price.toLocaleString("tr-TR")} ₺</p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

function CollectionForm({ form, setForm, allProducts, saving, onSave, onCancel }: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  allProducts: Product[]
  saving: boolean
  onSave: () => void
  onCancel: () => void
}) {
  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
  const labelCls = "text-xs font-medium text-gray-600 block mb-1"

  return (
    <div className="space-y-5">

      {/* Temel bilgiler */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Temel Bilgiler</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Ad *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: nameToSlug(e.target.value) }))} className={inputCls} placeholder="Yaz Koleksiyonu" />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} className={inputCls} placeholder="yaz-koleksiyonu" />
          </div>
          <div>
            <label className={labelCls}>Sepet İndirimi (%)</label>
            <input type="number" min="0" max="100" step="0.1" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} className={inputCls} placeholder="10  (boş = indirim yok)" />
          </div>
          <div>
            <label className={labelCls}>Sıra</label>
            <input type="number" value={form.displayOrder} onChange={e => setForm(p => ({ ...p, displayOrder: e.target.value }))} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Sayfa içeriği */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sayfa İçeriği</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Üst Yazı (eyebrow)</label>
            <input value={form.eyebrow} onChange={e => setForm(p => ({ ...p, eyebrow: e.target.value }))} className={inputCls} placeholder="Yeni Sezon · 2025" />
          </div>
          <div className="sm:col-span-1" />
          <div className="sm:col-span-2">
            <label className={labelCls}>Açıklama</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className={inputCls + " resize-none"} placeholder="Koleksiyon hakkında kısa bir açıklama..." />
          </div>
        </div>
      </div>

      {/* Buton */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Buton</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Buton Yazısı</label>
            <input value={form.buttonText} onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))} className={inputCls} placeholder="Koleksiyonu Keşfet" />
          </div>
          <div>
            <label className={labelCls}>Buton Linki (boş = koleksiyon sayfası)</label>
            <input value={form.buttonLink} onChange={e => setForm(p => ({ ...p, buttonLink: e.target.value }))} className={inputCls} placeholder="/collections/yaz-koleksiyonu" />
          </div>
        </div>
      </div>

      {/* Görsel */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kapak Görseli</p>
        <CloudinaryUploadButton buttonText="Görsel Seç" onUploadSuccess={url => setForm(p => ({ ...p, image: url }))} />
        {form.image && (
          <div className="mt-2 flex items-center gap-3">
            <img src={form.image} alt="" className="w-32 h-20 rounded-xl object-cover border" />
            <button type="button" onClick={() => setForm(p => ({ ...p, image: "" }))} className="text-xs text-red-500 hover:underline">Kaldır</button>
          </div>
        )}
      </div>

      {/* Ürünler */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ürünler</p>
        <ProductPicker allProducts={allProducts} selected={form.productIds} onChange={ids => setForm(p => ({ ...p, productIds: ids }))} />
      </div>

      {/* Toggle'lar */}
      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.showOnHome} onChange={e => setForm(p => ({ ...p, showOnHome: e.target.checked }))} className="w-4 h-4" />
          Ana sayfada göster
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" />
          Aktif
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onSave} disabled={saving} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-200 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
          İptal
        </button>
      </div>
    </div>
  )
}

function toPayload(form: FormState) {
  return {
    ...form,
    eyebrow: form.eyebrow || null,
    description: form.description || null,
    buttonText: form.buttonText || null,
    buttonLink: form.buttonLink || null,
    discount: form.discount !== "" ? Number(form.discount) : null,
    displayOrder: Number(form.displayOrder),
  }
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [newForm, setNewForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm)

  async function fetchAll() {
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch("/api/admin/collections"),
        fetch("/api/admin/products/list"),
      ])
      const [colData, prodData] = await Promise.all([colRes.json(), prodRes.json()])
      if (!colRes.ok) throw new Error(colData.error || "Koleksiyonlar alınamadı")
      if (!prodRes.ok) throw new Error(prodData.error || "Ürünler alınamadı")
      setCollections(colData)
      setAllProducts(prodData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri alınamadı")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  function startEdit(col: Collection) {
    setEditingId(col.id)
    setEditForm({
      name: col.name, slug: col.slug,
      eyebrow: col.eyebrow || "",
      description: col.description || "",
      image: col.image || "",
      buttonText: col.buttonText || "",
      buttonLink: col.buttonLink || "",
      discount: col.discount != null ? String(col.discount) : "",
      isActive: col.isActive, showOnHome: col.showOnHome,
      displayOrder: String(col.displayOrder),
      productIds: col.products.map(cp => cp.product.id),
    })
  }

  async function createCollection() {
    if (!newForm.name.trim() || !newForm.slug.trim()) { setError("Ad ve slug zorunlu"); return }
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(newForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Eklenemedi")
      setNewForm(emptyForm); setNewOpen(false)
      await fetchAll()
    } catch (err) { setError(err instanceof Error ? err.message : "Eklenemedi") }
    finally { setSaving(false) }
  }

  async function saveEdit(id: number) {
    if (!editForm.name.trim() || !editForm.slug.trim()) { setError("Ad ve slug zorunlu"); return }
    setSaving(true); setError("")
    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(editForm)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Güncellenemedi")
      setEditingId(null)
      await fetchAll()
    } catch (err) { setError(err instanceof Error ? err.message : "Güncellenemedi") }
    finally { setSaving(false) }
  }

  async function deleteCollection(id: number) {
    if (!window.confirm("Bu koleksiyonu silmek istediğine emin misin?")) return
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Silinemedi")
      await fetchAll()
    } catch (err) { setError(err instanceof Error ? err.message : "Silinemedi") }
  }

  return (
    <main>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Koleksiyonlar</h1>
          <p className="text-gray-500 mt-1 text-sm">Özel koleksiyonlar oluştur, ürün ekle ve sepet indirimi belirle.</p>
        </div>
        <button type="button" onClick={() => setNewOpen(p => !p)} className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shrink-0">
          + Yeni Koleksiyon
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      {newOpen && (
        <div className="bg-white rounded-2xl border p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Yeni Koleksiyon</h2>
          <CollectionForm form={newForm} setForm={setNewForm} allProducts={allProducts} saving={saving}
            onSave={createCollection} onCancel={() => { setNewOpen(false); setNewForm(emptyForm) }} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse h-24" />)}</div>
      ) : collections.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center text-gray-500">
          <p className="text-lg font-medium">Henüz koleksiyon yok</p>
          <p className="text-sm mt-1">Yukarıdan yeni bir koleksiyon oluştur.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collections.map(col => {
            const isEditing = editingId === col.id
            return (
              <div key={col.id} className="bg-white rounded-2xl border overflow-hidden">
                {isEditing ? (
                  <div className="p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Koleksiyonu Düzenle</h2>
                    <CollectionForm form={editForm} setForm={setEditForm} allProducts={allProducts} saving={saving}
                      onSave={() => saveEdit(col.id)} onCancel={() => setEditingId(null)} />
                  </div>
                ) : (
                  <div className="p-4 flex items-center gap-4">
                    {col.image
                      ? <img src={col.image} alt={col.name} className="w-20 h-14 rounded-xl object-cover border shrink-0" />
                      : <div className="w-20 h-14 rounded-xl bg-gray-100 border shrink-0 flex items-center justify-center text-gray-300 text-[10px]">Görsel yok</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{col.name}</p>
                        {col.eyebrow && <span className="text-[11px] text-gray-400 italic">{col.eyebrow}</span>}
                        {col.discount != null && (
                          <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">%{col.discount} indirim</span>
                        )}
                        {col.buttonText && (
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Buton: {col.buttonText}</span>
                        )}
                        {col.showOnHome && (
                          <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ana sayfa</span>
                        )}
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${col.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {col.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{col.slug}</p>
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        {col.products.slice(0, 5).map(cp => (
                          <img key={cp.product.id} src={cp.product.image} alt={cp.product.name} title={cp.product.name} className="w-7 h-7 rounded-md object-cover border" />
                        ))}
                        {col.products.length > 5 && <span className="text-xs text-gray-400 font-medium">+{col.products.length - 5}</span>}
                        <span className="text-xs text-gray-400 ml-1">{col.products.length} ürün</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => startEdit(col)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">Düzenle</button>
                      <button type="button" onClick={() => deleteCollection(col.id)} className="text-sm border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition">Sil</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
