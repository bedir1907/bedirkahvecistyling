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
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Homepage settings hatası:", error)

    return NextResponse.json(
      { error: "Homepage verisi getirilemedi" },
      { status: 500 }
    )
  }
}