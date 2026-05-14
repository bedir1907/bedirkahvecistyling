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

// Bu slug'lar navbar'da sabit olarak zaten var, kategorilerden tekrar gelmesin
const VIRTUAL_SLUGS = ["new-season", "indirimdekiler"]

export default function StoreNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [mounted, setMounted] = useState(false)
  const [customer, setCustomer] = useState<Customer>(null)
  const [customerLoading, setCustomerLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const cartCount = useCartStore((state) => state.getCartCount())

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50)
    else setSearchQuery("")
  }, [searchOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setSearchOpen(false); setMobileMenuOpen(false) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setCustomerLoading(true)
        const res = await fetch("/api/customer/me", { cache: "no-store" })
        const data = await res.json()
        setCustomer(res.ok ? data.customer || null : null)
      } catch { setCustomer(null) }
      finally { setCustomerLoading(false) }
    }
    fetchCustomer()
  }, [pathname])

  // Sanal kategorileri filtrele
  const realCategories = categories.filter(cat => !VIRTUAL_SLUGS.includes(cat.slug))

  function isActive(slug: string) { return pathname === `/category/${slug}` }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    router.push(`/arama?q=${encodeURIComponent(q)}`)
  }

  const iconBtn = "inline-flex items-center justify-center w-10 h-10 rounded-full border border-black/10 bg-white text-black/70 hover:border-black hover:bg-black hover:text-white transition shrink-0"

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 md:h-[72px] flex items-center justify-between gap-4">

            {/* Sol */}
            <div className="flex items-center gap-3 md:gap-6 min-w-0">
              <button type="button" onClick={() => setMobileMenuOpen(true)} className={`${iconBtn} lg:hidden`} aria-label="Menü">
                <Menu size={18} />
              </button>

              {/* Logo */}
              <Link href="/" className="shrink-0 leading-none">
                <span className="block text-[13px] md:text-[15px] font-semibold tracking-[0.22em] uppercase text-black leading-tight">
                  Bedir Kahveci
                </span>
                <span className="block text-[10px] md:text-[11px] font-light tracking-[0.35em] uppercase text-black/50 leading-tight">
                  Styling
                </span>
              </Link>

              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-[14px] font-medium">
                <Link href="/" className={`transition whitespace-nowrap ${pathname === "/" ? "text-black" : "text-black/60 hover:text-black"}`}>
                  Anasayfa
                </Link>
                <Link href="/category/new-season" className={`transition whitespace-nowrap ${pathname === "/category/new-season" ? "text-black" : "text-black/60 hover:text-black"}`}>
                  Yeni Sezon
                </Link>
                <Link href="/category/indirimdekiler" className={`transition whitespace-nowrap ${pathname === "/category/indirimdekiler" ? "text-black" : "text-black/60 hover:text-black"}`}>
                  İndirimdekiler
                </Link>
                {realCategories.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className={`transition whitespace-nowrap ${isActive(cat.slug) ? "text-black" : "text-black/60 hover:text-black"}`}>
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Sağ */}
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={() => setSearchOpen(true)} className={iconBtn} aria-label="Ara">
                <Search size={17} />
              </button>
              <Link href="/cart" className={`${iconBtn} relative`} aria-label="Sepet">
                <ShoppingBag size={18} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-white text-[10px] font-semibold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {!customerLoading && (
                <Link href={customer ? "/hesabim" : "/giris"} className="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-full border border-black/10 text-[13px] font-medium text-black/70 hover:border-black hover:bg-black hover:text-white transition">
                  <User size={15} />
                  {customer ? "Hesabım" : "Giriş"}
                </Link>
              )}
            </div>
          </div>

          {/* Mobil scroll tab */}
          <div className="lg:hidden pb-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              <Link href="/category/new-season" className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${pathname === "/category/new-season" ? "border-black bg-black text-white" : "border-black/10 bg-[#f5f3ee] text-black/70"}`}>
                Yeni Sezon
              </Link>
              <Link href="/category/indirimdekiler" className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${pathname === "/category/indirimdekiler" ? "border-black bg-black text-white" : "border-black/10 bg-[#f5f3ee] text-black/70"}`}>
                İndirimdekiler
              </Link>
              {realCategories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${isActive(cat.slug) ? "border-black bg-black text-white" : "border-black/10 bg-[#f5f3ee] text-black/70"}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobil menü */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 h-16 border-b border-black/8 shrink-0">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="leading-none">
                <span className="block text-[13px] font-semibold tracking-[0.22em] uppercase text-black leading-tight">Bedir Kahveci</span>
                <span className="block text-[10px] font-light tracking-[0.35em] uppercase text-black/50 leading-tight">Styling</span>
              </Link>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full border border-black/10">
                <X size={17} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
              <MobileLink href="/" label="Anasayfa" active={pathname === "/"} onClick={() => setMobileMenuOpen(false)} />
              <MobileLink href="/category/new-season" label="Yeni Sezon" active={pathname === "/category/new-season"} onClick={() => setMobileMenuOpen(false)} />
              <MobileLink href="/category/indirimdekiler" label="İndirimdekiler" active={pathname === "/category/indirimdekiler"} onClick={() => setMobileMenuOpen(false)} />

              {realCategories.length > 0 && (
                <p className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  Kategoriler
                </p>
              )}
              {realCategories.map((cat) => (
                <MobileLink key={cat.id} href={`/category/${cat.slug}`} label={cat.name} active={isActive(cat.slug)} onClick={() => setMobileMenuOpen(false)} />
              ))}
            </nav>

            <div className="px-4 pb-6 pt-3 border-t border-black/8 space-y-2 shrink-0">
              <Link href={customer ? "/hesabim" : "/giris"} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl border border-black/10 text-sm font-medium hover:bg-gray-50 transition">
                <User size={16} />
                {customer ? "Hesabım" : "Giriş Yap"}
              </Link>
              <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl bg-black text-white text-sm font-medium hover:opacity-90 transition">
                <ShoppingBag size={16} />
                Sepetim
                {mounted && cartCount > 0 && (
                  <span className="bg-white text-black text-xs font-semibold px-1.5 py-0.5 rounded-full">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Arama modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-16 px-4" onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-black/8">
              <Search size={18} className="text-black/30 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="flex-1 text-base outline-none bg-transparent placeholder:text-black/30"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition shrink-0">
                <X size={16} />
              </button>
            </form>
            <div className="px-4 py-3 text-sm text-black/40">
              {searchQuery.trim() ? `"${searchQuery}" için Enter'a bas` : "Aramak istediğin ürünü yaz…"}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MobileLink({ href, label, active, onClick }: {
  href: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-3 rounded-xl text-sm font-medium transition ${
        active ? "bg-black text-white" : "text-black/70 hover:bg-gray-50 hover:text-black"
      }`}
    >
      {label}
    </Link>
  )
}