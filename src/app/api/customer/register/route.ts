import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendCustomerVerificationEmail } from "@/lib/customer-email"

function normalize(value: unknown) {
  return String(value || "").trim()
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
}

export async function POST(request: Request) {
  try {
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
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 saat

    const customer = await prisma.customerUser.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Doğrulama maili gönder
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/email-dogrula?token=${verificationToken}`

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