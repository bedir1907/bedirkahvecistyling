"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: number
  variantId: number
  name: string
  color: string
  size: string
  price: number
  image: string
  quantity: number
  stock: number
}

type CartState = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: number, variantId: number) => void
  clearCart: () => void
  increaseQuantity: (productId: number, variantId: number) => void
  decreaseQuantity: (productId: number, variantId: number) => void
  getCartCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.variantId === item.variantId
          )

          if (existing) {
            return {
              cart: state.cart.map((cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.variantId === item.variantId
                  ? {
                      ...cartItem,
                      quantity: Math.min(
                        cartItem.quantity + item.quantity,
                        cartItem.stock
                      ),
                    }
                  : cartItem
              ),
            }
          }

          return {
            cart: [...state.cart, item],
          }
        }),

      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.variantId === variantId
              )
          ),
        })),

      clearCart: () => set({ cart: [] }),

      increaseQuantity: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, item.stock),
                }
              : item
          ),
        })),

      decreaseQuantity: (productId, variantId) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.productId === productId && item.variantId === variantId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      getCartCount: () =>
        get().cart.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
)