import { NextResponse } from "next/server"
import { clearCustomerSession } from "@/lib/customer-auth"

export async function POST() {
  try {
    await clearCustomerSession()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Customer logout hatası:", error)

    return NextResponse.json(
      { error: "Çıkış yapılamadı" },
      { status: 500 }
    )
  }
}