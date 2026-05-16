import { Fragment } from "react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"
import UserPermissionsForm from "@/components/admin/UserPermissionsForm"
import DeleteAdminUserButton from "@/components/admin/DeleteAdminUserButton"

function getRoleLabel(role: string) {
  switch (role) {
    case "CREATOR":
      return "Creator"
    case "MANAGER":
      return "Manager"
    case "SALES":
      return "Sales"
    default:
      return role
  }
}

function getRoleClass(role: string) {
  switch (role) {
    case "CREATOR":
      return "bg-black text-white"
    case "MANAGER":
      return "bg-blue-100 text-blue-700"
    case "SALES":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default async function AdminUsersPage() {
  const currentUser = await getAdminUserFromCookie()

  if (!currentUser) {
    return <div>Erişim yok</div>
  }

  if (currentUser.role !== "CREATOR") {
    return <div>Erişim yok</div>
  }

  const users = await prisma.adminUser.findMany({
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      canManageProducts: true,
      canManageStock: true,
      canManageUsers: true,
      canAssignPermissions: true,
      canSell: true,
      canViewOrders: true,
      canViewSensitiveData: true,
    },
  })

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin - Kullanıcılar</h1>
            <p className="text-gray-600 mt-1">
              Yetkili kullanıcıları buradan yönetebilirsin
            </p>
          </div>

          <Link
            href="/bksy0net1mp4neli/users/new"
            className="bg-black text-white px-5 py-3 rounded-xl hover:opacity-90"
          >
            Yeni Kullanıcı Ekle
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="p-4">ID</th>
                <th className="p-4">Ad</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Durum</th>
                <th className="p-4">İşlem</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <Fragment key={user.id}>
                  <tr className="border-b">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleClass(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.role !== "CREATOR" ? (
                        <DeleteAdminUserButton userId={user.id} />
                      ) : (
                        <span className="text-sm text-gray-400">Silinemez</span>
                      )}
                    </td>
                  </tr>

                  <tr className="border-b bg-gray-50">
                    <td colSpan={6} className="p-4">
                      <UserPermissionsForm user={user} />
                    </td>
                  </tr>
                </Fragment>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Henüz kullanıcı yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}