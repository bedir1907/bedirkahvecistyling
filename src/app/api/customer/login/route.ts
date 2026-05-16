import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { setCustomerSession } from "@/lib/customer-auth"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

function normalize(value: unknown) {
  return String(value || "").trim()
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`customer-login:${ip}`, 12, 15 * 60 * 1000)

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Cok fazla deneme yapildi. Lutfen biraz sonra tekrar deneyin." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      )
    }

    const body = await request.json()

    const email = normalize(body.email).toLowerCase()
    const password = normalize(body.password)

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre zorunlu" },
        { status: 400 }
      )
    }

    const customer = await prisma.customerUser.findUnique({
      where: { email },
    })

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      customer.passwordHash
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "E-posta veya şifre hatalı" },
        { status: 400 }
      )
    }

    await setCustomerSession(customer.id, customer.email)

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        emailVerified: customer.emailVerified,
      },
    })
  } catch (error) {
    console.error("Customer login hatası:", error)

    return NextResponse.json(
      { error: "Giriş yapılamadı" },
      { status: 500 }
    )
  }
}
