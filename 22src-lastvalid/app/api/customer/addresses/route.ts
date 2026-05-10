import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function GET() {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json([], { status: 200 })
    }

    const addresses = await prisma.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Customer addresses GET hatası:", error)

    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const body = await request.json()

    const title = normalize(body.title)
    const fullName = normalize(body.fullName)
    const phone = normalize(body.phone)
    const city = normalize(body.city)
    const district = normalize(body.district)
    const address = normalize(body.address)
    const note = normalize(body.note)
    const isDefault = Boolean(body.isDefault)

    if (!title || !fullName || !phone || !city || !district || !address) {
      return NextResponse.json(
        { error: "Zorunlu alanları doldur" },
        { status: 400 }
      )
    }

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.customerAddress.updateMany({
          where: {
            customerId: customer.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      return await tx.customerAddress.create({
        data: {
          customerId: customer.id,
          title,
          fullName,
          phone,
          city,
          district,
          address,
          note: note || null,
          isDefault,
        },
      })
    })

    return NextResponse.json({
      success: true,
      address: created,
    })
  } catch (error) {
    console.error("Customer addresses POST hatası:", error)

    return NextResponse.json(
      { error: "Adres oluşturulamadı" },
      { status: 500 }
    )
  }
}