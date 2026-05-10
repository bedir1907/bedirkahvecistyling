import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type Context = {
  params: Promise<{
    id: string
  }>
}

type AdminRole = "CREATOR" | "MANAGER" | "SALES"

function getPermissionsByRole(role: AdminRole) {
  if (role === "CREATOR") {
    return {
      canManageProducts: true,
      canManageStock: true,
      canManageUsers: true,
      canAssignPermissions: true,
      canSell: true,
      canViewOrders: true,
      canViewSensitiveData: true,
    }
  }

  if (role === "MANAGER") {
    return {
      canManageProducts: true,
      canManageStock: true,
      canManageUsers: false,
      canAssignPermissions: false,
      canSell: true,
      canViewOrders: true,
      canViewSensitiveData: true,
    }
  }

  return {
    canManageProducts: false,
    canManageStock: false,
    canManageUsers: false,
    canAssignPermissions: false,
    canSell: true,
    canViewOrders: true,
    canViewSensitiveData: true,
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || currentUser.role !== "CREATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()

    const role = String(body.role || "").trim().toUpperCase() as AdminRole
    const isActive = Boolean(body.isActive)

    if (!["CREATOR", "MANAGER", "SALES"].includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol" },
        { status: 400 }
      )
    }

    const targetUserId = Number(id)

    const existingUser = await prisma.adminUser.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        id: true,
        role: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    if (currentUser.userId === targetUserId && role !== "CREATOR") {
      return NextResponse.json(
        { error: "Kendi hesabının creator rolünü düşüremezsin" },
        { status: 400 }
      )
    }

    const permissions = getPermissionsByRole(role)

    const updated = await prisma.adminUser.update({
      where: {
        id: targetUserId,
      },
      data: {
        role,
        isActive,
        ...permissions,
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

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Permission güncelleme hatası:", error)

    return NextResponse.json(
      { error: "Yetkiler güncellenemedi" },
      { status: 500 }
    )
  }
}