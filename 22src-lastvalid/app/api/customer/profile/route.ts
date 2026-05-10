import { NextResponse } from "next/server"
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

    const updated = await prisma.customerUser.update({
      where: { id: customer.id },
      data: {
        name,
        email,
        phone: phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    })

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