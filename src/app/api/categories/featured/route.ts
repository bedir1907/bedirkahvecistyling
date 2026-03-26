import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Featured kategori liste hatası:", error)

    return NextResponse.json(
      { error: "Kategoriler getirilemedi" },
      { status: 500 }
    )
  }
}