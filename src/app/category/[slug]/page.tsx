import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import CategoryPageClient from "./CategoryPageClient"

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

const VIRTUAL_SLUGS: Record<string, { name: string; description: string }> = {
  "new-season": {
    name: "Yeni Sezon",
    description: "Bu sezonun en yeni erkek giyim ürünleri. Bedir Kahveci Styling yeni sezon koleksiyonu.",
  },
  "indirimdekiler": {
    name: "İndirimdekiler",
    description: "İndirimli erkek giyim ürünleri. Bedir Kahveci Styling kampanyalı ürün koleksiyonu.",
  },
  "haftanin-urunleri": {
    name: "Haftanın Ürünleri",
    description: "Bu haftanın öne çıkan erkek giyim ürünleri. Bedir Kahveci Styling seçkisi.",
  },
  "en-yeniler": {
    name: "En Yeniler",
    description: "En yeni eklenen erkek giyim ürünleri. Bedir Kahveci Styling yeni ürünleri.",
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const virtual = VIRTUAL_SLUGS[slug]
  if (virtual) {
    return {
      title: virtual.name,
      description: virtual.description,
      openGraph: {
        title: virtual.name,
        description: virtual.description,
      },
    }
  }

  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    select: { name: true },
  })

  if (!category) return { title: "Kategori" }

  const description = `${category.name} kategorisindeki tüm erkek giyim ürünleri. Bedir Kahveci Styling koleksiyonu.`

  return {
    title: category.name,
    description,
    openGraph: {
      title: category.name,
      description,
    },
  }
}

export default function CategoryPage({ params }: Props) {
  return <CategoryPageClient params={params} />
}
