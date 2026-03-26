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
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar user={user} />

      <div className="flex-1 min-w-0">
        <header className="h-20 bg-white border-b px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500">
              Mağaza yönetim alanı
            </p>
          </div>

          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.email}
              </p>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {user.role}
              </p>
            </div>
          )}
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}