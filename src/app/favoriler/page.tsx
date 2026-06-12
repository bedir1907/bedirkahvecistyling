"use client"

import Link from "next/link"
import Image from "next/image"
import StoreFooter from "@/components/store/StoreFooter"
import { useWishlistStore } from "@/store/wishlistStore"
import { formatPrice } from "@/lib/format"

export default function FavoritesPage() {
  const wishlist = useWishlistStore((state) => state.wishlist)
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist)

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Favorilerim</h1>
          <p className="text-gray-500 mt-2">Beğendiğin ürünleri burada sakla.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 mb-6 text-gray-200">
              <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="#f3f4f6"/>
                <path d="M53.84 22.61a13.75 13.75 0 0 0-19.45 0L40 28.22l5.61-5.61a13.75 13.75 0 0 1 8.23 23.44L40 49.61l-13.84-3.56a13.75 13.75 0 0 1 0-19.45" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M54 23a13.75 13.75 0 0 1 0 19.45L40 56l-14-13.55A13.75 13.75 0 0 1 40 23l14 13.55" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Favori listeniz boş</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-xs">
              Beğendiğiniz ürünlerdeki kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
            </p>
            <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item.productId} className="group relative">
                <Link href={`/product/${item.productId}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-semibold">{formatPrice(item.price)}</span>
                      {item.oldPrice && item.oldPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(item.oldPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.productId)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur flex items-center justify-center text-red-500 hover:bg-red-50 transition shadow-sm"
                  title="Favorilerden çıkar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}
