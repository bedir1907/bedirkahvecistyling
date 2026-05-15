import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

    const settings = await prisma.homepageSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        announcementEnabled: true,
        announcementText: true,
        announcementLink: true,
        announcementLinkLabel: true,
      },
    })

    return NextResponse.json(settings ?? {
      announcementEnabled: false,
      announcementText: null,
      announcementLink: null,
      announcementLinkLabel: null,
    })
  } catch (error) {
    console.error("Duyuru GET hatası:", error)
    return NextResponse.json({ error: "Duyuru bilgileri alınamadı" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })

    const body = await request.json()

    const announcementData = {
      announcementEnabled: Boolean(body.announcementEnabled),
      announcementText: String(body.announcementText || "").trim() || null,
      announcementLink: String(body.announcementLink || "").trim() || null,
      announcementLinkLabel: String(body.announcementLinkLabel || "").trim() || null,
    }

    const existing = await prisma.homepageSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    })

    if (!existing) {
      // HomepageSettings yoksa minimal kayıt oluştur
      const created = await prisma.homepageSettings.create({
        data: {
          ...announcementData,
          heroTitle: "",
          heroSubtitle: "",
          heroButtonText: "",
          heroButtonLink: "",
          isActive: true,
        },
      })
      return NextResponse.json(created)
    }

    // Sadece announcement alanlarını güncelle
    const updated = await prisma.homepageSettings.update({
      where: { id: existing.id },
      data: announcementData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Duyuru PATCH hatası:", error)
    return NextResponse.json({ error: "Duyuru güncellenemedi" }, { status: 500 })
  }
}