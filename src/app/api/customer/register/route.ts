import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { setCustomerSession } from "@/lib/customer-auth"

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = normalize(body.name)
    const email = normalize(body.email).toLowerCase()
    const password = normalize(body.password)
    const phone = normalize(body.phone)

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Ad soyad, e-posta ve şifre zorunlu" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
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

    const passwordHash = await bcrypt.hash(password, 10)

    const customer = await prisma.customerUser.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })

    await setCustomerSession(customer.id, customer.email)

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    console.error("Customer register hatası:", error)

    return NextResponse.json(
      { error: "Kayıt oluşturulamadı" },
      { status: 500 }
    )
  }
}