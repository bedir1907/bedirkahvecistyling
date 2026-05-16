import { ReactNode } from "react"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAdminUserFromCookie()

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <AdminSidebar user={user} />

      {/* İçerik alanı — desktop'ta sidebar kadar sol boşluk */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Üst bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 md:px-6">
          {/* Mobil hamburger trigger — Sidebar'dan portal */}
          <div id="admin-hamburger-slot" className="lg:hidden" />

          {/* Başlık */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500 font-medium">Canlı</span>
            </div>
          </div>

          {/* Sağ: Kullanıcı */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user.email}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{user.role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </header>

        {/* Sayfa içeriği */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  )
}
