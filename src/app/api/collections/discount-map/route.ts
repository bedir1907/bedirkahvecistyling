import { NextResponse } from "next/server"
import { getCollectionDiscountMap } from "@/lib/catalog"

export async function POST(request: Request) {
  try {
    const { productIds } = await request.json()
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ discounts: {} })
    }

    const discounts = await getCollectionDiscountMap(productIds.map(Number))
    return NextResponse.json({ discounts })
  } catch (error) {
    console.error("Discount map hatası:", error)
    return NextResponse.json({ discounts: {} })
  }
}
