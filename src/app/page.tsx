import CategoryShowcase from "@/components/store/CategoryShowcase"
import DiscountedProducts from "@/components/store/DiscountedProducts"
import HeroSection from "@/components/store/HeroSection"
import ProductSection from "@/components/store/ProductSection"
import StoreFooter from "@/components/store/StoreFooter"
// AnnouncementBar kaldırıldı — layout.tsx → StoreNavbar içinde zaten render ediliyor
import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic"
export default async function Home() {
  const settings = await prisma.homepageSettings.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
  })

  return (
    <main className="min-h-screen bg-white text-black">
      <HeroSection />

      {settings?.featuredCategoriesEnabled && (
        <CategoryShowcase title={settings.featuredCategoriesTitle} />
      )}

      {settings?.featuredProductsEnabled && (
        <ProductSection
          title={settings.featuredProductsTitle}
          featuredOnly
        />
      )}

      {settings?.newProductsEnabled && (
        <ProductSection
          title={settings.newProductsTitle}
          newOnly
        />
      )}

      {settings?.discountedProductsEnabled && (
        <DiscountedProducts title={settings.discountedProductsTitle} />
      )}

      <StoreFooter />
    </main>
  )
}
