import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAdminUserFromCookie } from "@/lib/get-admin-user"

type LinkOption = {
  label: string
  value: string
  group: string
}

export async function GET() {
  try {
    const currentUser = await getAdminUserFromCookie()

    if (!currentUser || !currentUser.canManageProducts) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const [categories, collections] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { name: true, slug: true },
      }),
      prisma.collection.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { name: true, slug: true },
      }),
    ])

    const categoryOptions: LinkOption[] = categories.map((category) => ({
      label: category.name,
      value: `/category/${category.slug}`,
      group: "Kategoriler",
    }))

    const collectionOptions: LinkOption[] = collections.map((col) => ({
      label: col.name,
      value: `/collections/${col.slug}`,
      group: "Koleksiyonlar",
    }))

    const staticOptions: LinkOption[] = [
      { label: "Anasayfa", value: "/", group: "Sabit Sayfalar" },
      { label: "Yeni Sezon", value: "/category/new-season", group: "Sabit Sayfalar" },
      { label: "İndirimdekiler", value: "/category/indirimdekiler", group: "Sabit Sayfalar" },
    ]

    const allOptions = [...staticOptions, ...collectionOptions, ...categoryOptions]

    const uniqueMap = new Map<string, LinkOption>()

    for (const option of allOptions) {
      if (!uniqueMap.has(option.value)) {
        uniqueMap.set(option.value, option)
      }
    }

    const uniqueOptions = Array.from(uniqueMap.values())

    return NextResponse.json(uniqueOptions)
  } catch (error) {
    console.error("Link seçenekleri hatası:", error)

    return NextResponse.json(
      { error: "Link seçenekleri getirilemedi" },
      { status: 500 }
    )
  }
}