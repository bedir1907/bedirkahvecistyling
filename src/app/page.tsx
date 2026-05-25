import type { Metadata } from "next"
import CategoryShowcase from "@/components/store/CategoryShowcase"
import CollectionSection from "@/components/store/CollectionSection"
import HeroSection from "@/components/store/HeroSection"
import ProductSection from "@/components/store/ProductSection"
import DiscountedProducts from "@/components/store/DiscountedProducts"
import StoreFooter from "@/components/store/StoreFooter"
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
  const [settings, rawCollections] = await Promise.all([
    prisma.homepageSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
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

  const collections = rawCollections.map((col) => ({
    id: col.id,
    name: col.name,
    slug: col.slug,
    eyebrow: col.eyebrow,
    description: col.description,
    image: col.image,
    video: col.video,
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
        <CategoryShowcase />
      )}

      {settings?.featuredProductsEnabled && (
        <ProductSection
          title={settings.featuredProductsTitle ?? "Haftanın Ürünleri"}
          viewAllHref="/category/haftanin-urunleri"
          featuredOnly
        />
      )}

      {settings?.newProductsEnabled && (
        <ProductSection
          title={settings.newProductsTitle ?? "En Yeniler"}
          viewAllHref="/category/en-yeniler"
          newOnly
        />
      )}

      {settings?.discountedProductsEnabled && (
        <DiscountedProducts
          title={settings.discountedProductsTitle ?? "İndirimdekiler"}
          viewAllHref="/category/indirimdekiler"
        />
      )}

      <StoreFooter />
    </main>
  )
}
