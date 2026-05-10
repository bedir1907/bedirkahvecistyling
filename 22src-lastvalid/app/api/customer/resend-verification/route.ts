import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { sendCustomerVerificationEmail } from "@/lib/customer-email"

export async function POST() {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const freshCustomer = await prisma.customerUser.findUnique({
      where: { id: customer.id },
    })

    if (!freshCustomer) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    if (freshCustomer.emailVerified) {
      return NextResponse.json(
        { error: "E-posta zaten doğrulanmış" },
        { status: 400 }
      )
    }

    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

    await prisma.customerUser.update({
      where: { id: freshCustomer.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
    })

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/email-dogrula?token=${verificationToken}`

    await sendCustomerVerificationEmail({
      to: freshCustomer.email,
      name: freshCustomer.name,
      verificationUrl,
    })

    return NextResponse.json({
      success: true,
      message: "Doğrulama e-postası tekrar gönderildi.",
      
    })
  } catch (error) {
    console.error("Resend verification hatası:", error)

    return NextResponse.json(
      { error: "Doğrulama e-postası gönderilemedi" },
      { status: 500 },
      
    )
  }
}

