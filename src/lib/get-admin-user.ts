import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/admin-auth"

export async function getAdminUserFromCookie() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value

  if (!token) return null

  const payload = await verifyAdminToken(token)

  if (!payload) return null

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
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

  if (!user || !user.isActive || user.email !== payload.email) return null

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    canManageProducts: user.canManageProducts,
    canManageStock: user.canManageStock,
    canManageUsers: user.canManageUsers,
    canAssignPermissions: user.canAssignPermissions,
    canSell: user.canSell,
    canViewOrders: user.canViewOrders,
    canViewSensitiveData: user.canViewSensitiveData,
  }
}   
