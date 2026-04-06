import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendCustomerResetPasswordEmail } from "@/lib/customer-email"

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = normalize(body.email).toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: "E-posta zorunlu" },
        { status: 400 }
      )
    }

    const customer = await prisma.customerUser.findUnique({
      where: { email },
    })

    // Güvenlik için kullanıcı yoksa da success döndür
    if (!customer) {
      return NextResponse.json({
        success: true,
        message:
          "Eğer bu e-posta sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir.",
      })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpiresAt = new Date(Date.now() + 1000 * 60 * 60)

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: resetExpiresAt,
      },
    })

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/sifre-sifirla?token=${resetToken}`

    await sendCustomerResetPasswordEmail({
      to: customer.email,
      name: customer.name,
      resetUrl,
    })

    return NextResponse.json({
      success: true,
      message:
        "Eğer bu e-posta sistemde kayıtlıysa şifre sıfırlama bağlantısı gönderilecektir.",
    })
  } catch (error) {
    console.error("Forgot password hatası:", error)

    return NextResponse.json(
      { error: "Şifre sıfırlama bağlantısı gönderilemedi" },
      { status: 500 }
    )
  }
}