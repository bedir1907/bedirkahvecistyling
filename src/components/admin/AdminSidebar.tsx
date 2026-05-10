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

type NavItem = {
  href: string
  label: string
  icon: string
  badge?: string
}

type NavGroup = {
  title: string
  items: NavItem[]
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

  const navGroups: NavGroup[] = [
    {
      title: "Genel Bakış",
      items: [
        { href: "/admin", label: "Dashboard", icon: "▪" },
        { href: "/admin/analytics", label: "Analiz & Raporlar", icon: "▪" },
      ],
    },
    ...(canSeeOrders ? [{
      title: "Satış",
      items: [
        { href: "/admin/orders", label: "Siparişler", icon: "▪" },
        { href: "/admin/stock", label: "Stok Takip", icon: "▪" },
      ],
    }] : []),
    ...(user.canManageProducts ? [{
      title: "Katalog",
      items: [
        { href: "/admin/products", label: "Ürünler", icon: "▪" },
        { href: "/admin/categories", label: "Kategoriler", icon: "▪" },
      ],
    }] : []),
    ...(user.canManageProducts ? [{
      title: "Site Yönetimi",
      items: [
        { href: "/admin/homepage", label: "Ana Sayfa Ayarları", icon: "▪" },
        { href: "/admin/social", label: "Sosyal Medya", icon: "▪" },
        { href: "/admin/announcement", label: "Duyuru Bandı", icon: "▪" },
        { href: "/admin/site-pages", label: "Sayfa İçerikleri", icon: "▪" },
      ],
    }] : []),
    ...(canSeeUsers ? [{
      title: "Yönetim",
      items: [
        { href: "/admin/users", label: "Kullanıcılar", icon: "▪" },
      ],
    }] : []),
  ]

  function isActive(href: string) {
    return href === "/admin" ? pathname === href : pathname.startsWith(href)
  }

  const roleColors: Record<string, string> = {
    CREATOR: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    SALES: "bg-green-100 text-green-700",
  }

  const sidebarContent = (
    <>
      {/* Logo / Başlık */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-gray-100 shrink-0">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-800">BKS</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Admin Panel</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Kullanıcı kartı */}
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
        {navGroups.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] uppercase tracking-widest font-semibold text-gray-400">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white" : "bg-gray-300"}`} />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Alt: Siteyi görüntüle + Çıkış */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1.5 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
          Siteyi Görüntüle ↗
        </a>
        <AdminLogoutButton />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
        {sidebarContent}
      </aside>

      {/* Mobil hamburger butonu */}
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

      {/* Mobil overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobil drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col border-r border-gray-200 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}