import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = String(body.token || "").trim()

    if (!token) {
      return NextResponse.json(
        { error: "Doğrulama tokenı eksik" },
        { status: 400 }
      )
    }

    const customer = await prisma.customerUser.findFirst({
      where: {
        emailVerificationToken: token,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Geçersiz doğrulama bağlantısı" },
        { status: 400 }
      )
    }

    if (
      !customer.emailVerificationExpiresAt ||
      customer.emailVerificationExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Doğrulama bağlantısının süresi dolmuş" },
        { status: 400 }
      )
    }

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Customer verify-email hatası:", error)

    return NextResponse.json(
      { error: "E-posta doğrulanamadı" },
      { status: 500 }
    )
  }
}