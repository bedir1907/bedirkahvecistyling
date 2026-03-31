import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"

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

    const currentPassword = normalize(body.currentPassword)
    const newPassword = normalize(body.newPassword)
    const confirmPassword = normalize(body.confirmPassword)

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Tüm şifre alanlarını doldur" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Yeni şifre en az 8 karakter olmalı" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Yeni şifreler uyuşmuyor" },
        { status: 400 }
      )
    }

    const freshCustomer = await prisma.customerUser.findUnique({
      where: { id: customer.id },
    })

    if (!freshCustomer || !freshCustomer.passwordHash) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      )
    }

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      freshCustomer.passwordHash
    )

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "Mevcut şifre yanlış" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.customerUser.update({
      where: { id: customer.id },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Customer password PATCH hatası:", error)

    return NextResponse.json(
      { error: "Şifre güncellenemedi" },
      { status: 500 }
    )
  }
}