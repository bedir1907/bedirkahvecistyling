"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

  if (!user) return null

  function getLinkClass(href: string) {
    const isActive =
      href === "/admin" ? pathname === href : pathname.startsWith(href)

    return `block px-4 py-3 rounded-xl transition text-sm font-medium ${
      isActive
        ? "bg-black text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`
  }

  const canSeeOrders =
    user.role === "CREATOR" || user.canViewOrders || user.canSell

  const canSeeUsers =
    user.role === "CREATOR" || user.canManageUsers

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-5 shrink-0 flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900 break-all">
            {user.email}
          </p>
          <p className="text-xs text-gray-500 uppercase mt-1">
            {user.role}
          </p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {/* Genel */}
        <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-2 mb-1">
          Genel
        </p>
        <Link href="/admin" className={getLinkClass("/admin")}>
          📊 Dashboard
        </Link>
        <Link href="/admin/analytics" className={getLinkClass("/admin/analytics")}>
          📈 Analiz
        </Link>
        <Link href="/admin/stock" className={getLinkClass("/admin/stock")}>
          📦 Stok Takip
        </Link>

        {canSeeOrders && (
          <Link href="/admin/orders" className={getLinkClass("/admin/orders")}>
            🛍️ Siparişler
          </Link>
        )}

        {canSeeUsers && (
          <Link href="/admin/users" className={getLinkClass("/admin/users")}>
            👥 Kullanıcılar
          </Link>
        )}

        {/* İçerik & Ayarlar */}
        {user.canManageProducts && (
          <>
            <p className="px-4 py-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-5 mb-1">
              İçerik
            </p>

            <Link href="/admin/homepage" className={getLinkClass("/admin/homepage")}>
              🏠 Ana Sayfa Ayarları
            </Link>

            <Link href="/admin/social" className={getLinkClass("/admin/social")}>
              📱 Sosyal Medya
            </Link>

            <Link href="/admin/products" className={getLinkClass("/admin/products")}>
              👕 Ürünler
            </Link>

            <Link href="/admin/categories" className={getLinkClass("/admin/categories")}>
              🗂️ Kategoriler
            </Link>

            <Link href="/admin/site-pages" className={getLinkClass("/admin/site-pages")}>
              📄 Sayfa İçerikleri
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 pt-4 border-t">
        <AdminLogoutButton />
      </div>
    </aside>
  )
}
