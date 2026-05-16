import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendCustomerResetPasswordEmail } from "@/lib/customer-email"
import { getTrustedBaseUrl } from "@/lib/base-url"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, 5, 60 * 60 * 1000)

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Cok fazla deneme yapildi. Lutfen daha sonra tekrar deneyin." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      )
    }

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

    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const resetExpiresAt = new Date(Date.now() + 1000 * 60 * 60)

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: resetExpiresAt,
      },
    })

    const baseUrl = getTrustedBaseUrl()
    const resetUrl = `${baseUrl}/sifre-sifirla?token=${rawToken}`

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
