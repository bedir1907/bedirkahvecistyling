"use client"

import Image from "next/image"
import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/format"

// ── Toast bildirimi (harici kütüphane gerektirmez) ────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-black text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-medium whitespace-nowrap">
        <span className="text-green-400">✓</span>
        {message}
      </div>
    </div>
  )
}

// ── Tipler ────────────────────────────────────────────────────────────────────
type ProductImage = {
  id: number
  url: string
  alt?: string | null
  color?: string | null
  sortOrder: number
  isCover: boolean
}

type ProductVariant = {
  id: number
  size: string
  stock: number
  sku?: string | null
}

type SiblingProduct = {
  id: number
  name: string
  slug: string
  color: string | null
  image: string
  price: number
  oldPrice: number | null
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
  featured: boolean
  isNew: boolean
  isActive: boolean
  images: ProductImage[]
  productVariants: ProductVariant[]
  siblingProducts: SiblingProduct[]
  categorySlug: string | null
}

type Props = {
  params: Promise<{ id: string }>
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

// ── Yardımcı: beden sıralaması ────────────────────────────────────────────────
function detectSizeType(variants: Array<{ size: string }>) {
  if (!variants || variants.length === 0) return "letter" as const
  const sizes = variants.map((item) => item.size?.trim()).filter(Boolean)
  if (sizes.length === 0) return "letter" as const
  if (sizes.every((item) => /^\d+$/.test(item))) return "number" as const
  const knownLetters = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
  if (sizes.every((item) => knownLetters.includes(item.toUpperCase())))
    return "letter" as const
  return "custom" as const
}

function sortSizes(sizeType: string, sizes: string[]) {
  const cleaned = sizes.map((item) => item.trim()).filter(Boolean)
  if (sizeType === "letter") {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]
    return [...cleaned].sort((a, b) => {
      const ai = order.indexOf(a), bi = order.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b, "tr", { sensitivity: "base" })
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }
  if (sizeType === "number") return [...cleaned].sort((a, b) => Number(a) - Number(b))
  return [...cleaned].sort((a, b) => a.localeCompare(b, "tr", { numeric: true, sensitivity: "base" }))
}

function sortVariants(variants: ProductVariant[]) {
  const sizeType = detectSizeType(variants)
  const order = sortSizes(sizeType, variants.map((item) => item.size))
  return [...variants].sort((a, b) => order.indexOf(a.size) - order.indexOf(b.size))
}

// ── Sayfa bileşeni ────────────────────────────────────────────────────────────
export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [toastVisible, setToastVisible] = useState(false)

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Ürün alınamadı")
        setProduct({ ...data, productVariants: sortVariants(data.productVariants || []) })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  function updateUrl(size?: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (size) p.set("size", size)
    else p.delete("size")
    const query = p.toString()
    router.replace(query ? `/product/${id}?${query}` : `/product/${id}`)
  }

  useEffect(() => {
    if (!product) return
    const querySize = searchParams.get("size")
    let initialSize = ""
    if (querySize) {
      const matched = product.productVariants.find((v) => v.size === querySize && v.stock > 0)
      if (matched) initialSize = matched.size
    }
    if (!initialSize) {
      const firstAvailable = [...product.productVariants]
        .filter((v) => v.stock > 0)
        .sort((a, b) => a.stock - b.stock)[0]
      if (firstAvailable) initialSize = firstAvailable.size
    }
    setSelectedSize(initialSize)
    const gallery = product.images.length > 0
      ? product.images
      : [{ id: 0, url: product.image || FALLBACK_IMAGE, alt: product.name, color: null, sortOrder: 0, isCover: true }]
    setSelectedImage(gallery[0].url)
    updateUrl(initialSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  // ESC ile lightbox kapat
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const galleryImages = useMemo(() => {
    if (!product) return [{ id: 0, url: FALLBACK_IMAGE, alt: "Ürün", color: null, sortOrder: 0, isCover: true }]
    if (product.images.length > 0) return product.images
    return [{ id: 0, url: product.image || FALLBACK_IMAGE, alt: product.name, color: null, sortOrder: 0, isCover: true }]
  }, [product])

  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize) return null
    return product.productVariants.find((v) => v.size === selectedSize) || null
  }, [product, selectedSize])

  const hasAnyStock = useMemo(() => {
    if (!product) return false
    return product.productVariants.some((v) => v.stock > 0)
  }, [product])

  const cartQuantityForSelectedVariant = useMemo(() => {
    if (!product || !selectedVariant) return 0
    return cart.find((item) => item.productId === product.id && item.variantId === selectedVariant.id)?.quantity ?? 0
  }, [cart, product, selectedVariant])

  const isSelectedVariantMaxInCart = useMemo(() => {
    if (!selectedVariant) return false
    return cartQuantityForSelectedVariant >= selectedVariant.stock
  }, [cartQuantityForSelectedVariant, selectedVariant])

  const discountRate = useMemo(() => {
    if (!product?.oldPrice || product.oldPrice <= product.price) return null
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
  }, [product])

  function handleSelectSize(size: string) {
    if (!product) return
    const variant = product.productVariants.find((item) => item.size === size)
    if (!variant || variant.stock <= 0) return
    setSelectedSize(size)
    updateUrl(size)
  }

  function handleAddToCart() {
    if (!product || !selectedVariant || selectedVariant.stock <= 0) return
    if (cartQuantityForSelectedVariant >= selectedVariant.stock) return

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      color: product.color || "",
      size: selectedVariant.size,
      price: product.price,
      image: selectedImage || product.image || FALLBACK_IMAGE,
      quantity: 1,
      stock: selectedVariant.stock,
    })

    // Toast göster
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  // ── Yükleniyor / bulunamadı ─────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-gray-500">Yükleniyor...</p>
        </section>
        <StoreFooter />
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white text-black">
        <section className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-gray-500">Ürün bulunamadı.</p>
        </section>
        <StoreFooter />
      </main>
    )
  }

  // ── Ana render ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Toast bildirimi */}
      <Toast message={`${product.name} sepete eklendi`} visible={toastVisible} />

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Kapat"
          >
            ✕
          </button>
          <div className="relative max-w-3xl w-full max-h-[90vh] aspect-[4/5]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedImage || galleryImages[0]?.url || FALLBACK_IMAGE}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">Anasayfa</Link>
          <span>/</span>
          {from === "new-season" ? (
            <><Link href="/category/new-season" className="hover:text-black transition">Yeni Sezon</Link><span>/</span></>
          ) : from === "indirimdekiler" ? (
            <><Link href="/category/indirimdekiler" className="hover:text-black transition">İndirimdekiler</Link><span>/</span></>
          ) : from ? (
            <><Link href={`/category/${from}`} className="hover:text-black transition">{product.category}</Link><span>/</span></>
          ) : product.categorySlug ? (
            <><Link href={`/category/${product.categorySlug}`} className="hover:text-black transition">{product.category}</Link><span>/</span></>
          ) : (
            <><span>{product.category}</span><span>/</span></>
          )}
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
          {/* ── Görseller ── */}
          <div className="grid md:grid-cols-[110px_1fr] gap-4">
            {/* Küçük görseller */}
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto">
              {galleryImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden border shrink-0 transition ${
                    selectedImage === img.url ? "border-black" : "border-gray-200"
                  }`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>

            {/* Ana görsel — tıklanınca lightbox açılır */}
            <div className="order-1 md:order-2">
              <div
                className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 border cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
                title="Büyütmek için tıkla"
              >
                <Image
                  key={selectedImage || galleryImages[0]?.url || FALLBACK_IMAGE}
                  src={selectedImage || galleryImages[0]?.url || FALLBACK_IMAGE}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product.isNew && (
                    <span className="bg-black text-white text-xs px-3 py-2 rounded-full">Yeni</span>
                  )}
                  {discountRate && (
                    <span className="bg-white text-black text-xs px-3 py-2 rounded-full border">
                      %{discountRate} İndirim
                    </span>
                  )}
                </div>
                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-black/60 shadow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── Detay ── */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-3">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-sm text-gray-500">Ürün Kodu: {product.productCode}</p>
                {product.color && (
                  <span className="text-sm text-gray-500">• Renk: {product.color}</span>
                )}
              </div>
            </div>

            {/* Fiyat — formatPrice ile */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <div className="border-t border-b py-6 space-y-6">
              {/* Diğer renkler */}
              {product.siblingProducts.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium tracking-wide mb-3">Diğer Renkler</h2>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={from ? `/product/${product.id}?from=${from}` : `/product/${product.id}`}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-black bg-black text-white transition"
                    >
                      <span className="relative w-12 h-12 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                        <Image src={product.image || FALLBACK_IMAGE} alt={product.color || product.name} fill className="object-cover" sizes="48px" />
                      </span>
                      <span className="text-sm font-medium">{product.color || "Mevcut Renk"}</span>
                    </Link>
                    {product.siblingProducts.map((item) => (
                      <Link
                        key={item.id}
                        href={from ? `/product/${item.id}?from=${from}` : `/product/${item.id}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-gray-200 hover:border-black transition"
                      >
                        <span className="relative w-12 h-12 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                          <Image src={item.image || FALLBACK_IMAGE} alt={item.color || item.name} fill className="object-cover" sizes="48px" />
                        </span>
                        <span className="text-sm font-medium">{item.color || item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Beden seçimi */}
              <div>
                <h2 className="text-sm font-medium tracking-wide mb-3">Beden</h2>
                <div className="flex flex-wrap gap-3">
                  {product.productVariants.map((variant) => {
                    const isSelected = selectedSize === variant.size
                    const isOut = variant.stock <= 0
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={isOut}
                        onClick={() => handleSelectSize(variant.size)}
                        className={`min-w-[64px] px-4 py-3 rounded-2xl border text-sm font-medium transition ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : isOut
                              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed line-through"
                              : "border-gray-200 hover:border-black"
                        }`}
                      >
                        {variant.size}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Stok durumu */}
              <div className="rounded-2xl bg-gray-50 border p-4">
                {!selectedSize ? (
                  <p className="text-sm text-gray-500">Beden seç.</p>
                ) : selectedVariant?.stock && selectedVariant.stock > 0 ? (
                  <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${
                    selectedVariant.stock <= 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {selectedVariant.stock <= 3
                      ? `Son ${selectedVariant.stock} ürün! Kaçırma!`
                      : `${selectedVariant.stock} adet stokta`}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    Tükendi
                  </span>
                )}
              </div>
            </div>

            {/* Sepete ekle */}
            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock <= 0 || isSelectedVariantMaxInCart}
                className={`w-full rounded-2xl px-6 py-4 text-base font-medium transition ${
                  !selectedSize
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : selectedVariant && selectedVariant.stock > 0 && !isSelectedVariantMaxInCart
                      ? "bg-black text-white hover:opacity-90"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {!selectedSize
                  ? "Beden Seç"
                  : !selectedVariant || selectedVariant.stock <= 0
                    ? "Bu Beden Tükendi"
                    : isSelectedVariantMaxInCart
                      ? "Sepette Maksimum Adet"
                      : "Sepete Ekle"}
              </button>

              {selectedVariant && isSelectedVariantMaxInCart && (
                <p className="text-sm text-orange-600">Bu beden için sepette stok kadar ürün var.</p>
              )}
              {!hasAnyStock && (
                <p className="text-sm text-red-600">Bu ürünün tüm bedenleri tükenmiş.</p>
              )}
            </div>

            {/* Açıklama */}
            <div className="mt-10">
              <h3 className="text-lg font-medium mb-3">Ürün Açıklaması</h3>
              <p className="text-gray-600 leading-7 whitespace-pre-line">
                {product.description || "Açıklama bulunmuyor."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}
