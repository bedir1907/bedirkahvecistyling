import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { createAdminToken } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const email = body.email
    const password = body.password

    const user = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı" },
        { status: 401 }
      )
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Email veya şifre hatalı" },
        { status: 401 }
      )
    }

    const token = await createAdminToken({
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
    })

    const response = NextResponse.json({ success: true })

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Admin login hatası:", error)

    return NextResponse.json(
      { error: "Giriş yapılamadı" },
      { status: 500 }
    )
  }
}