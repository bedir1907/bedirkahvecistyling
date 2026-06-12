"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RecentItem = {
  productId: number
  name: string
  price: number
  oldPrice: number | null
  image: string
  category: string
  viewedAt: number
}

type RecentlyViewedState = {
  items: RecentItem[]
  addItem: (item: Omit<RecentItem, "viewedAt">) => void
  getOthers: (excludeId: number) => RecentItem[]
}

const MAX_ITEMS = 8

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.productId !== item.productId)
          const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS)
          return { items: updated }
        }),

      getOthers: (excludeId) =>
        get().items.filter((i) => i.productId !== excludeId).slice(0, 6),
    }),
    {
      name: "recently-viewed-storage",
    }
  )
)
