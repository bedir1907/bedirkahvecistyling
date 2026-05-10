import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Context = {
  params: Promise<{
    slug: string
  }>
}

export async function GET(_: Request, context: Context) {
  try {
    const { slug } = await context.params

    const category = await prisma.category.findFirst({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Kategori detay hatası:", error)

    return NextResponse.json(
      { error: "Kategori getirilemedi" },
      { status: 500 }
    )
  }
}