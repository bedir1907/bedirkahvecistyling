import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

function norm(value: unknown) {
  return String(value || "").trim()
}

// ── GET: mevcut sosyal medya ayarlarını döndür ────────────────────────────────
export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const settings = await prisma.socialSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Social GET hatası:", error)
    return NextResponse.json({ error: "Sosyal medya ayarları alınamadı" }, { status: 500 })
  }
}

// ── PATCH: sosyal medya ayarlarını güncelle ───────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()
    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json()

    const data = {
      instagramEnabled: Boolean(body.instagramEnabled),
      instagramUrl:     norm(body.instagramUrl) || null,

      tiktokEnabled: Boolean(body.tiktokEnabled),
      tiktokUrl:     norm(body.tiktokUrl) || null,

      youtubeEnabled: Boolean(body.youtubeEnabled),
      youtubeUrl:     norm(body.youtubeUrl) || null,

      whatsappEnabled: Boolean(body.whatsappEnabled),
      whatsappNumber:  norm(body.whatsappNumber) || null,
      whatsappMessage: norm(body.whatsappMessage) || null,

      twitterEnabled: Boolean(body.twitterEnabled),
      twitterUrl:     norm(body.twitterUrl) || null,

      facebookEnabled: Boolean(body.facebookEnabled),
      facebookUrl:     norm(body.facebookUrl) || null,
    }

    const existing = await prisma.socialSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    })

    if (!existing) {
      const created = await prisma.socialSettings.create({
        data: { ...data, isActive: true },
      })
      return NextResponse.json(created)
    }

    const updated = await prisma.socialSettings.update({
      where: { id: existing.id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Social PATCH hatası:", error)
    return NextResponse.json({ error: "Sosyal medya ayarları kaydedilemedi" }, { status: 500 })
  }
}
