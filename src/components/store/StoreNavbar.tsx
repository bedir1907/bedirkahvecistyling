"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag, User } from "lucide-react"
import { usePathname } from "next/navigation"
import { useCartStore } from "@/store/cartStore"

type Category = {
  id: number
  name: string
  slug: string
}

type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
} | null

export default function StoreNavbar() {
  const pathname = usePathname()

  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)
  const [customer, setCustomer] = useState<Customer>(null)
  const [customerLoading, setCustomerLoading] = useState(true)

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

        setCategories(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setCustomerLoading(true)

        const res = await fetch("/api/customer/me", {
          cache: "no-store",
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Kullanıcı bilgisi alınamadı")
        }

        setCustomer(data.customer || null)
      } catch (error) {
        console.error(error)
        setCustomer(null)
      } finally {
        setCustomerLoading(false)
      }
    }

    fetchCustomer()
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-[78px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-10 min-w-0">
            <Link
              href="/"
              className="shrink-0 text-2xl md:text-3xl font-semibold tracking-[0.18em] leading-none"
            >
              E-TİCARET
            </Link>

            <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium min-w-0">
              <Link
                href="/"
                className="text-black hover:text-gray-500 transition whitespace-nowrap"
              >
                Anasayfa
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="text-black hover:text-gray-500 transition whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 hover:border-black hover:bg-black hover:text-white transition"
              aria-label="Sepet"
              title="Sepet"
            >
              <ShoppingBag size={19} strokeWidth={1.9} />

              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-black text-white text-[11px] font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {!customerLoading && (
              <Link
                href={customer ? "/hesabim" : "/giris"}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 transition text-[15px] font-medium"
              >
                <User size={17} strokeWidth={1.9} />
                {customer ? "Hesabım" : "Giriş"}
              </Link>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="lg:hidden pb-4 overflow-x-auto">
            <div className="flex items-center gap-5 min-w-max text-sm font-medium">
              <Link
                href="/"
                className="whitespace-nowrap hover:text-gray-500 transition"
              >
                Anasayfa
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="whitespace-nowrap hover:text-gray-500 transition"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}