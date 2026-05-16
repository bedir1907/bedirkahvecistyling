"use client"

import Image from "next/image"
import React, { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"
import Link from "next/link"

type ProductVariant = {
  id: number | string
  size: string
  stock: number
  sku?: string | null
}

type NewVariantDraft = {
  id: string
  size: string
  stock: number
}

type ProductImage = {
  id: number
  url: string
  alt?: string | null
  color?: string | null
  sortOrder: number
  isCover: boolean
}

type SiblingProduct = {
  id: number
  name: string
  slug: string
  color: string | null
  image: string
}

type Product = {
  id: number
  productCode: string
  name: string
  slug: string
  color: string | null
  groupCode: string | null
  price: number
  oldPrice: number | null
  image: string
  category: string
  description: string
  stock: number
  featured: boolean
  isNew: boolean
  isActive: boolean
  displayOrder: number
}

type Category = {
  id: number
  name: string
  slug: string
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
const NUMBER_SIZES = ["32", "34", "36", "38", "40", "42", "44"]

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function sortSizes(sizeType: string, sizes: string[]) {
  const cleaned = sizes.map((item) => item.trim()).filter(Boolean)

  if (sizeType === "letter") {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]

    return [...cleaned].sort((a, b) => {
      const aIndex = order.indexOf(a)
      const bIndex = order.indexOf(b)

      if (aIndex === -1 && bIndex === -1) {
        return a.localeCompare(b, "tr", { sensitivity: "base" })
      }
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1

      return aIndex - bIndex
    })
  }

  if (sizeType === "number") {
    return [...cleaned].sort((a, b) => Number(a) - Number(b))
  }

  return [...cleaned].sort((a, b) =>
    a.localeCompare(b, "tr", {
      numeric: true,
      sensitivity: "base",
    })
  )
}

function sortVariants(variants: ProductVariant[], sizeType: string) {
  const order = sortSizes(
    sizeType,
    variants.map((item) => item.size)
  )

  return [...variants].sort(
    (a, b) => order.indexOf(a.size) - order.indexOf(b.size)
  )
}

export default function AdminProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [newRowOpen, setNewRowOpen] = useState(false)

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  const [editVariants, setEditVariants] = useState<ProductVariant[]>([])
  const [newVariants, setNewVariants] = useState<NewVariantDraft[]>([])

  const [editSizeType, setEditSizeType] = useState<"letter" | "number" | "custom">("letter")
  const [newSizeType, setNewSizeType] = useState<"letter" | "number" | "custom">("letter")

  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [siblingProducts, setSiblingProducts] = useState<SiblingProduct[]>([])

  const [editForm, setEditForm] = useState({
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

  const [newProduct, setNewProduct] = useState({
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

  async function fetchData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products/list"),
        fetch("/api/admin/categories/list"),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      if (!productsRes.ok) {
        throw new Error(productsData.error || "Ürünler alınamadı")
      }

      if (!categoriesRes.ok) {
        throw new Error(categoriesData.error || "Kategoriler alınamadı")
      }

      setProducts(productsData)
      setCategories(categoriesData)

      if (categoriesData.length > 0) {
        setNewProduct((prev) => ({
          ...prev,
          category: prev.category || categoriesData[0].name,
        }))
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Veriler alınamadı")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const editId = searchParams.get("edit")
    if (!editId) return

    const id = Number(editId)
    const product = products.find((p) => p.id === id)

    if (!product) return

    startEdit(product)

    setTimeout(() => {
      const el = document.getElementById(`product-${id}`)
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }, [products, searchParams])

  async function startEdit(product: Product) {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Ürün detayı alınamadı")
      }

      setEditingId(product.id)
      setEditVariants(
        Array.isArray(data.productVariants)
          ? sortVariants(data.productVariants, detectSizeType(data.productVariants))
          : []
      )
      setEditSizeType(detectSizeType(data.productVariants || []))
      setProductImages(Array.isArray(data.images) ? data.images : [])
      setSiblingProducts(Array.isArray(data.siblingProducts) ? data.siblingProducts : [])

      setEditForm({
        productCode: data.productCode,
        name: data.name,
        slug: data.slug,
        color: data.color || "",
        groupCode: data.groupCode || "",
        price: String(data.price),
        oldPrice: data.oldPrice ? String(data.oldPrice) : "",
        image: data.image,
        category: data.category,
        description: data.description,
        featured: data.featured,
        isNew: data.isNew,
        isActive: data.isActive,
        displayOrder: String(data.displayOrder ?? 0),
      })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ürün detayı alınamadı")
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditVariants([])
    setProductImages([])
    setSiblingProducts([])
    setEditSizeType("letter")
  }

  function handleEditChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setEditForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (name === "productCode") {
      const onlyDigits = value.replace(/\D/g, "")
      setEditForm((prev) => ({ ...prev, [name]: onlyDigits }))
      return
    }

    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleNewChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setNewProduct((prev) => ({ ...prev, [name]: checked }))
      return
    }

    if (name === "productCode") {
      const onlyDigits = value.replace(/\D/g, "")
      setNewProduct((prev) => ({ ...prev, [name]: onlyDigits }))
      return
    }

    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  function detectSizeType(variants: Array<{ size: string }>) {
    if (!variants || variants.length === 0) return "letter" as const

    const sizes = variants.map((item) => item.size?.trim()).filter(Boolean)

    if (sizes.length === 0) return "letter" as const

    const allNumbers = sizes.every((item) => /^\d+$/.test(item))
    if (allNumbers) return "number" as const

    const knownLetters = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
    const allLetters = sizes.every((item) => knownLetters.includes(item.toUpperCase()))
    if (allLetters) return "letter" as const

    return "custom" as const
  }

  function getAvailableSizes(sizeType: "letter" | "number" | "custom") {
    if (sizeType === "letter") return LETTER_SIZES
    if (sizeType === "number") return NUMBER_SIZES
    return []
  }

  function addVariantToDraft(size: string) {
    setNewVariants((prev) => {
      const exists = prev.some((variant) => variant.size === size)
      if (exists) return prev

      const next = [
        ...prev,
        {
          id: makeId(),
          size,
          stock: 0,
        },
      ]

      return sortVariants(
        next.map((item) => ({ ...item, sku: null })),
        newSizeType
      ).map((item) => ({
        id: String(item.id),
        size: item.size,
        stock: item.stock,
      }))
    })
  }

  function addCustomVariantToDraft() {
    setNewVariants((prev) => [
      ...prev,
      {
        id: makeId(),
        size: "",
        stock: 0,
      },
    ])
  }

  function removeDraftVariant(variantId: string) {
    setNewVariants((prev) => prev.filter((variant) => variant.id !== variantId))
  }

  function updateDraftVariantField(
    variantId: string,
    field: "size" | "stock",
    value: string | number
  ) {
    setNewVariants((prev) => {
      const updated = prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: field === "stock" ? Number(value) : value,
            }
          : variant
      )

      const hasEmpty = updated.some((item) => !item.size?.trim())
      if (hasEmpty) return updated

      return sortVariants(
        updated.map((item) => ({ ...item, sku: null })),
        newSizeType
      ).map((item) => ({
        id: String(item.id),
        size: item.size,
        stock: item.stock,
      }))
    })
  }

  function addVariantToExisting(size: string) {
    setEditVariants((prev) => {
      const exists = prev.some((variant) => variant.size === size)
      if (exists) return prev

      const next: ProductVariant[] = [
        ...prev,
        {
          id: `temp-${makeId()}`,
          size,
          stock: 0,
          sku: null,
        },
      ]

      return sortVariants(next, editSizeType)
    })
  }

  function addCustomVariantToExisting() {
    setEditVariants((prev) => [
      ...prev,
      {
        id: `temp-${makeId()}`,
        size: "",
        stock: 0,
        sku: null,
      },
    ])
  }

  function removeExistingVariant(variantId: number | string) {
    setEditVariants((prev) => prev.filter((variant) => variant.id !== variantId))
  }

  function updateExistingVariantField(
    variantId: number | string,
    field: "size" | "stock" | "sku",
    value: string | number
  ) {
    setEditVariants((prev) => {
      const updated = prev.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              [field]: field === "stock" ? Number(value) : value,
            }
          : variant
      )

      const hasEmpty = updated.some((item) => !item.size?.trim())
      if (hasEmpty) return updated

      return sortVariants(updated, editSizeType)
    })
  }

  async function createProduct() {
    setSaving(true)

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || "Ürün eklenemedi")
      }

      const createdProductId = data.id

      if (newVariants.length > 0) {
        const variantsRes = await fetch(`/api/admin/products/${createdProductId}/variants`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variants: newVariants
              .filter((variant) => variant.size.trim())
              .map((variant) => ({
                size: variant.size.trim(),
                stock: Number(variant.stock ?? 0),
                sku: null,
              })),
          }),
        })

        const variantsText = await variantsRes.text()
        const variantsData = variantsText ? JSON.parse(variantsText) : null

        if (!variantsRes.ok) {
          throw new Error(variantsData?.error || "Varyantlar kaydedilemedi")
        }
      }

      setNewProduct({
        productCode: "",
        name: "",
        slug: "",
        color: "",
        groupCode: "",
        price: "",
        oldPrice: "",
        image: "",
        category: categories[0]?.name || "",
        description: "",
        featured: false,
        isNew: false,
        isActive: true,
        displayOrder: "0",
      })

      setNewVariants([])
      setNewSizeType("letter")
      setNewRowOpen(false)
      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ürün eklenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(id: number) {
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || "Ürün güncellenemedi")
      }

      const variantsRes = await fetch(`/api/admin/products/${id}/variants`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variants: editVariants
            .filter((variant) => String(variant.size || "").trim())
            .map((variant) => ({
              id: typeof variant.id === "number" ? variant.id : undefined,
              size: String(variant.size).trim(),
              stock: Number(variant.stock ?? 0),
              sku: variant.sku || null,
            })),
        }),
      })

      const variantsText = await variantsRes.text()
      const variantsData = variantsText ? JSON.parse(variantsText) : null

      if (!variantsRes.ok) {
        throw new Error(variantsData?.error || "Varyantlar güncellenemedi")
      }

      setEditingId(null)
      setEditVariants([])
      setProductImages([])
      setSiblingProducts([])
      router.push("/bksy0net1mp4neli/products")
      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ürün güncellenemedi")
    } finally {
      setSaving(false)
    }
  }

  async function deleteProduct(id: number) {
    const confirmed = window.confirm("Bu ürünü silmek istediğine emin misin?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.error || "Ürün silinemedi")
      }

      await fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ürün silinemedi")
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.productCode.includes(search) ||
        String(product.color || "").toLowerCase().includes(search.toLowerCase()) ||
        String(product.groupCode || "").toLowerCase().includes(search.toLowerCase())

      const matchesCategory = categoryFilter
        ? product.category === categoryFilter
        : true

      return matchesSearch && matchesCategory
    })
  }, [products, search, categoryFilter])

  return (
    <main>
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Ürünler</h1>
            <p className="text-gray-600 mt-1">
              Ürünleri sade listede görüntüle ve aynı ekranda düzenle
            </p>
          </div>

          {/* Mobilede yeni sayfaya git */}

 <a href="/bksy0net1mp4neli/products/new"
  className="lg:hidden bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition"
>
  + Yeni Ürün
  </a>

{/* Desktopda inline form aç */}
<button
  type="button"
  onClick={() => setNewRowOpen((prev) => !prev)}
  className="hidden lg:block bg-black text-white px-5 py-3 rounded hover:opacity-90"
>
  Yeni Ürün Ekle
</button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
          <div className="grid md:grid-cols-[1fr_220px] gap-4">
            <input
              type="text"
              placeholder="Ürün adı, ürün kodu, renk veya grup kodu ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-xl px-4 py-3"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-xl px-4 py-3"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── MOBİL KART GÖRÜNÜMÜ ── */}
        <div className="lg:hidden space-y-3 mb-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse h-20" />
            ))
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
              Ürün bulunamadı.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border p-4 flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border shrink-0">
                  <Image
                    src={product.image || FALLBACK_IMAGE}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{product.category} · {product.color || "—"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-gray-900">₺{product.price}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <a
                    href={`/admin/products/${product.id}/edit`}
                    className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition text-center"
                  >
                    Düzenle
                  </a>
                  <a
                    href={`/admin/products/${product.id}/images`}
                    className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-900 hover:text-white hover:border-gray-900 transition text-center"
                  >
                    Görseller
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP TABLO GÖRÜNÜMÜ ── */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-4">Kapak</th>
                <th className="p-4">Ürün Kodu</th>
                <th className="p-4">Ad</th>
                <th className="p-4">Renk</th>
                <th className="p-4">Group Code</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Fiyat</th>
                <th className="p-4">Stok</th>
                <th className="p-4">Durum</th>
                <th className="p-4">İşlemler</th>
              </tr>
            </thead>

            <tbody>
              {newRowOpen && (
                <tr className="border-b bg-gray-50">
                  <td colSpan={10} className="p-6">
                    <div className="mb-5">
                      <h2 className="text-xl font-semibold">Yeni Ürün</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Her renk ayrı ürün olacak şekilde yeni ürün ekleyebilirsin.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                      <input
                        name="productCode"
                        value={newProduct.productCode}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Ürün kodu (12345678)"
                        inputMode="numeric"
                      />

                      <input
                        name="name"
                        value={newProduct.name}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Ürün adı"
                      />

                      <input
                        name="slug"
                        value={newProduct.slug}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Slug"
                      />

                      <input
                        name="color"
                        value={newProduct.color}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Renk (zorunlu)"
                      />

                      <input
                        name="groupCode"
                        value={newProduct.groupCode}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Group Code (zorunlu)"
                      />

                      <select
                        name="category"
                        value={newProduct.category}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        name="price"
                        value={newProduct.price}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Fiyat"
                      />

                      <input
                        type="number"
                        name="oldPrice"
                        value={newProduct.oldPrice}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Eski fiyat"
                      />

                      <input
                        type="number"
                        name="displayOrder"
                        value={newProduct.displayOrder}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3"
                        placeholder="Sıra"
                      />

                      <select
                        value={newSizeType}
                        onChange={(e) => {
                          setNewSizeType(e.target.value as "letter" | "number" | "custom")
                          setNewVariants([])
                        }}
                        className="border rounded-xl px-4 py-3"
                      >
                        <option value="letter">Harf beden</option>
                        <option value="number">Numara beden</option>
                        <option value="custom">Özel beden</option>
                      </select>

                      <input
                        name="image"
                        value={newProduct.image}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3 md:col-span-2 xl:col-span-4"
                        placeholder="Kapak görsel URL"
                      />

                      <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
                        <CloudinaryUploadButton
                          buttonText="Kapak Görseli Yükle"
                          onUploadSuccess={(url) =>
                            setNewProduct((prev) => ({ ...prev, image: url }))
                          }
                        />
                        {newProduct.image && (
                          <span className="text-sm text-green-700 self-center">Görsel yüklendi</span>
                        )}
                      </div>

                      <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleNewChange}
                        className="border rounded-xl px-4 py-3 min-h-[120px] md:col-span-2 xl:col-span-4"
                        placeholder="Açıklama"
                      />
                    </div>

                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Bedenler ve Stok</h3>
                          <p className="text-sm text-gray-500">Bu ürüne ait bedenleri ve stoklarını gir.</p>
                        </div>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {newSizeType !== "custom" ? (
                          getAvailableSizes(newSizeType).map((size) => {
                            const selected = newVariants.some((v) => v.size === size)
                            return (
                              <button key={size} type="button" onClick={() => addVariantToDraft(size)}
                                className={`px-3 py-2 rounded-xl border ${selected ? "bg-black text-white border-black" : "border-gray-300 hover:border-black"}`}>
                                {size}
                              </button>
                            )
                          })
                        ) : (
                          <button type="button" onClick={addCustomVariantToDraft}
                            className="border border-black px-4 py-2 rounded-xl hover:bg-black hover:text-white">
                            Özel Beden Ekle
                          </button>
                        )}
                      </div>

                      {newVariants.length === 0 ? (
                        <div className="border rounded-2xl bg-white p-5 text-sm text-gray-500">Henüz beden eklenmedi.</div>
                      ) : (
                        <div className="overflow-x-auto border rounded-xl bg-white">
                          <table className="w-full text-base">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-4 text-left font-semibold">Beden</th>
                                <th className="p-4 text-left font-semibold">Stok</th>
                                <th className="p-4 text-left font-semibold">Durum</th>
                                <th className="p-4 text-left font-semibold">İşlem</th>
                              </tr>
                            </thead>
                            <tbody>
                              {newVariants.map((variant) => (
                                <tr key={variant.id} className="border-t">
                                  <td className="p-4 font-medium text-[15px]">
                                    {newSizeType === "custom" ? (
                                      <input value={variant.size} onChange={(e) => updateDraftVariantField(variant.id, "size", e.target.value)} className="border rounded-lg px-3 py-2 w-32" placeholder="Beden" />
                                    ) : <span>{variant.size}</span>}
                                  </td>
                                  <td className="p-4 text-[15px]">
                                    <div className="flex items-center gap-2">
                                      <button type="button" onClick={() => updateDraftVariantField(variant.id, "stock", Math.max(0, variant.stock - 1))} className="w-8 h-8 border rounded-lg">-</button>
                                      <input type="number" min={0} value={variant.stock} onChange={(e) => updateDraftVariantField(variant.id, "stock", e.target.value)} className="border rounded-lg px-3 py-2 w-20 text-center" />
                                      <button type="button" onClick={() => updateDraftVariantField(variant.id, "stock", variant.stock + 1)} className="w-8 h-8 border rounded-lg">+</button>
                                    </div>
                                  </td>
                                  <td className="p-4 text-[15px]">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${variant.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                      {variant.stock > 0 ? "Stokta" : "Tükendi"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-[15px]">
                                    <button type="button" onClick={() => removeDraftVariant(variant.id)} className="border border-red-500 text-red-500 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white">Sil</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-6 mt-5">
                      <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={newProduct.featured} onChange={handleNewChange} /><span>Öne Çıkan</span></label>
                      <label className="flex items-center gap-2"><input type="checkbox" name="isNew" checked={newProduct.isNew} onChange={handleNewChange} /><span>Yeni</span></label>
                      <label className="flex items-center gap-2"><input type="checkbox" name="isActive" checked={newProduct.isActive} onChange={handleNewChange} /><span>Aktif</span></label>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button type="button" onClick={createProduct} disabled={saving} className="bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 disabled:opacity-50">Kaydet</button>
                      <button type="button" onClick={() => { setNewRowOpen(false); setNewVariants([]); setNewSizeType("letter") }} className="border px-5 py-3 rounded-xl">İptal</button>
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-gray-500">Ürün bulunamadı.</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const isEditing = editingId === product.id
                  return (
                    <React.Fragment key={product.id}>
                      <tr id={`product-${product.id}`} className="border-b last:border-b-0 align-middle">
                        <td className="p-4">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border">
                            <Image src={product.image || FALLBACK_IMAGE} alt={product.name} fill className="object-cover" sizes="56px" />
                          </div>
                        </td>
                        <td className="p-4 font-medium">{product.productCode}</td>
                        <td className="p-4">{product.name}</td>
                        <td className="p-4">{product.color || "—"}</td>
                        <td className="p-4">{product.groupCode || "—"}</td>
                        <td className="p-4">{product.category}</td>
                        <td className="p-4">₺{product.price}</td>
                        <td className="p-4">{product.stock}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {product.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => { if (isEditing) { cancelEdit(); router.push("/bksy0net1mp4neli/products") } else { router.push(`/admin/products?edit=${product.id}`) } }}
                              className="border border-black px-3 py-2 rounded-xl hover:bg-black hover:text-white">
                              {isEditing ? "Kapat" : "Düzenle"}
                            </button>
                            <button type="button" onClick={() => { window.location.href = `/admin/products/${product.id}/images` }}
                              className="border border-black px-3 py-2 rounded-xl hover:bg-black hover:text-white">
                              Görseller
                            </button>
                            <button type="button" onClick={() => deleteProduct(product.id)}
                              className="border border-red-500 text-red-500 px-3 py-2 rounded-xl hover:bg-red-500 hover:text-white">
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isEditing && (
                        <tr className="bg-gray-50 border-b">
                          <td colSpan={10} className="p-6">
                            <div className="mb-5">
                              <h3 className="text-xl font-semibold">Ürünü Düzenle</h3>
                              <p className="text-sm text-gray-500 mt-1">{product.name} ürününe ait detayları buradan güncelleyebilirsin.</p>
                            </div>

                            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                              <input name="productCode" value={editForm.productCode} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Ürün kodu" inputMode="numeric" />
                              <input name="name" value={editForm.name} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Ürün adı" />
                              <input name="slug" value={editForm.slug} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Slug" />
                              <input name="color" value={editForm.color} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Renk" />
                              <input name="groupCode" value={editForm.groupCode} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Group Code" />
                              <select name="category" value={editForm.category} onChange={handleEditChange} className="border rounded-xl px-4 py-3">
                                {categories.map((category) => (
                                  <option key={category.id} value={category.name}>{category.name}</option>
                                ))}
                              </select>
                              <input type="number" name="price" value={editForm.price} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Fiyat" />
                              <input type="number" name="oldPrice" value={editForm.oldPrice} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Eski fiyat" />
                              <input type="number" name="displayOrder" value={editForm.displayOrder} onChange={handleEditChange} className="border rounded-xl px-4 py-3" placeholder="Sıra" />
                              <select value={editSizeType} onChange={(e) => { setEditSizeType(e.target.value as "letter" | "number" | "custom"); setEditVariants([]) }} className="border rounded-xl px-4 py-3">
                                <option value="letter">Harf beden</option>
                                <option value="number">Numara beden</option>
                                <option value="custom">Özel beden</option>
                              </select>
                              <input name="image" value={editForm.image} onChange={handleEditChange} className="border rounded-xl px-4 py-3 md:col-span-2 xl:col-span-4" placeholder="Kapak görsel URL" />
                              <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-3">
                                <CloudinaryUploadButton buttonText="Yeni Kapak Görseli Yükle" onUploadSuccess={(url) => setEditForm((prev) => ({ ...prev, image: url }))} />
                                {editForm.image && <span className="text-sm text-green-700 self-center">Görsel hazır</span>}
                              </div>
                              <textarea name="description" value={editForm.description} onChange={handleEditChange} className="border rounded-xl px-4 py-3 min-h-[120px] md:col-span-2 xl:col-span-4" placeholder="Açıklama" />
                            </div>

                            <div className="mt-8">
                              <div className="flex items-center justify-between mb-4 gap-4">
                                <div>
                                  <h4 className="text-lg font-semibold">Bedenler ve Stok</h4>
                                  <p className="text-sm text-gray-500">Bu ürüne ait bedenleri ve stokları ayrı yönetebilirsin.</p>
                                </div>
                              </div>

                              <div className="mb-4 flex flex-wrap gap-2">
                                {editSizeType !== "custom" ? (
                                  getAvailableSizes(editSizeType).map((size) => {
                                    const exists = editVariants.some((variant) => variant.size === size)
                                    return (
                                      <button key={size} type="button" onClick={() => addVariantToExisting(size)}
                                        className={`px-3 py-2 rounded-xl border text-[15px] ${exists ? "bg-black text-white border-black" : "border-gray-300 hover:border-black"}`}>
                                        {size}
                                      </button>
                                    )
                                  })
                                ) : (
                                  <button type="button" onClick={addCustomVariantToExisting} className="border border-black px-4 py-2 rounded-xl hover:bg-black hover:text-white text-[15px]">Özel Beden Ekle</button>
                                )}
                              </div>

                              {editVariants.length === 0 ? (
                                <div className="border rounded-2xl bg-white p-6 text-gray-500">Bu ürün için henüz beden yok.</div>
                              ) : (
                                <div className="overflow-x-auto border rounded-xl bg-white">
                                  <table className="w-full text-base">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="p-4 text-left font-semibold">Beden</th>
                                        <th className="p-4 text-left font-semibold">Stok</th>
                                        <th className="p-4 text-left font-semibold">Durum</th>
                                        <th className="p-4 text-left font-semibold">İşlem</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {editVariants.map((variant) => (
                                        <tr key={variant.id} className="border-t">
                                          <td className="p-4 font-medium text-[15px]">
                                            {editSizeType === "custom" ? (
                                              <input value={variant.size} onChange={(e) => updateExistingVariantField(variant.id, "size", e.target.value)} className="border rounded-lg px-3 py-2 w-32" placeholder="Beden" />
                                            ) : variant.size}
                                          </td>
                                          <td className="p-4 text-[15px]">
                                            <div className="flex items-center gap-2">
                                              <button type="button" onClick={() => updateExistingVariantField(variant.id, "stock", Math.max(0, Number(variant.stock) - 1))} className="w-8 h-8 border rounded-lg">-</button>
                                              <input type="number" min={0} value={variant.stock} onChange={(e) => updateExistingVariantField(variant.id, "stock", e.target.value)} className="border rounded-lg px-3 py-2 w-20 text-center" />
                                              <button type="button" onClick={() => updateExistingVariantField(variant.id, "stock", Number(variant.stock) + 1)} className="w-8 h-8 border rounded-lg">+</button>
                                            </div>
                                          </td>
                                          <td className="p-4 text-[15px]">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${Number(variant.stock) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                              {Number(variant.stock) > 0 ? "Stokta" : "Tükendi"}
                                            </span>
                                          </td>
                                          <td className="p-4 text-[15px]">
                                            <button type="button" onClick={() => removeExistingVariant(variant.id)} className="border border-red-500 text-red-500 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white">Sil</button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            {siblingProducts.length > 0 && (
                              <div className="mt-8">
                                <div className="mb-3">
                                  <h4 className="text-lg font-semibold">Aynı Gruptaki Diğer Renkler</h4>
                                  <p className="text-sm text-gray-500">Ürün detayında "diğer renkler" alanında bunlar gösterilecek.</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {siblingProducts.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 border rounded-xl bg-white px-3 py-2">
                                      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 border">
                                        <Image src={item.image || FALLBACK_IMAGE} alt={item.color || item.name} fill className="object-cover" sizes="40px" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">{item.color || "Renk yok"}</p>
                                        <p className="text-xs text-gray-500">{item.name}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-6 mt-5">
                              <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={editForm.featured} onChange={handleEditChange} /><span>Öne Çıkan</span></label>
                              <label className="flex items-center gap-2"><input type="checkbox" name="isNew" checked={editForm.isNew} onChange={handleEditChange} /><span>Yeni</span></label>
                              <label className="flex items-center gap-2"><input type="checkbox" name="isActive" checked={editForm.isActive} onChange={handleEditChange} /><span>Aktif</span></label>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <button type="button" onClick={() => saveEdit(product.id)} disabled={saving} className="bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 disabled:opacity-50">Kaydet</button>
                              <button type="button" onClick={() => { cancelEdit(); router.push("/bksy0net1mp4neli/products") }} className="border px-5 py-3 rounded-xl">İptal</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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