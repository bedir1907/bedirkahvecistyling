import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

    const settings = await prisma.shippingSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    })

    return NextResponse.json(settings ?? { fee: 0, freeAbove: null })
  } catch (error) {
    console.error("Kargo admin GET hatası:", error)
    return NextResponse.json({ error: "Kargo ayarları alınamadı" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

    const body = await request.json()
    const fee = Math.max(0, Number(body.fee) || 0)
    const freeAbove = body.freeAbove ? Math.max(0, Number(body.freeAbove)) : null

    const existing = await prisma.shippingSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    })

    if (!existing) {
      const created = await prisma.shippingSettings.create({
        data: { fee, freeAbove, isActive: true },
      })
      return NextResponse.json(created)
    }

    const updated = await prisma.shippingSettings.update({
      where: { id: existing.id },
      data: { fee, freeAbove },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Kargo admin PATCH hatası:", error)
    return NextResponse.json({ error: "Kargo ayarları güncellenemedi" }, { status: 500 })
  }
}