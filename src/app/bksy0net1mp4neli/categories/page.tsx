"use client"

import { useEffect, useState } from "react"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type Category = {
  id: number
  name: string
  slug: string
  image: string | null
  isFeatured: boolean
  isActive: boolean
  displayOrder: number
}

const emptyForm = { name: "", slug: "", image: "", isFeatured: false, isActive: true, displayOrder: "0" }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [newRowOpen, setNewRowOpen] = useState(false)
  const [newCategory, setNewCategory] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories/list")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kategoriler alınamadı")
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kategoriler alınamadı")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditForm({ name: category.name, slug: category.slug, image: category.image || "", isFeatured: category.isFeatured, isActive: category.isActive, displayOrder: String(category.displayOrder) })
  }

  function handleChange(setter: React.Dispatch<React.SetStateAction<typeof emptyForm>>) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target
      setter(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }
  }

  // Addan slug üret
  function nameToSlug(name: string) {
    return name.toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
  }

  async function saveEdit(id: number) {
    setSaving(true); setError("")
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Güncellenemedi")
      setEditingId(null)
      await fetchCategories()
    } catch (err) { setError(err instanceof Error ? err.message : "Güncellenemedi") }
    finally { setSaving(false) }
  }

  async function createCategory() {
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCategory) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Eklenemedi")
      setNewCategory(emptyForm); setNewRowOpen(false)
      await fetchCategories()
    } catch (err) { setError(err instanceof Error ? err.message : "Eklenemedi") }
    finally { setSaving(false) }
  }

  async function deleteCategory(id: number) {
    if (!window.confirm("Bu kategoriyi silmek istediğine emin misin?")) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Silinemedi")
      await fetchCategories()
    } catch (err) { setError(err instanceof Error ? err.message : "Silinemedi") }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"

  return (
    <main>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-gray-500 mt-1 text-sm">Kategorileri yönet.</p>
        </div>
        <button type="button" onClick={() => setNewRowOpen(p => !p)} className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition shrink-0">
          + Yeni Kategori
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      {/* Yeni kategori formu */}
      {newRowOpen && (
        <div className="bg-white rounded-2xl border p-5 mb-4 space-y-4">
          <h2 className="font-semibold text-gray-900">Yeni Kategori</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Ad</label>
              <input name="name" value={newCategory.name} onChange={(e) => { setNewCategory(p => ({ ...p, name: e.target.value, slug: nameToSlug(e.target.value) })) }} className={inputCls} placeholder="Kategori adı" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Slug</label>
              <input name="slug" value={newCategory.slug} onChange={handleChange(setNewCategory)} className={inputCls} placeholder="kategori-slug" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Sıra</label>
              <input type="number" name="displayOrder" value={newCategory.displayOrder} onChange={handleChange(setNewCategory)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Görsel</label>
            <CloudinaryUploadButton buttonText="Görsel Seç" onUploadSuccess={(url) => setNewCategory(p => ({ ...p, image: url }))} />
            {newCategory.image && (
              <div className="mt-2 flex items-center gap-3">
                <img src={newCategory.image} alt="" className="w-20 h-14 rounded-lg object-cover border" />
                <button type="button" onClick={() => setNewCategory(p => ({ ...p, image: "" }))} className="text-xs text-red-500 hover:underline">Kaldır</button>
              </div>
            )}
          </div>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={newCategory.isFeatured} onChange={handleChange(setNewCategory)} className="w-4 h-4" />
              Vitrinde göster
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="isActive" checked={newCategory.isActive} onChange={handleChange(setNewCategory)} className="w-4 h-4" />
              Aktif
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={createCategory} disabled={saving} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button type="button" onClick={() => { setNewRowOpen(false); setNewCategory(emptyForm) }} className="border border-gray-200 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Mobil: kart görünümü */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse h-24" />)
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">Henüz kategori yok.</div>
        ) : (
          categories.map((cat) => {
            const isEditing = editingId === cat.id
            return (
              <div key={cat.id} className="bg-white rounded-2xl border p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Ad</label>
                        <input name="name" value={editForm.name} onChange={handleChange(setEditForm)} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">Slug</label>
                        <input name="slug" value={editForm.slug} onChange={handleChange(setEditForm)} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">Görsel</label>
                      <CloudinaryUploadButton buttonText="Görsel Seç" onUploadSuccess={(url) => setEditForm(p => ({ ...p, image: url }))} />
                      {editForm.image && (
                        <div className="mt-2 flex items-center gap-3">
                          <img src={editForm.image} alt="" className="w-20 h-14 rounded-lg object-cover border" />
                          <button type="button" onClick={() => setEditForm(p => ({ ...p, image: "" }))} className="text-xs text-red-500 hover:underline">Kaldır</button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" name="isFeatured" checked={editForm.isFeatured} onChange={handleChange(setEditForm)} />
                        Vitrin
                      </label>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" name="isActive" checked={editForm.isActive} onChange={handleChange(setEditForm)} />
                        Aktif
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveEdit(cat.id)} disabled={saving} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
                        {saving ? "..." : "Kaydet"}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="border px-4 py-2 rounded-xl text-sm">İptal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-16 h-12 rounded-lg object-cover border shrink-0" />
                    ) : (
                      <div className="w-16 h-12 rounded-lg bg-gray-100 border shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">{cat.slug}</p>
                      <div className="flex gap-2 mt-1">
                        {cat.isFeatured && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Vitrin</span>}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {cat.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button type="button" onClick={() => startEdit(cat)} className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">
                        Düzenle
                      </button>
                      <button type="button" onClick={() => deleteCategory(cat.id)} className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition">
                        Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Desktop: tablo */}
      <div className="hidden lg:block bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3.5 font-medium">ID</th>
              <th className="px-5 py-3.5 font-medium">Ad</th>
              <th className="px-5 py-3.5 font-medium">Slug</th>
              <th className="px-5 py-3.5 font-medium">Görsel</th>
              <th className="px-5 py-3.5 font-medium">Vitrin</th>
              <th className="px-5 py-3.5 font-medium">Aktif</th>
              <th className="px-5 py-3.5 font-medium">Sıra</th>
              <th className="px-5 py-3.5 font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-500">Henüz kategori yok.</td></tr>
            ) : (
              categories.map((cat) => {
                const isEditing = editingId === cat.id
                return (
                  <tr key={cat.id} className="border-b last:border-0 align-top hover:bg-gray-50 transition">
                    <td className="px-5 py-4 text-sm text-gray-500">{cat.id}</td>
                    <td className="px-5 py-4 text-sm font-medium">
                      {isEditing ? <input name="name" value={editForm.name} onChange={handleChange(setEditForm)} className={inputCls} /> : cat.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {isEditing ? <input name="slug" value={editForm.slug} onChange={handleChange(setEditForm)} className={inputCls} /> : cat.slug}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <CloudinaryUploadButton buttonText="Görsel Seç" onUploadSuccess={(url) => setEditForm(p => ({ ...p, image: url }))} />
                          {editForm.image && <img src={editForm.image} alt="" className="w-24 h-16 rounded-lg object-cover border mt-2" />}
                        </div>
                      ) : cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-24 h-16 rounded-lg object-cover border" />
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input type="checkbox" name="isFeatured" checked={editForm.isFeatured} onChange={handleChange(setEditForm)} className="w-4 h-4" />
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isFeatured ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                          {cat.isFeatured ? "Evet" : "Hayır"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input type="checkbox" name="isActive" checked={editForm.isActive} onChange={handleChange(setEditForm)} className="w-4 h-4" />
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {cat.isActive ? "Evet" : "Hayır"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input type="number" name="displayOrder" value={editForm.displayOrder} onChange={handleChange(setEditForm)} className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
                      ) : cat.displayOrder}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button type="button" onClick={() => saveEdit(cat.id)} disabled={saving} className="text-sm border border-gray-900 bg-gray-900 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 hover:opacity-80 transition">
                              {saving ? "..." : "Kaydet"}
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">İptal</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => startEdit(cat)} className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition">Düzenle</button>
                            <button type="button" onClick={() => deleteCategory(cat.id)} className="text-sm border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition">Sil</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}