import { NextResponse } from "next/server"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"

export async function GET() {
  try {
    const customer = await getCustomerUserFromCookie()

    return NextResponse.json({
      customer: customer || null,
    })
  } catch (error) {
    console.error("Customer me hatası:", error)

    return NextResponse.json(
      { customer: null },
      { status: 200 }
    )
  }
}