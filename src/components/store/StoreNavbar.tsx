"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

type Category = {
  id: number
  name: string
  slug: string
}

export default function StoreNavbar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)
  const cartCount = useCartStore((state) => state.getCartCount())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Kategoriler alınamadı")
        }

        setCategories(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/" className="text-3xl font-bold tracking-[0.2em]">
          E-TİCARET
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-base font-medium">
          <Link href="/" className="hover:text-gray-500 transition">
            Anasayfa
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="hover:text-gray-500 transition"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 text-base">
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 hover:border-black hover:bg-black hover:text-white transition"
            aria-label="Sepet"
            title="Sepet"
          >
            <ShoppingBag size={20} strokeWidth={1.9} />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-black text-white text-[11px] font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          <Link href="/admin/login" className="hover:text-gray-500 transition">
            Giriş
          </Link>
        </div>
      </div>
    </header>
  )
}