import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"

function normalize(value: unknown) {
  return String(value || "").trim()
}

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, context: Context) {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const { id } = await context.params
    const addressId = Number(id)

    if (!Number.isFinite(addressId)) {
      return NextResponse.json({ error: "Geçersiz adres id" }, { status: 400 })
    }

    const existing = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId: customer.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 })
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

    const updated = await prisma.$transaction(async (tx) => {
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

      return await tx.customerAddress.update({
        where: { id: addressId },
        data: {
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
      address: updated,
    })
  } catch (error) {
    console.error("Customer address PATCH hatası:", error)

    return NextResponse.json(
      { error: "Adres güncellenemedi" },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, context: Context) {
  try {
    const customer = await getCustomerUserFromCookie()

    if (!customer) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const { id } = await context.params
    const addressId = Number(id)

    if (!Number.isFinite(addressId)) {
      return NextResponse.json({ error: "Geçersiz adres id" }, { status: 400 })
    }

    const existing = await prisma.customerAddress.findFirst({
      where: {
        id: addressId,
        customerId: customer.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 })
    }

    await prisma.customerAddress.delete({
      where: { id: addressId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Customer address DELETE hatası:", error)

    return NextResponse.json(
      { error: "Adres silinemedi" },
      { status: 500 }
    )
  }
}