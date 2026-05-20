import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductPageClient from "./ProductPageClient"

export const revalidate = 60

type Props = {
  params: Promise<{ id: string }>
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bedirkahvecistyling.com"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: { name: true, description: true, image: true, category: true, price: true, color: true },
  })

  if (!product) return { title: "Ürün Bulunamadı" }

  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.name} - ${product.category} kategorisinde erkek giyim ürünü.`

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.image ? [{ url: product.image, width: 800, height: 1000, alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: {
      name: true,
      description: true,
      image: true,
      price: true,
      oldPrice: true,
      category: true,
    },
  })

  if (!product) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    brand: { "@type": "Brand", name: "Bedir Kahveci Styling" },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/product/${id}`,
      priceCurrency: "TRY",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Bedir Kahveci Styling" },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient params={params} />
    </>
  )
}
