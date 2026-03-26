"use client"

import Image from "next/image"
import Link from "next/link"
import { use, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreNavbar from "@/components/store/StoreNavbar"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"

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
}

type Props = {
  params: Promise<{
    id: string
  }>
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

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

function sortVariants(variants: ProductVariant[]) {
  const sizeType = detectSizeType(variants)
  const order = sortSizes(
    sizeType,
    variants.map((item) => item.size)
  )

  return [...variants].sort(
    (a, b) => order.indexOf(a.size) - order.indexOf(b.size)
  )
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const addToCart = useCartStore((state) => state.addToCart)
const cart = useCartStore((state) => state.cart)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [addedToCart, setAddedToCart] = useState(false)
 useEffect(() => {
  setAddedToCart(false)
}, [id, selectedSize, selectedImage])

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Ürün alınamadı")
        }

        setProduct({
          ...data,
          productVariants: sortVariants(data.productVariants || []),
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
    const params = new URLSearchParams()

    if (size) params.set("size", size)

    const query = params.toString()
    router.replace(query ? `/product/${id}?${query}` : `/product/${id}`)
  }

  useEffect(() => {
    if (!product) return

    const querySize = searchParams.get("size")
    let initialSize = ""

    if (querySize) {
      const matchedSize = product.productVariants.find(
        (variant) => variant.size === querySize && variant.stock > 0
      )
      if (matchedSize) {
        initialSize = matchedSize.size
      }
    }

    if (!initialSize) {
      const firstAvailable = [...product.productVariants]
        .filter((variant) => variant.stock > 0)
        .sort((a, b) => a.stock - b.stock)[0]

      if (firstAvailable) {
        initialSize = firstAvailable.size
      }
    }

    setSelectedSize(initialSize)

    const gallery =
      product.images.length > 0
        ? product.images
        : [
            {
              id: 0,
              url: product.image || FALLBACK_IMAGE,
              alt: product.name,
              color: null,
              sortOrder: 0,
              isCover: true,
            },
          ]

    setSelectedImage(gallery[0].url)
    updateUrl(initialSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const galleryImages = useMemo(() => {
    if (!product) {
      return [
        {
          id: 0,
          url: FALLBACK_IMAGE,
          alt: "Ürün",
          color: null,
          sortOrder: 0,
          isCover: true,
        },
      ]
    }

    if (product.images.length > 0) {
      return product.images
    }

    return [
      {
        id: 0,
        url: product.image || FALLBACK_IMAGE,
        alt: product.name,
        color: null,
        sortOrder: 0,
        isCover: true,
      },
    ]
  }, [product])

  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize) return null
    return (
      product.productVariants.find((variant) => variant.size === selectedSize) ||
      null
    )
  }, [product, selectedSize])

  const hasAnyStock = useMemo(() => {
    if (!product) return false
    return product.productVariants.some((variant) => variant.stock > 0)
  }, [product])
  const cartQuantityForSelectedVariant = useMemo(() => {
  if (!product || !selectedVariant) return 0

  const existing = cart.find(
    (item) =>
      item.productId === product.id &&
      item.variantId === selectedVariant.id
  )

  return existing ? existing.quantity : 0
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

  setAddedToCart(true)

  window.setTimeout(() => {
    setAddedToCart(false)
  }, 1400)
}

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black">
        <AnnouncementBar />
        <StoreNavbar />
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
        <AnnouncementBar />
        <StoreNavbar />
        <section className="max-w-7xl mx-auto px-4 py-16">
          <p className="text-gray-500">Ürün bulunamadı.</p>
        </section>
        <StoreFooter />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      <StoreNavbar />

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-sm text-gray-500 mb-8 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-black transition">
            Anasayfa
          </Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-start">
          <div className="grid md:grid-cols-[110px_1fr] gap-4">
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
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>

            <div className="order-1 md:order-2">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 border">
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
                    <span className="bg-black text-white text-xs px-3 py-2 rounded-full">
                      Yeni
                    </span>
                  )}

                  {discountRate && (
                    <span className="bg-white text-black text-xs px-3 py-2 rounded-full border">
                      %{discountRate} İndirim
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="mb-4">
              <p className="text-sm uppercase tracking-[0.25em] text-gray-500 mb-3">
                {product.category}
              </p>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <p className="text-sm text-gray-500">
                  Ürün Kodu: {product.productCode}
                </p>

                {product.color && (
                  <span className="text-sm text-gray-500">
                    • Renk: {product.color}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <span className="text-3xl font-semibold">₺{product.price}</span>

              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">
                  ₺{product.oldPrice}
                </span>
              )}
            </div>

            <div className="border-t border-b py-6 space-y-6">
              {product.siblingProducts.length > 0 && (
                <div>
                  <div className="mb-3">
                    <h2 className="text-sm font-medium tracking-wide">Diğer Renkler</h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/product/${product.id}`}
                      className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-black bg-black text-white transition"
                    >
                      <span className="relative w-12 h-12 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                        <Image
                          src={product.image || FALLBACK_IMAGE}
                          alt={product.color || product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </span>

                      <span className="text-sm font-medium">
                        {product.color || "Mevcut Renk"}
                      </span>
                    </Link>

                    {product.siblingProducts.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.id}`}
                        className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-gray-200 hover:border-black transition"
                      >
                        <span className="relative w-12 h-12 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                          <Image
                            src={item.image || FALLBACK_IMAGE}
                            alt={item.color || item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </span>

                        <span className="text-sm font-medium">
                          {item.color || item.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="mb-3">
                  <h2 className="text-sm font-medium tracking-wide">Beden</h2>
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
                        className={`min-w-[64px] px-4 py-3 rounded-2xl border text-sm font-medium transition ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : isOut
                              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-black"
                        }`}
                      >
                        {variant.size}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 border p-4">
                {!selectedSize ? (
                  <p className="text-sm text-gray-500">Beden seç.</p>
                ) : selectedVariant?.stock && selectedVariant.stock > 0 ? (
                  <span
                    className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${
                      selectedVariant.stock <= 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedVariant.stock <= 2
                      ? `Son ${selectedVariant.stock} stok`
                      : `${selectedVariant.stock} adet stokta`}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    Tükendi
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
  !selectedVariant ||
  selectedVariant.stock <= 0 ||
  isSelectedVariantMaxInCart
}
                className={`w-full rounded-2xl px-6 py-4 text-base font-medium transition ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : !selectedSize
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : selectedVariant && selectedVariant.stock > 0
                        ? "bg-black text-white hover:opacity-90"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {addedToCart
  ? "Sepete Eklendi ✓"
  : !selectedSize
    ? "Beden Seç"
    : !selectedVariant || selectedVariant.stock <= 0
      ? "Bu Beden Tükendi"
      : isSelectedVariantMaxInCart
        ? "Sepette Maksimum Adet"
        : "Sepete Ekle"}
              </button>
{selectedVariant && isSelectedVariantMaxInCart && (
    <p className="text-sm text-orange-600">
      Bu beden için sepette stok kadar ürün var.
    </p>
  )}
              {!hasAnyStock && (
                <p className="text-sm text-red-600">
                  Bu ürünün tüm bedenleri tükenmiş.
                </p>
              )}
            </div>

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