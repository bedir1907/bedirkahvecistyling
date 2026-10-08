"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WishlistItem = {
  productId: number
  /** Ürün URL slug'ı (eski kayıtlarda yok → /product/{id} yönlendirmesiyle açılır) */
  slug?: string
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
}

type WishlistState = {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (productId: number) => void
  toggleWishlist: (item: WishlistItem) => void
  isWishlisted: (productId: number) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (item) =>
        set((state) => {
          if (state.wishlist.some((w) => w.productId === item.productId)) return state
          return { wishlist: [...state.wishlist, item] }
        }),

      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.productId !== productId),
        })),

      toggleWishlist: (item) => {
        const exists = get().wishlist.some((w) => w.productId === item.productId)
        if (exists) {
          get().removeFromWishlist(item.productId)
        } else {
          get().addToWishlist(item)
        }
      },

      isWishlisted: (productId) =>
        get().wishlist.some((w) => w.productId === productId),
    }),
    {
      name: "wishlist-storage",
      version: 1,
      // Eski/yabancı kayıtlar: yalnızca geçerli productId'li öğeleri koru
      migrate: (persisted) => {
        const items = (persisted as { wishlist?: unknown } | null)?.wishlist
        return {
          wishlist: Array.isArray(items)
            ? items.filter((i): i is WishlistItem => typeof i?.productId === "number")
            : [],
        } as { wishlist: WishlistItem[] }
      },
    }
  )
)
