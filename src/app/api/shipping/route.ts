import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const settings = await prisma.shippingSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    })

    if (!settings) {
      return NextResponse.json({ fee: 0, freeAbove: null })
    }

    return NextResponse.json({
      fee: settings.fee,
      freeAbove: settings.freeAbove,
    })
  } catch (error) {
    console.error("Kargo GET hatası:", error)
    return NextResponse.json({ fee: 0, freeAbove: null })
  }
}