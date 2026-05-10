import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"

function normalize(value: unknown) {
  return String(value || "").trim()
}

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
}

export async function PATCH(request: Request) {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const body = await request.json()

    const currentPassword = normalize(body.currentPassword)
    const newPassword = normalize(body.newPassword)
    const confirmPassword = normalize(body.confirmPassword)

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunlu" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Yeni şifreler eşleşmiyor" },
        { status: 400 }
      )
    }

    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Yeni şifre en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.",
        },
        { status: 400 }
      )
    }

    const freshCustomer = await prisma.customerUser.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        passwordHash: true,
      },
    })

    if (!freshCustomer || !freshCustomer.passwordHash) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      freshCustomer.passwordHash
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Mevcut şifre yanlış" },
        { status: 400 }
      )
    }

    const isSameAsOld = await bcrypt.compare(
      newPassword,
      freshCustomer.passwordHash
    )

    if (isSameAsOld) {
      return NextResponse.json(
        { error: "Yeni şifre mevcut şifreyle aynı olamaz" },
        { status: 400 }
      )
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        passwordHash: newPasswordHash,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Şifre başarıyla güncellendi.",
    })
  } catch (error) {
    console.error("Customer password PATCH hatası:", error)

    return NextResponse.json(
      { error: "Şifre güncellenemedi" },
      { status: 500 }
    )
  }
}