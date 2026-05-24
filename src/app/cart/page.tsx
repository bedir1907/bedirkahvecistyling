"use client"

import Image from "next/image"
import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"
import { useEffect, useMemo, useState } from "react"
import { formatPrice } from "@/lib/format"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

type ShippingSettings = {
  fee: number
  freeAbove: number | null
}

export default function CartPage() {
  const cart = useCartStore((state) => state.cart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)

  const [shipping, setShipping] = useState<ShippingSettings>({ fee: 0, freeAbove: null })
  const [discountMap, setDiscountMap] = useState<Record<number, number>>({})

  useEffect(() => {
    fetch("/api/shipping")
      .then(r => r.json())
      .then(d => setShipping(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (cart.length === 0) {
      void Promise.resolve().then(() => setDiscountMap({}))
      return
    }
    const productIds = [...new Set(cart.map(item => item.productId))]
    fetch("/api/collections/discount-map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    }).then(r => r.json()).then(d => setDiscountMap(d.discounts ?? {})).catch(() => {})
  }, [cart])

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  // Sadece koleksiyondaki ürünlere indirim, ürün bazlı hesap
  const discountAmount = useMemo(() => {
    return cart.reduce((sum, item) => {
      const d = discountMap[item.productId] ?? 0
      if (!d) return sum
      return sum + Math.round(item.price * item.quantity * d / 100)
    }, 0)
  }, [cart, discountMap])

  const discountedSubtotal = subtotal - discountAmount

  const shippingCost = useMemo(() => {
    if (shipping.fee === 0) return 0
    if (shipping.freeAbove !== null && discountedSubtotal >= shipping.freeAbove) return 0
    return shipping.fee
  }, [shipping, discountedSubtotal])

  const total = discountedSubtotal + shippingCost

  const freeShippingRemaining = useMemo(() => {
    if (!shipping.freeAbove || shipping.fee === 0) return null
    if (subtotal >= shipping.freeAbove) return null
    return shipping.freeAbove - subtotal
  }, [shipping, subtotal])

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Sepetim</h1>
          <p className="text-gray-500 mt-2">Seçtiğin ürünleri kontrol et ve siparişini tamamla.</p>
        </div>

        {cart.length === 0 ? (
          <div className="border rounded-3xl p-10 text-center bg-white">
            <p className="text-gray-600 mb-5">Sepetiniz boş.</p>
            <Link href="/" className="inline-flex px-6 py-3 rounded-2xl bg-black text-white">
              Alışverişe Dön
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
            {/* Ürünler */}
            <div className="space-y-5">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="rounded-3xl border bg-white p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="relative w-full sm:w-[130px] h-[160px] sm:h-[130px] shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                      <Image src={item.image || FALLBACK_IMAGE} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold">{item.name}</h2>
                          <p className="text-gray-600 mt-1">{formatPrice(item.price)}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Renk: {item.color} • Beden: {item.size}
                          </p>
                          {discountMap[item.productId] && (
                            <span className="inline-flex items-center mt-2 text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                              Sepette %{discountMap[item.productId]} İndirim
                            </span>
                          )}
                        </div>
                        <div className="text-left md:text-right">
                          {discountMap[item.productId] ? (
                            <>
                              <p className="text-sm text-gray-400 line-through">{formatPrice(item.price * item.quantity)}</p>
                              <p className="text-lg font-semibold text-green-700">
                                {formatPrice(item.price * item.quantity - Math.round(item.price * item.quantity * discountMap[item.productId] / 100))}
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-semibold">{formatPrice(item.price * item.quantity)}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => decreaseQuantity(item.productId, item.variantId)}
                            className="w-10 h-10 rounded-xl border hover:bg-black hover:text-white transition">
                            -
                          </button>
                          <span className="min-w-7 text-center font-medium">{item.quantity}</span>
                          <button type="button" onClick={() => increaseQuantity(item.productId, item.variantId)}
                            className="w-10 h-10 rounded-xl border hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={item.quantity >= item.stock}>
                            +
                          </button>
                        </div>

                        <button type="button" onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-gray-600 hover:bg-black hover:text-white transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0l1 12h6l1-12M10 11v6M14 11v6" />
                          </svg>
                          <span>Sepetten Çıkar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Özet */}
            <aside className="rounded-3xl border bg-gray-50 p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold mb-6">Sipariş Özeti</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ürün Adedi</span>
                  <span>{itemCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Koleksiyon İndirimi</span>
                    <span className="text-green-600 font-medium">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingCost === 0 ? "Ücretsiz" : formatPrice(shippingCost)}
                  </span>
                </div>

                {freeShippingRemaining && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 text-xs text-green-700">
                    {formatPrice(freeShippingRemaining)} daha ekle, ücretsiz kargo kazan!
                  </div>
                )}

                <div className="border-t pt-4 flex items-center justify-between text-base font-semibold">
                  <span>Toplam</span>
                  <div className="text-right">
                    <span>{formatPrice(total)}</span>
                    <p className="text-xs text-gray-400 font-normal mt-0.5">KDV Dahil</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/checkout"
                  className="block w-full text-center rounded-2xl bg-black text-white px-6 py-4 font-medium hover:opacity-90 transition">
                  Ödemeye Geç
                </Link>
                <button type="button" onClick={clearCart}
                  className="block w-full text-center rounded-2xl border px-6 py-4 font-medium hover:bg-black hover:text-white transition">
                  Sepeti Temizle
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}