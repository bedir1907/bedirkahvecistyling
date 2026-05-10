import { ReactNode } from "react"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getAdminUserFromCookie()

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={user} />

      {/* İçerik — sidebar genişliği kadar sol margin (sadece desktop) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Mobilde hamburger butonu — sidebar kendi içinde yönetiyor */}
          <div id="admin-menu-trigger" />

          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              {/* Boş alan — hamburger butonu sidebar'dan portal ile buraya gelecek */}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Admin Panel</h1>
            </div>
          </div>

          {user && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">
                {user.email}
              </p>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {user.role}
              </p>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
