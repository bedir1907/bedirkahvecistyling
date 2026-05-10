import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const announcement = await prisma.announcementBar.findFirst({
      where: { isActive: true },
      orderBy: { id: "desc" },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    return NextResponse.json(
      { error: "Duyuru alınamadı" },
      { status: 500 }
    )
  }
}