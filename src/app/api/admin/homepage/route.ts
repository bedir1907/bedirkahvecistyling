import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

function normalizeString(value: unknown) {
  return String(value || "").trim()
}

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const settings = await prisma.homepageSettings.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        id: "asc",
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Homepage admin get hatası:", error)

    return NextResponse.json(
      { error: "Homepage ayarları getirilemedi" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json()

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
      },
    })

    const allowedLinks = new Set<string>([
      "/category/new-season",
      "/category/indirimdekiler",
      "/koleksiyon",
      "/",
      ...categories.map((category) => `/category/${category.slug}`),
    ])

    const announcementLink = normalizeString(body.announcementLink)
    const heroButtonLink = normalizeString(body.heroButtonLink)
    const heroCard1Link = normalizeString(body.heroCard1Link)
    const heroCard2Link = normalizeString(body.heroCard2Link)

    const linksToValidate = [
      announcementLink,
      heroButtonLink,
      heroCard1Link,
      heroCard2Link,
    ].filter(Boolean)

    for (const link of linksToValidate) {
      if (!allowedLinks.has(link)) {
        console.error("Geçersiz link yakalandı:", link)
        return NextResponse.json(
          { error: `Geçersiz link: ${link}` },
          { status: 400 }
        )
      }
    }

    const existing = await prisma.homepageSettings.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        id: "asc",
      },
    })

    const data = {
      announcementEnabled: Boolean(body.announcementEnabled),
      announcementText: normalizeString(body.announcementText) || null,
      announcementLink: announcementLink || null,
      announcementLinkLabel: normalizeString(body.announcementLinkLabel) || null,

      heroEyebrow: normalizeString(body.heroEyebrow) || "Yeni Sezon",
      heroTitle: normalizeString(body.heroTitle),
      heroSubtitle: normalizeString(body.heroSubtitle),
      heroButtonText: normalizeString(body.heroButtonText),
      heroButtonLink: heroButtonLink,

      heroCard1Enabled: Boolean(body.heroCard1Enabled),
      heroCard1Title: normalizeString(body.heroCard1Title) || null,
      heroCard1Image: normalizeString(body.heroCard1Image) || null,
      heroCard1Link: heroCard1Link || null,

      heroCard2Enabled: Boolean(body.heroCard2Enabled),
      heroCard2Title: normalizeString(body.heroCard2Title) || null,
      heroCard2Image: normalizeString(body.heroCard2Image) || null,
      heroCard2Link: heroCard2Link || null,

      featuredCategoriesEnabled: body.featuredCategoriesEnabled ?? true,
      featuredCategoriesTitle:
        normalizeString(body.featuredCategoriesTitle) || "Öne Çıkan Kategoriler",

      featuredProductsEnabled: body.featuredProductsEnabled ?? true,
      featuredProductsTitle:
        normalizeString(body.featuredProductsTitle) || "Haftanın Ürünleri",

      newProductsEnabled: body.newProductsEnabled ?? true,
      newProductsTitle:
        normalizeString(body.newProductsTitle) || "En Yeniler",

      discountedProductsEnabled: body.discountedProductsEnabled ?? true,
      discountedProductsTitle:
        normalizeString(body.discountedProductsTitle) || "İndirimdekiler",
    }

    if (!existing) {
      const created = await prisma.homepageSettings.create({
        data: {
          ...data,
          isActive: true,
        },
      })

      revalidatePath("/")
      return NextResponse.json(created)
    }

    const updated = await prisma.homepageSettings.update({
      where: {
        id: existing.id,
      },
      data,
    })

    revalidatePath("/")

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Homepage admin patch hatası:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Homepage ayarları güncellenemedi",
      },
      { status: 500 }
    )
  }
}