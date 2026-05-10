import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.homepageSettings.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        id: "asc",
      },
      select: {
        announcementEnabled: true,
        announcementText: true,
        announcementLink: true,
        announcementLinkLabel: true,

        heroEyebrow: true,
        heroTitle: true,
        heroSubtitle: true,
        heroButtonText: true,
        heroButtonLink: true,

        heroCard1Enabled: true,
        heroCard1Title: true,
        heroCard1Image: true,
        heroCard1Link: true,

        heroCard2Enabled: true,
        heroCard2Title: true,
        heroCard2Image: true,
        heroCard2Link: true,

        featuredCategoriesEnabled: true,
        featuredCategoriesTitle: true,
        featuredProductsEnabled: true,
        featuredProductsTitle: true,
        newProductsEnabled: true,
        newProductsTitle: true,
        discountedProductsEnabled: true,
        discountedProductsTitle: true,
      },
    })

    if (!settings) {
      return NextResponse.json(
        { error: "Homepage ayarları bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Homepage public get hatası:", error)

    return NextResponse.json(
      { error: "Homepage ayarları alınamadı" },
      { status: 500 }
    )
  }
}