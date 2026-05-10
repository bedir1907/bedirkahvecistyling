import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL tanımlı değil")
}

const pool = new Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.homepageSettings.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  })

  const data = {
    announcementEnabled: true,
    announcementText: "Yeni sezon yayında. Öne çıkan parçaları şimdi keşfet.",
    announcementLink: "/category/new-season",
    announcementLinkLabel: "İncele",

    heroEyebrow: "Yeni Sezon",
    heroTitle: "BedirKahveci Styling",
    heroSubtitle:
      "Modern, sade ve güçlü erkek giyim parçaları. Günlük stil ile premium görünümü tek vitrinde birleştir.",
    heroButtonText: "Yeni Sezon Ürünler",
    heroButtonLink: "/category/new-season",

    heroCard1Enabled: true,
    heroCard1Title: "İndirimdekiler",
    heroCard1Image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80&auto=format&fit=crop",
    heroCard1Link: "/category/indirimdekiler",

    heroCard2Enabled: false,
    heroCard2Title: "Ayakkabı",
    heroCard2Image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80&auto=format&fit=crop",
    heroCard2Link: "/category/ayakkabi",

    featuredCategoriesEnabled: true,
    featuredCategoriesTitle: "Öne Çıkan Kategoriler",

    featuredProductsEnabled: true,
    featuredProductsTitle: "Haftanın Ürünleri",

    newProductsEnabled: true,
    newProductsTitle: "En Yeniler",

    discountedProductsEnabled: true,
    discountedProductsTitle: "İndirimdekiler",

    isActive: true,
  }

  if (existing) {
    await prisma.homepageSettings.update({
      where: {
        id: existing.id,
      },
      data,
    })
  } else {
    await prisma.homepageSettings.create({
      data,
    })
  }

  console.log("Homepage settings hazır")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })