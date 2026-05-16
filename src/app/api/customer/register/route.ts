import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendCustomerVerificationEmail } from "@/lib/customer-email"
import { getTrustedBaseUrl } from "@/lib/base-url"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

function normalize(value: unknown) {
  return String(value || "").trim()
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`customer-register:${ip}`, 6, 60 * 60 * 1000)

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Cok fazla kayit denemesi yapildi. Lutfen daha sonra tekrar deneyin." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      )
    }

    const body = await request.json()

    const name = normalize(body.name)
    const email = normalize(body.email).toLowerCase()
    const phone = normalize(body.phone)
    const password = normalize(body.password)

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Ad soyad, e-posta ve şifre zorunlu" },
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

    const existingCustomer = await prisma.customerUser.findUnique({
      where: { email },
    })

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Bu e-posta ile kayıtlı bir kullanıcı zaten var" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Doğrulama tokeni oluştur
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 saat

    const customer = await prisma.customerUser.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        emailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Doğrulama maili gönder
    const baseUrl = getTrustedBaseUrl()
    const verificationUrl = `${baseUrl}/email-dogrula?token=${rawToken}`

    try {
      await sendCustomerVerificationEmail({
        to: customer.email,
        name: customer.name,
        verificationUrl,
      })
    } catch (mailError) {
      // Mail gönderimi başarısız olsa bile kayıt tamamlansın
      console.error("Doğrulama maili gönderilemedi:", mailError)
    }

    return NextResponse.json({
      success: true,
      customer,
      message: "Kayıt başarıyla oluşturuldu. Lütfen e-postanızı doğrulayın.",
    })
  } catch (error) {
    console.error("Customer register hatası:", error)

    return NextResponse.json(
      { error: "Kayıt oluşturulamadı" },
      { status: 500 }
    )
  }
}
