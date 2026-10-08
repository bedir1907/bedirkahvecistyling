import type { Metadata } from "next"
import CategoryShowcase from "@/components/store/CategoryShowcase"
import CollectionSection from "@/components/store/CollectionSection"
import HeroSection from "@/components/store/HeroSection"
import ProductSection from "@/components/store/ProductSection"
import DiscountedProducts from "@/components/store/DiscountedProducts"
import StoreFooter from "@/components/store/StoreFooter"
import { prisma } from "@/lib/prisma"
import JsonLd from "@/components/seo/JsonLd"
import { organizationJsonLd, pageMetadata, SITE_DESCRIPTION, SITE_NAME, websiteJsonLd } from "@/lib/seo"

export const revalidate = 60

export const metadata: Metadata = {
  ...pageMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: `${SITE_NAME} | Modern Erkek Giyim` },
}

export default async function Home() {
  const [settings, rawCollections, social] = await Promise.all([
    prisma.homepageSettings.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
    }),
    prisma.collection.findMany({
      where: { isActive: true, showOnHome: true },
      orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
      // Açık select: yeni eklenen SEO kolonları (metaTitle/metaDescription) anasayfa için gerekmez.
      select: {
        id: true,
        name: true,
        slug: true,
        eyebrow: true,
        description: true,
        image: true,
        video: true,
        buttonText: true,
        buttonLink: true,
        discount: true,
        products: {
          where: { product: { isActive: true } },
          select: { productId: true },
        },
      },
    }),
    prisma.socialSettings
      .findFirst({
        where: { isActive: true },
        orderBy: { id: "asc" },
        select: {
          instagramEnabled: true,
          instagramUrl: true,
          tiktokEnabled: true,
          tiktokUrl: true,
          youtubeEnabled: true,
          youtubeUrl: true,
          twitterEnabled: true,
          twitterUrl: true,
          facebookEnabled: true,
          facebookUrl: true,
        },
      })
      .catch(() => null),
  ])

  const sameAs = social
    ? [
        social.instagramEnabled && social.instagramUrl,
        social.tiktokEnabled && social.tiktokUrl,
        social.youtubeEnabled && social.youtubeUrl,
        social.twitterEnabled && social.twitterUrl,
        social.facebookEnabled && social.facebookUrl,
      ].filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url.trim()))
    : []

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
    products: col.products.map((cp) => ({ id: cp.productId })),
  }))

  return (
    <main className="min-h-screen bg-white text-black">
      <JsonLd data={[organizationJsonLd(sameAs), websiteJsonLd()]} />
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
          weeklyMode
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
