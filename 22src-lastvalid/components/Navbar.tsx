"use client"

import Link from "next/link"
import { useCartStore } from "@/store/cartStore"

export default function Navbar() {
  const cart = useCartStore((state) => state.cart)

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <nav className="bg-black text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          ERKEK GİYİM
        </Link>

        <div className="space-x-4">
          <Link href="/">Ana Sayfa</Link>
          <Link href="#">Ürünler</Link>
          <Link href="/cart">Sepet: ₺{totalPrice}</Link>
        </div>
      </div>
    </nav>
  )
}