import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type AdminRole = "CREATOR" | "MANAGER" | "SALES"

function normalizeString(value: unknown) {
  return String(value || "").trim()
}

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

export async function POST(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || currentUser.role !== "CREATOR") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json()

    const name = normalizeString(body.name)
    const email = normalizeString(body.email).toLowerCase()
    const password = normalizeString(body.password)
    const role = normalizeString(body.role).toUpperCase() as AdminRole
    const isActive = Boolean(body.isActive)

    if (!name) {
      return NextResponse.json(
        { error: "Ad zorunlu" },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "E-posta zorunlu" },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
        { status: 400 }
      )
    }

    if (!["CREATOR", "MANAGER", "SALES"].includes(role)) {
      return NextResponse.json(
        { error: "Geçersiz rol" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.adminUser.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta zaten kullanılıyor" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const permissions = getPermissionsByRole(role)

    const createdUser = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
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
      },
    })

    return NextResponse.json(createdUser)
  } catch (error) {
    console.error("Kullanıcı oluşturma hatası:", error)

    return NextResponse.json(
      { error: "Kullanıcı oluşturulamadı" },
      { status: 500 }
    )
  }
}