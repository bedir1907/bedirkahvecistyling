import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Context = {
  params: Promise<{
    key: string
  }>
}

export async function GET(_: Request, context: Context) {
  try {
    const { key } = await context.params

    const page = await prisma.sitePage.findUnique({
      where: { key },
      select: {
        key: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    })

    if (!page) {
      return NextResponse.json(
        { error: "Sayfa bulunamadı" },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Public site page GET hatası:", error)

    return NextResponse.json(
      { error: "Sayfa getirilemedi" },
      { status: 500 }
    )
  }
}