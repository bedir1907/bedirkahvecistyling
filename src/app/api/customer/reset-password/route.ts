import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

function normalize(value: unknown) {
  return String(value || "").trim()
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const token = normalize(body.token)
    const password = normalize(body.password)
    const confirmPassword = normalize(body.confirmPassword)

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunlu" },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Şifreler eşleşmiyor" },
        { status: 400 }
      )
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.",
        },
        { status: 400 }
      )
    }

    const customer = await prisma.customerUser.findFirst({
      where: {
        passwordResetToken: token,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: "Geçersiz şifre sıfırlama bağlantısı" },
        { status: 400 }
      )
    }

    if (
      !customer.passwordResetExpiresAt ||
      customer.passwordResetExpiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Şifre sıfırlama bağlantısının süresi dolmuş" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Şifren başarıyla güncellendi.",
    })
  } catch (error) {
    console.error("Reset password hatası:", error)

    return NextResponse.json(
      { error: "Şifre güncellenemedi" },
      { status: 500 }
    )
  }
}