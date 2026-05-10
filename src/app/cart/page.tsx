"use client"

import Image from "next/image"
import Link from "next/link"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"
import { formatPrice } from "@/lib/format"

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80&auto=format&fit=crop"

export default function CartPage() {
  const cart = useCartStore((state) => state.cart)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const clearCart = useCartStore((state) => state.clearCart)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    // AnnouncementBar kaldırıldı — layout'tan geliyor
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
            <div className="space-y-5">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="rounded-3xl border bg-white p-5 md:p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="relative w-full sm:w-[130px] h-[160px] sm:h-[130px] shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold">{item.name}</h2>
                          <p className="text-gray-600 mt-1">{formatPrice(item.price)}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Renk: {item.color} • Beden: {item.size}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-lg font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.productId, item.variantId)}
                            className="w-10 h-10 rounded-xl border hover:bg-black hover:text-white transition"
                          >
                            -
                          </button>
                          <span className="min-w-[28px] text-center font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.productId, item.variantId)}
                            className="w-10 h-10 rounded-xl border hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-gray-600 hover:bg-black hover:text-white transition"
                          aria-label="Sepetten çıkar"
                        >
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

            <aside className="rounded-3xl border bg-gray-50 p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold mb-6">Sipariş Özeti</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ürün Adedi</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span className="text-green-600 font-medium">Ücretsiz</span>
                </div>
                <div className="border-t pt-4 flex items-center justify-between text-base font-semibold">
                  <span>Toplam</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full text-center rounded-2xl bg-black text-white px-6 py-4 font-medium hover:opacity-90 transition"
                >
                  Ödemeye Geç
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  className="block w-full text-center rounded-2xl border px-6 py-4 font-medium hover:bg-black hover:text-white transition"
                >
                  Sepeti Temizle
                </button>
              </div>

              {/* Güven rozetleri */}
              <div className="mt-6 pt-6 border-t space-y-2">
                {["🔒 SSL ile güvenli ödeme", "🚚 Ücretsiz kargo", "↩️ 14 gün iade garantisi"].map((badge) => (
                  <p key={badge} className="text-xs text-gray-500 flex items-center gap-2">{badge}</p>
                ))}
              </div>
            </aside>
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}
