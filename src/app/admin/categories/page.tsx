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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const [newRowOpen, setNewRowOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    image: "",
    isFeatured: false,
    isActive: true,
    displayOrder: "0",
  })

  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    image: "",
    isFeatured: false,
    isActive: true,
    displayOrder: "0",
  })

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories/list")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategoriler alınamadı")
      }

      setCategories(data)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategoriler alınamadı")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      isFeatured: category.isFeatured,
      isActive: category.isActive,
      displayOrder: String(category.displayOrder),
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setEditForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleNewChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setNewCategory((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setNewCategory((prev) => ({ ...prev, [name]: value }))
  }

  async function saveEdit(id: number) {
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategori güncellenemedi")
      }

      setEditingId(null)
      await fetchCategories()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategori güncellenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function createCategory() {
    setSaving(true)

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategori eklenemedi")
      }

      setNewCategory({
        name: "",
        slug: "",
        image: "",
        isFeatured: false,
        isActive: true,
        displayOrder: "0",
      })
      setNewRowOpen(false)
      await fetchCategories()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategori eklenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function deleteCategory(id: number) {
    const confirmed = window.confirm("Bu kategoriyi silmek istediğine emin misin?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategori silinemedi")
      }

      await fetchCategories()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategori silinemedi")
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin - Kategoriler</h1>
            <p className="text-gray-600 mt-1">
              Kategorileri buradan yönetebilirsin
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNewRowOpen((prev) => !prev)}
            className="bg-black text-white px-5 py-3 rounded hover:opacity-90"
          >
            Yeni Kategori Ekle
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-4">ID</th>
                <th className="p-4">Ad</th>
                <th className="p-4">Slug</th>
                <th className="p-4 min-w-[320px]">Görsel</th>
                <th className="p-4">Vitrin</th>
                <th className="p-4">Aktif</th>
                <th className="p-4">Sıra</th>
                <th className="p-4">İşlemler</th>
              </tr>
            </thead>

            <tbody>
              {newRowOpen && (
                <tr className="border-b bg-gray-50 align-top">
                  <td className="p-4">Yeni</td>

                  <td className="p-4">
                    <input
                      name="name"
                      value={newCategory.name}
                      onChange={handleNewChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      name="slug"
                      value={newCategory.slug}
                      onChange={handleNewChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </td>

                  <td className="p-4">
                    <div className="space-y-3">
                      <CloudinaryUploadButton
                        buttonText="Görsel Seç"
                        onUploadSuccess={(url) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            image: url,
                          }))
                        }
                      />

                      {newCategory.image ? (
                        <div className="space-y-2">
                          <img
                            src={newCategory.image}
                            alt="Yeni kategori görseli"
                            className="w-32 h-20 rounded border object-cover bg-white"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setNewCategory((prev) => ({
                                ...prev,
                                image: "",
                              }))
                            }
                            className="text-sm text-red-600 hover:underline"
                          >
                            Görseli kaldır
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Henüz görsel seçilmedi
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={newCategory.isFeatured}
                      onChange={handleNewChange}
                    />
                  </td>

                  <td className="p-4">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={newCategory.isActive}
                      onChange={handleNewChange}
                    />
                  </td>

                  <td className="p-4">
                    <input
                      type="number"
                      name="displayOrder"
                      value={newCategory.displayOrder}
                      onChange={handleNewChange}
                      className="w-24 border rounded px-3 py-2"
                    />
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={createCategory}
                        disabled={saving}
                        className="border border-black px-3 py-2 rounded hover:bg-black hover:text-white"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewRowOpen(false)}
                        className="border px-3 py-2 rounded"
                      >
                        İptal
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Henüz kategori yok
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const isEditing = editingId === category.id

                  return (
                    <tr key={category.id} className="border-b last:border-b-0 align-top">
                      <td className="p-4">{category.id}</td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        ) : (
                          category.name
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            name="slug"
                            value={editForm.slug}
                            onChange={handleEditChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        ) : (
                          category.slug
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <div className="space-y-3">
                            <CloudinaryUploadButton
                              buttonText="Görsel Seç"
                              onUploadSuccess={(url) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  image: url,
                                }))
                              }
                            />

                            {editForm.image ? (
                              <div className="space-y-2">
                                <img
                                  src={editForm.image}
                                  alt="Kategori görsel önizleme"
                                  className="w-32 h-20 rounded border object-cover bg-white"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      image: "",
                                    }))
                                  }
                                  className="text-sm text-red-600 hover:underline"
                                >
                                  Görseli kaldır
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">
                                Henüz görsel seçilmedi
                              </div>
                            )}
                          </div>
                        ) : category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-24 h-16 rounded border object-cover bg-white"
                          />
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            name="isFeatured"
                            checked={editForm.isFeatured}
                            onChange={handleEditChange}
                          />
                        ) : category.isFeatured ? (
                          "Evet"
                        ) : (
                          "Hayır"
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={editForm.isActive}
                            onChange={handleEditChange}
                          />
                        ) : category.isActive ? (
                          "Evet"
                        ) : (
                          "Hayır"
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            name="displayOrder"
                            value={editForm.displayOrder}
                            onChange={handleEditChange}
                            className="w-24 border rounded px-3 py-2"
                          />
                        ) : (
                          category.displayOrder
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(category.id)}
                                disabled={saving}
                                className="border border-black px-3 py-2 rounded hover:bg-black hover:text-white"
                              >
                                Kaydet
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="border px-3 py-2 rounded"
                              >
                                İptal
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(category)}
                                className="border border-black px-3 py-2 rounded hover:bg-black hover:text-white"
                              >
                                Düzenle
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteCategory(category.id)}
                                className="border border-red-500 text-red-500 px-3 py-2 rounded hover:bg-red-500 hover:text-white"
                              >
                                Sil
                              </button>
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
      </div>
    </main>
  )
}