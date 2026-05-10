"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Menu, Search, ShoppingBag, User, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)
  const [customer, setCustomer] = useState<Customer>(null)
  const [customerLoading, setCustomerLoading] = useState(true)

  // Mobil menü
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Arama
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const cartCount = useCartStore((state) => state.getCartCount())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Arama açılınca input'a odaklan
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    } else {
      setSearchQuery("")
    }
  }, [searchOpen])

  // ESC ile kapat
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Kategoriler alınamadı")
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
        const res = await fetch("/api/customer/me", { cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Kullanıcı bilgisi alınamadı")
        setCustomer(data.customer || null)
      } catch {
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

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    router.push(`/arama?q=${encodeURIComponent(q)}`)
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 md:px-5">
          <div className="h-[78px] flex items-center justify-between gap-6">
            {/* Sol: Logo + Desktop Nav */}
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

            {/* Sağ: İkonlar */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {/* Arama ikonu */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-black/10 bg-white text-black/80 hover:border-black hover:bg-black hover:text-white transition"
                aria-label="Ara"
                title="Ara"
              >
                <Search size={18} strokeWidth={1.9} />
              </button>

              {/* Sepet */}
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

              {/* Kullanıcı */}
              {!customerLoading && (
                <Link
                  href={customer ? "/hesabim" : "/giris"}
                  className="hidden md:inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full border border-black/10 bg-white text-[15px] font-medium text-black/80 hover:border-black/20 hover:bg-gray-50 hover:text-black transition"
                >
                  <User size={17} strokeWidth={1.9} />
                  {customer ? "Hesabım" : "Giriş"}
                </Link>
              )}

              {/* Hamburger — sadece mobile */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-black/10 bg-white text-black/80 hover:border-black hover:bg-black hover:text-white transition"
                aria-label="Menü"
              >
                {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>

          {/* Desktop: kategori scroll (tablet) */}
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

      {/* ── Mobil Tam Ekran Menü ────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-[78px] border-b border-black/10 shrink-0">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[22px] font-semibold tracking-[0.18em]"
            >
              E-TİCARET
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-black/10"
              aria-label="Menüyü kapat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav linkleri */}
          <nav className="flex-1 overflow-y-auto px-5 py-8 space-y-1">
            <MobileNavLink href="/" label="Anasayfa" active={pathname === "/"} onClick={() => setMobileMenuOpen(false)} />
            {categories.map((category) => (
              <MobileNavLink
                key={category.id}
                href={`/category/${category.slug}`}
                label={category.name}
                active={isCategoryActive(category.slug)}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </nav>

          {/* Alt butonlar */}
          <div className="px-5 pb-8 pt-4 border-t border-black/10 space-y-3 shrink-0">
            <Link
              href={customer ? "/hesabim" : "/giris"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-black/10 font-medium text-black/80 hover:bg-black hover:text-white transition"
            >
              <User size={18} />
              {customer ? "Hesabım" : "Giriş Yap"}
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              <ShoppingBag size={18} />
              Sepet
              {mounted && cartCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-white text-black text-[11px] font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* ── Arama Modal ──────────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="search-modal-overlay fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false)
          }}
        >
          <div className="search-modal-panel w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-black/10">
              <Search size={20} className="shrink-0 text-black/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="flex-1 text-lg outline-none bg-transparent placeholder:text-black/30"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </form>
            <div className="px-5 py-4 text-sm text-black/40">
              {searchQuery.trim()
                ? `"${searchQuery}" için Enter'a bas`
                : "Aramak istediğin ürünü yaz…"}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MobileNavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3.5 rounded-2xl text-lg font-medium transition ${
        active
          ? "bg-black text-white"
          : "text-black/70 hover:bg-gray-50 hover:text-black"
      }`}
    >
      {label}
    </Link>
  )
}
