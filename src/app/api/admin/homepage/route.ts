import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

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
      "/",
      "/category/new-season",
      "/category/indirimdekiler",
      ...categories.map((category) => `/category/${category.slug}`),
    ])

    const linksToValidate = [
      body.announcementLink,
      body.heroButtonLink,
      body.heroCard1Link,
      body.heroCard2Link,
    ].filter(Boolean)

    for (const link of linksToValidate) {
      if (!allowedLinks.has(link)) {
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
      announcementText: body.announcementText || null,
      announcementLink: body.announcementLink || null,
      announcementLinkLabel: body.announcementLinkLabel || null,

      heroEyebrow: body.heroEyebrow || "Yeni Sezon",
      heroTitle: body.heroTitle || "",
      heroSubtitle: body.heroSubtitle || "",
      heroButtonText: body.heroButtonText || "",
      heroButtonLink: body.heroButtonLink || "",

      heroCard1Enabled: Boolean(body.heroCard1Enabled),
      heroCard1Title: body.heroCard1Title || null,
      heroCard1Image: body.heroCard1Image || null,
      heroCard1Link: body.heroCard1Link || null,

      heroCard2Enabled: Boolean(body.heroCard2Enabled),
      heroCard2Title: body.heroCard2Title || null,
      heroCard2Image: body.heroCard2Image || null,
      heroCard2Link: body.heroCard2Link || null,

      featuredCategoriesEnabled: Boolean(body.featuredCategoriesEnabled),
      featuredCategoriesTitle:
        body.featuredCategoriesTitle || "Öne Çıkan Kategoriler",

      featuredProductsEnabled: Boolean(body.featuredProductsEnabled),
      featuredProductsTitle:
        body.featuredProductsTitle || "Haftanın Ürünleri",

      newProductsEnabled: Boolean(body.newProductsEnabled),
      newProductsTitle: body.newProductsTitle || "En Yeniler",

      discountedProductsEnabled: Boolean(body.discountedProductsEnabled),
      discountedProductsTitle:
        body.discountedProductsTitle || "İndirimdekiler",
    }

    if (!existing) {
      const created = await prisma.homepageSettings.create({
        data: {
          ...data,
          isActive: true,
        },
      })

      return NextResponse.json(created)
    }

    const updated = await prisma.homepageSettings.update({
      where: {
        id: existing.id,
      },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Homepage admin patch hatası:", error)

    return NextResponse.json(
      { error: "Homepage ayarları güncellenemedi" },
      { status: 500 }
    )
  }
}