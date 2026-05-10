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

  function isCategoryActive(slug: string) {
    return pathname === `/category/${slug}`
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 md:px-5">
        <div className="h-[78px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-8 xl:gap-10 min-w-0">
            <Link
              href="/"
              className="shrink-0 text-[22px] md:text-[28px] font-semibold tracking-[0.18em] leading-none text-black"
            >
              E-TİCARET
            </Link>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-[15px] font-medium min-w-0">
              <Link
                href="/"
                className={`transition whitespace-nowrap ${
                  pathname === "/"
                    ? "text-black"
                    : "text-black/70 hover:text-black"
                }`}
              >
                Anasayfa
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`transition whitespace-nowrap ${
                    isCategoryActive(category.slug)
                      ? "text-black"
                      : "text-black/70 hover:text-black"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center w-11 h-11 rounded-full border border-black/10 bg-white text-black/80 hover:border-black hover:bg-black hover:text-white transition"
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
                className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-black/10 bg-white text-[15px] font-medium text-black/80 hover:border-black/20 hover:bg-gray-50 hover:text-black transition"
              >
                <User size={17} strokeWidth={1.9} />
                {customer ? "Hesabım" : "Giriş"}
              </Link>
            )}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="lg:hidden pb-4 overflow-x-auto">
            <div className="flex items-center gap-2.5 min-w-max">
              <Link
                href="/"
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  pathname === "/"
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-[#f5f3ee] text-black/80 hover:bg-black hover:text-white"
                }`}
              >
                Anasayfa
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isCategoryActive(category.slug)
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-[#f5f3ee] text-black/80 hover:bg-black hover:text-white"
                  }`}
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