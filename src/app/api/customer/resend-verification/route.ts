import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { sendCustomerVerificationEmail } from "@/lib/customer-email"
import { getTrustedBaseUrl } from "@/lib/base-url"

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

    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

    await prisma.customerUser.update({
      where: { id: freshCustomer.id },
      data: {
        emailVerificationToken: hashedToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      },
    })

    const baseUrl = getTrustedBaseUrl()
    const verificationUrl = `${baseUrl}/email-dogrula?token=${rawToken}`

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

