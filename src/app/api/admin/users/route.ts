import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdminToken } from "@/lib/admin-auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const currentUser = await verifyAdminToken(token)

    if (!currentUser) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const body = await request.json()

    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Eksik alan var" }, { status: 400 })
    }

    if (currentUser.role === "SALES") {
      return NextResponse.json(
        { error: "Bu işlem için yetkin yok" },
        { status: 403 }
      )
    }

    if (currentUser.role === "MANAGER" && role !== "SALES") {
      return NextResponse.json(
        { error: "Manager sadece satış danışmanı ekleyebilir" },
        { status: 403 }
      )
    }

    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email zaten kayıtlı" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Kullanıcı oluşturma hatası:", error)

    return NextResponse.json(
      { error: "Kullanıcı oluşturulamadı" },
      { status: 500 }
    )
  }
}