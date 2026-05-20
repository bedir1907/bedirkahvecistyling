import type { Metadata } from "next"
import CategoryShowcase from "@/components/store/CategoryShowcase"
import DiscountedProducts from "@/components/store/DiscountedProducts"
import HeroSection from "@/components/store/HeroSection"
import ProductSection from "@/components/store/ProductSection"
import StoreFooter from "@/components/store/StoreFooter"
// AnnouncementBar kaldırıldı — layout.tsx → StoreNavbar içinde zaten render ediliyor
import { prisma } from "@/lib/prisma"

export const revalidate = 60

export const metadata: Metadata = {
  title: {
    absolute: "Bedir Kahveci Styling",
  },
  description:
    "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi. Ücretsiz kargo, kolay iade.",
  openGraph: {
    title: "Bedir Kahveci Styling",
    description:
      "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi. Ücretsiz kargo, kolay iade.",
  },
}
export default async function Home() {
  const [settings, rawDiscounted] = await Promise.all([
    prisma.homepageSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, oldPrice: { not: null } },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      include: {
        images: {
          orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          take: 2,
        },
      },
    }),
  ])

  const discountedProducts = rawDiscounted
    .filter((p) => p.oldPrice !== null && p.oldPrice > p.price)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.images?.[0]?.url || p.image,
      hoverImage: p.images?.[1]?.url || null,
      colorName: p.color || "",
      category: p.category,
      href: `/product/${p.id}`,
    }))

  return (
    <main className="min-h-screen bg-white text-black">
      <HeroSection initialSettings={settings} />

      {settings?.featuredCategoriesEnabled && (
        <CategoryShowcase title={settings.featuredCategoriesTitle} />
      )}

      {settings?.featuredProductsEnabled && (
        <ProductSection title={settings.featuredProductsTitle} featuredOnly />
      )}

      {settings?.newProductsEnabled && (
        <ProductSection title={settings.newProductsTitle} newOnly />
      )}

      {settings?.discountedProductsEnabled && (
        <DiscountedProducts
          title={settings.discountedProductsTitle}
          initialProducts={discountedProducts}
        />
      )}

      <StoreFooter />
    </main>
  )
}
