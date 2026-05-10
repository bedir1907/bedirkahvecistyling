import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Footer ve diğer store bileşenleri bu endpoint'i kullanır
export async function GET() {
  try {
    const settings = await prisma.socialSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        instagramEnabled: true,
        instagramUrl: true,
        tiktokEnabled: true,
        tiktokUrl: true,
        youtubeEnabled: true,
        youtubeUrl: true,
        whatsappEnabled: true,
        whatsappNumber: true,
        whatsappMessage: true,
        twitterEnabled: true,
        twitterUrl: true,
        facebookEnabled: true,
        facebookUrl: true,
      },
    })

    return NextResponse.json(settings ?? {})
  } catch (error) {
    console.error("Social public GET hatası:", error)
    return NextResponse.json({}, { status: 500 })
  }
}
