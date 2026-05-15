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
    canManageStock?: boolean
    canManageUsers?: boolean
    canViewOrders?: boolean
    canSell?: boolean
    canViewSensitiveData?: boolean
    canAssignPermissions?: boolean
  } | null
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  if (!user) return null

  const canSeeOrders = user.role === "CREATOR" || user.canViewOrders || user.canSell
  const canSeeUsers = user.role === "CREATOR" || user.canManageUsers

  const roleColors: Record<string, string> = {
    CREATOR: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    SALES: "bg-green-100 text-green-700",
  }

  function isActive(href: string) {
    return href === "/admin" ? pathname === href : pathname.startsWith(href)
  }

  function linkCls(href: string) {
    return `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive(href)
        ? "bg-gray-900 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-800">BKS</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          ✕
        </button>
      </div>

      {/* Kullanıcı */}
      <div className="px-4 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${roleColors[user.role] ?? "bg-gray-100 text-gray-600"}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">

        {/* Genel */}
        <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-gray-400">Genel</p>
        <div className="space-y-0.5 mb-4">
          <Link href="/admin" className={linkCls("/admin")}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin") ? "#fff" : "#d1d5db" }} />
            Dashboard
          </Link>
          <Link href="/admin/analytics" className={linkCls("/admin/analytics")}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/analytics") ? "#fff" : "#d1d5db" }} />
            Analiz & Raporlar
          </Link>
          <Link href="/admin/stock" className={linkCls("/admin/stock")}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/stock") ? "#fff" : "#d1d5db" }} />
            Stok Takip
          </Link>
          {canSeeOrders && (
            <Link href="/admin/orders" className={linkCls("/admin/orders")}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/orders") ? "#fff" : "#d1d5db" }} />
              Siparişler
            </Link>
          )}
          {canSeeUsers && (
            <Link href="/admin/users" className={linkCls("/admin/users")}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/users") ? "#fff" : "#d1d5db" }} />
              Kullanıcılar
            </Link>
          )}
        </div>

        {/* Katalog */}
        {user.canManageProducts && (
          <>
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-gray-400">Katalog</p>
            <div className="space-y-0.5 mb-4">
              <Link href="/admin/products" className={linkCls("/admin/products")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/products") ? "#fff" : "#d1d5db" }} />
                Ürünler
              </Link>
              <Link href="/admin/categories" className={linkCls("/admin/categories")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/categories") ? "#fff" : "#d1d5db" }} />
                Kategoriler
              </Link>
            </div>

            {/* Site Yönetimi */}
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-gray-400">Site Yönetimi</p>
            <div className="space-y-0.5 mb-4">
              <Link href="/admin/homepage" className={linkCls("/admin/homepage")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/homepage") ? "#fff" : "#d1d5db" }} />
                Ana Sayfa Ayarları
              </Link>
              <Link href="/admin/announcement" className={linkCls("/admin/announcement")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/announcement") ? "#fff" : "#d1d5db" }} />
                Duyuru Bandı
              </Link>
              <Link href="/admin/social" className={linkCls("/admin/social")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/social") ? "#fff" : "#d1d5db" }} />
                Sosyal Medya
              </Link>
              <Link href="/admin/shipping" className={linkCls("/admin/shipping")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/shipping") ? "#fff" : "#d1d5db" }} />
                Kargo Ayarları
              </Link>
              <Link href="/admin/site-pages" className={linkCls("/admin/site-pages")}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isActive("/admin/site-pages") ? "#fff" : "#d1d5db" }} />
                Sayfa İçerikleri
              </Link>
            </div>
          </>
        )}
      </nav>

      {/* Alt */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1 shrink-0">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
          Siteyi Görüntüle ↗
        </a>
        <AdminLogoutButton />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
        {sidebarContent}
      </aside>

      {/* Mobil hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-30 w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition"
        aria-label="Menü"
      >
        <span className="flex flex-col gap-1">
          <span className="w-4 h-0.5 bg-gray-700 rounded" />
          <span className="w-4 h-0.5 bg-gray-700 rounded" />
          <span className="w-3 h-0.5 bg-gray-700 rounded" />
        </span>
      </button>

      {/* Overlay */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Drawer */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col border-r border-gray-200 shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>
    </>
  )
}