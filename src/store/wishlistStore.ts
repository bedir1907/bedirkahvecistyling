"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WishlistItem = {
  productId: number
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
    }
  )
)
