"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import AdminLogoutButton from "@/components/admin/AdminLogoutButton"

type Props = {
  user: {
    email: string
    role: string
    canManageProducts: boolean
    canManageUsers?: boolean
    canViewOrders?: boolean
    canSell?: boolean
  } | null
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // ESC ile kapat
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!user) return null

  function getLinkClass(href: string) {
    const isActive =
      href === "/admin" ? pathname === href : pathname.startsWith(href)
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
      isActive
        ? "bg-black text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`
  }

  const canSeeOrders = user.role === "CREATOR" || user.canViewOrders || user.canSell
  const canSeeUsers = user.role === "CREATOR" || user.canManageUsers

  const navContent = (
    <>
      {/* Logo + kullanıcı */}
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight">Admin Panel</h2>
          {/* Mobilde kapat butonu */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-500"
          >
            ✕
          </button>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-3">
          <p className="text-sm font-medium text-gray-900 break-all leading-tight">
            {user.email}
          </p>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
            {user.role}
          </p>
        </div>
      </div>

      {/* Nav linkleri */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Genel */}
        <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
          Genel
        </p>
        <Link href="/admin" className={getLinkClass("/admin")}>
          <span>📊</span> Dashboard
        </Link>
        <Link href="/admin/analytics" className={getLinkClass("/admin/analytics")}>
          <span>📈</span> Analiz
        </Link>
        <Link href="/admin/stock" className={getLinkClass("/admin/stock")}>
          <span>📦</span> Stok Takip
        </Link>
        {canSeeOrders && (
          <Link href="/admin/orders" className={getLinkClass("/admin/orders")}>
            <span>🛍️</span> Siparişler
          </Link>
        )}
        {canSeeUsers && (
          <Link href="/admin/users" className={getLinkClass("/admin/users")}>
            <span>👥</span> Kullanıcılar
          </Link>
        )}

        {/* İçerik */}
        {user.canManageProducts && (
          <>
            <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-4 mb-1">
              İçerik
            </p>
            <Link href="/admin/homepage" className={getLinkClass("/admin/homepage")}>
              <span>🏠</span> Ana Sayfa Ayarları
            </Link>
            <Link href="/admin/social" className={getLinkClass("/admin/social")}>
              <span>📱</span> Sosyal Medya
            </Link>
            <Link href="/admin/products" className={getLinkClass("/admin/products")}>
              <span>👕</span> Ürünler
            </Link>
            <Link href="/admin/categories" className={getLinkClass("/admin/categories")}>
              <span>🗂️</span> Kategoriler
            </Link>
            <Link href="/admin/site-pages" className={getLinkClass("/admin/site-pages")}>
              <span>📄</span> Sayfa İçerikleri
            </Link>
          </>
        )}
      </nav>

      {/* Çıkış */}
      <div className="px-3 py-4 border-t border-gray-100">
        <AdminLogoutButton />
      </div>
    </>
  )

  return (
    <>
      {/* ── Desktop sidebar — sabit sol kenar ──────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r z-30">
        {navContent}
      </aside>

      {/* ── Mobil: hamburger butonu — header'ın sol üstünde ─────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-white border shadow-sm hover:bg-gray-50 transition"
        aria-label="Menüyü aç"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── Mobil: overlay backdrop ──────────────────────────────────────────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobil: drawer ────────────────────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  )
}
