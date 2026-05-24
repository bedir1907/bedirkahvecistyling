import type { Metadata } from "next"
import CategoryShowcase from "@/components/store/CategoryShowcase"
import CollectionSection from "@/components/store/CollectionSection"
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
  const [settings, rawDiscounted, rawCollections] = await Promise.all([
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
    prisma.collection.findMany({
      where: { isActive: true, showOnHome: true },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      include: {
        products: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, image: true, price: true, oldPrice: true, category: true, isActive: true },
            },
          },
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

  const collections = rawCollections.map((col) => ({
    id: col.id,
    name: col.name,
    slug: col.slug,
    eyebrow: col.eyebrow,
    description: col.description,
    image: col.image,
    buttonText: col.buttonText,
    buttonLink: col.buttonLink,
    discount: col.discount,
    products: col.products
      .filter((cp: { product: { isActive: boolean } }) => cp.product.isActive)
      .map((cp: { product: { id: number } }) => ({ id: cp.product.id })),
  }))

  return (
    <main className="min-h-screen bg-white text-black">
      <HeroSection initialSettings={settings} />

      {(settings?.collectionsEnabled ?? true) && collections.length > 0 && (
        <CollectionSection collections={collections} />
      )}

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
