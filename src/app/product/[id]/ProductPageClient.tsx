"use client"

import Image from "next/image"
import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"
import { useWishlistStore } from "@/store/wishlistStore"
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore"
import { formatPrice } from "@/lib/format"

// ── Beden rehberi modalı ──────────────────────────────────────────────────────
const SIZE_GUIDE_ROWS = [
  { size: "XS", chest: "80-84", waist: "60-64", hip: "87-91" },
  { size: "S",  chest: "84-88", waist: "64-68", hip: "91-95" },
  { size: "M",  chest: "88-92", waist: "68-72", hip: "95-99" },
  { size: "L",  chest: "92-96", waist: "72-76", hip: "99-103" },
  { size: "XL", chest: "96-100", waist: "76-80", hip: "103-107" },
  { size: "XXL", chest: "100-104", waist: "80-84", hip: "107-111" },
]

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold tracking-wide">Beden Rehberi</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition text-gray-500">✕</button>
        </div>
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-4">Ölçüler santimetre (cm) cinsindendir. Beden seçerken vücut ölçülerinizi kullanın.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 font-semibold text-gray-700">Beden</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Göğüs</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Bel</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Kalça</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE_ROWS.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-semibold">{row.size}</td>
                    <td className="px-4 py-3 text-gray-600">{row.chest}</td>
                    <td className="px-4 py-3 text-gray-600">{row.waist}</td>
                    <td className="px-4 py-3 text-gray-600">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">* Ölçüler standart beden tablosuna göre belirlenmiştir. Ürüne göre farklılık gösterebilir.</p>
        </div>
      </div>
    </div>
  )
}

// ── Toast bildirimi (harici kütüphane gerektirmez) ────────────────────────────
function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3 bg-black text-white px-5 py-3.5 shadow-2xl text-sm font-medium whitespace-nowrap">
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
export default function ProductPageClient({ params }: Props) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const isWishlisted = useWishlistStore((state) => state.isWishlisted)
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.addItem)
  const getRecentOthers = useRecentlyViewedStore((state) => state.getOthers)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [toastVisible, setToastVisible] = useState(false)
  const [collectionDiscount, setCollectionDiscount] = useState<number | null>(null)
  const [imageFading, setImageFading] = useState(false)
  const [visibleImage, setVisibleImage] = useState<string>("")

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const [res, dmRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/collections/discount-map", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: [Number(id)] }),
          }),
        ])

        const [data, dmData] = await Promise.all([res.json(), dmRes.json()])

        if (!res.ok) throw new Error(data.error || "Ürün alınamadı")

        const productData = { ...data, productVariants: sortVariants(data.productVariants || []) }
        setProduct(productData)
        setCollectionDiscount(dmData.discounts?.[Number(id)] ?? null)
        addRecentlyViewed({
          productId: productData.id,
          name: productData.name,
          price: productData.price,
          oldPrice: productData.oldPrice,
          image: productData.image || FALLBACK_IMAGE,
          category: productData.category,
        })
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
    const url = query ? `/product/${id}?${query}` : `/product/${id}`
    window.history.replaceState(null, "", url)
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
    setSelectedIndex(0)
    updateUrl(initialSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const galleryImages = useMemo(() => {
    if (!product) return [{ id: 0, url: FALLBACK_IMAGE, alt: "Ürün", color: null, sortOrder: 0, isCover: true }]
    if (product.images.length > 0) return product.images
    return [{ id: 0, url: product.image || FALLBACK_IMAGE, alt: product.name, color: null, sortOrder: 0, isCover: true }]
  }, [product])

  const selectedImage = galleryImages[selectedIndex]?.url ?? galleryImages[0]?.url ?? FALLBACK_IMAGE

  // Görsel değişince smooth fade geçişi
  useEffect(() => {
    if (!selectedImage || visibleImage === selectedImage) return
    if (!visibleImage) { setVisibleImage(selectedImage); return }
    setImageFading(true)
    const t = setTimeout(() => {
      setVisibleImage(selectedImage)
      setImageFading(false)
    }, 180)
    return () => clearTimeout(t)
  }, [selectedImage]) // eslint-disable-line react-hooks/exhaustive-deps

  // ESC ile lightbox kapat, ok tuşlarıyla gezin
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowRight") setSelectedIndex((i) => (i + 1) % galleryImages.length)
      if (e.key === "ArrowLeft") setSelectedIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [galleryImages.length])

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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <img
          src="/bk-logo.svg"
          alt="Yükleniyor"
          className="w-24 h-24 rounded-full animate-spin"
          style={{ animationDuration: "1.5s" }}
        />
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

      {/* Beden rehberi */}
      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="Kapat"
          >
            ✕
          </button>
          <div className="relative max-w-3xl w-full max-h-[90vh] aspect-4/5" onClick={(e) => e.stopPropagation()}>
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
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-24 h-24 overflow-hidden border shrink-0 transition ${
                    selectedIndex === idx ? "border-black" : "border-gray-200"
                  }`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>

            {/* Ana görsel — tıklanınca lightbox açılır */}
            <div className="order-1 md:order-2">
              <div
                className="relative aspect-4/5 overflow-hidden bg-gray-100 border cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
                title="Büyütmek için tıkla"
              >
                <Image
                  src={visibleImage || selectedImage}
                  alt={product.name}
                  fill
                  priority
                  className={`object-cover transition-opacity duration-200 ${imageFading ? "opacity-0" : "opacity-100"}`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product.isNew && (
                    <span className="bg-black text-white text-xs px-3 py-2">Yeni</span>
                  )}
                  {discountRate && (
                    <span className="bg-white text-black text-xs px-3 py-2 border">
                      %{discountRate} İndirim
                    </span>
                  )}
                </div>

                {/* Ok butonları */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length) }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur flex items-center justify-center text-black hover:bg-white transition shadow"
                      aria-label="Önceki fotoğraf"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i + 1) % galleryImages.length) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur flex items-center justify-center text-black hover:bg-white transition shadow"
                      aria-label="Sonraki fotoğraf"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 w-9 h-9 bg-white/80 backdrop-blur flex items-center justify-center text-black/60 shadow">
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            <div className="mb-8">
              {collectionDiscount != null && (
                <span className="inline-flex items-center text-sm font-medium text-orange-700 bg-orange-50 border border-orange-100 px-3 py-1.5">
                  Sepette %{collectionDiscount} İndirim
                </span>
              )}
            </div>

            <div className="border-t border-b py-6 space-y-6">
              {/* Diğer renkler */}
              {product.siblingProducts.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium tracking-wide mb-3">Diğer Renkler</h2>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <Link
                        href={from ? `/product/${product.id}?from=${from}` : `/product/${product.id}`}
                        className="relative w-14 h-14 overflow-hidden border-2 border-black bg-gray-100 shrink-0"
                        title={product.color || "Mevcut Renk"}
                      >
                        <Image src={product.image || FALLBACK_IMAGE} alt={product.color || product.name} fill className="object-cover" sizes="56px" />
                      </Link>
                      <span className="text-[10px] text-center text-black font-medium leading-tight max-w-14 truncate">{product.color || "Renk"}</span>
                    </div>
                    {product.siblingProducts.map((item) => (
                      <div key={item.id} className="flex flex-col items-center gap-1">
                        <Link
                          href={from ? `/product/${item.id}?from=${from}` : `/product/${item.id}`}
                          className="relative w-14 h-14 overflow-hidden border-2 border-transparent hover:border-black transition bg-gray-100 shrink-0"
                          title={item.color || item.name}
                        >
                          <Image src={item.image || FALLBACK_IMAGE} alt={item.color || item.name} fill className="object-cover" sizes="56px" />
                        </Link>
                        <span className="text-[10px] text-center text-gray-600 leading-tight max-w-14 truncate">{item.color || item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beden seçimi */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium tracking-wide">Beden</h2>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-gray-500 underline underline-offset-2 hover:text-black transition"
                  >
                    Beden Rehberi
                  </button>
                </div>
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
                        className={`min-w-16 px-4 py-3 border text-sm font-medium transition ${
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
              <div className="bg-gray-50 border p-4">
                {!selectedSize ? (
                  <p className="text-sm text-gray-500">Beden seç.</p>
                ) : selectedVariant?.stock && selectedVariant.stock > 0 ? (
                  <span className={`inline-flex px-3 py-2 text-sm font-medium ${
                    selectedVariant.stock <= 3
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {selectedVariant.stock <= 3
                      ? `Son ${selectedVariant.stock} ürün! Kaçırma!`
                      : `${selectedVariant.stock} adet stokta`}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-2 text-sm font-medium bg-red-100 text-red-700">
                    Tükendi
                  </span>
                )}
              </div>
            </div>

            {/* Sepete ekle */}
            <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0 || isSelectedVariantMaxInCart}
                  className={`flex-1 px-6 py-4 text-base font-medium transition ${
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
                <button
                  type="button"
                  onClick={() => toggleWishlist({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    image: product.image || FALLBACK_IMAGE,
                    category: product.category,
                  })}
                  className={`w-14 h-14 border flex items-center justify-center transition shrink-0 ${
                    isWishlisted(product.id)
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-gray-200 text-gray-400 hover:border-black hover:text-black"
                  }`}
                  title={isWishlisted(product.id) ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

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

      {/* Son görüntülenen ürünler */}
      {(() => {
        const recent = getRecentOthers(product.id)
        if (recent.length === 0) return null
        return (
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <h2 className="text-xl font-semibold mb-6 tracking-tight">Son Görüntülenenler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recent.map((item) => (
                <Link key={item.productId} href={`/product/${item.productId}`} className="group">
                  <div className="relative aspect-4/5 overflow-hidden bg-gray-100 border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 truncate">{item.category}</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{formatPrice(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })()}

      <StoreFooter />
    </main>
  )
}
