import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Bu siparis akisi devre disi. Odeme icin guncel checkout akisini kullanin.",
    },
    { status: 410 }
  )
}
