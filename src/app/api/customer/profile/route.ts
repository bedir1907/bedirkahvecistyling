import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { sendCustomerVerificationEmail } from "@/lib/customer-email"
import { getTrustedBaseUrl } from "@/lib/base-url"

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function PATCH(request: Request) {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const body = await request.json()

    const name = normalize(body.name)
    const email = normalize(body.email).toLowerCase()
    const phone = normalize(body.phone)

    if (!name || !email) {
      return NextResponse.json(
        { error: "Ad soyad ve e-posta zorunlu" },
        { status: 400 }
      )
    }

    const existing = await prisma.customerUser.findFirst({
      where: {
        email,
        id: {
          not: customer.id,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta başka bir hesapta kullanılıyor" },
        { status: 400 }
      )
    }

    const emailChanged = email !== customer.email
    const verificationToken = emailChanged ? crypto.randomBytes(32).toString("hex") : null
    const verificationExpiresAt = emailChanged
      ? new Date(Date.now() + 1000 * 60 * 60 * 24)
      : null

    const updated = await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        name,
        email,
        phone: phone || null,
        ...(emailChanged
          ? {
              emailVerified: false,
              emailVerificationToken: verificationToken,
              emailVerificationExpiresAt: verificationExpiresAt,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
      },
    })

    if (emailChanged && verificationToken) {
      const verificationUrl = `${getTrustedBaseUrl()}/email-dogrula?token=${verificationToken}`

      await sendCustomerVerificationEmail({
        to: updated.email,
        name: updated.name,
        verificationUrl,
      })
    }

    return NextResponse.json({
      success: true,
      customer: updated,
    })
  } catch (error) {
    console.error("Customer profile PATCH hatası:", error)

    return NextResponse.json(
      { error: "Profil güncellenemedi" },
      { status: 500 }
    )
  }
}
