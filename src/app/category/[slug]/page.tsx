import type { Metadata } from "next"
import { notFound } from "next/navigation"
import JsonLd from "@/components/seo/JsonLd"
import ListingSeoText from "@/components/store/ListingSeoText"
import { getCategoryPageData, getCategoryProducts } from "@/lib/catalog"
import { sortListingProducts } from "@/lib/listing-sort"
import {
  breadcrumbJsonLd,
  categoryPath,
  collectionPageJsonLd,
  customTitle,
  pageMetadata,
  SITE_NAME,
  truncateDescription,
} from "@/lib/seo"
import CategoryPageClient from "./CategoryPageClient"

export const revalidate = 60

// Build'de sayfa üretilmez (DB gerekmez); ilk istekte render edilip 60 sn ISR önbelleğinde tutulur.
export function generateStaticParams() {
  return []
}

type Props = {
  params: Promise<{ slug: string }>
}

function autoTitle(name: string, isVirtual: boolean) {
  if (isVirtual) return name
  return `${name} - Erkek ${name} Modelleri`.replace(/Erkek Erkek /i, "Erkek ")
}

function autoDescription(name: string) {
  return `${name} modelleri ve fiyatları. ${SITE_NAME} ${name} kategorisindeki erkek giyim ürünlerini keşfet, güvenli ödeme ile online satın al.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getCategoryPageData(slug)

  if (!data) {
    return { title: "Kategori Bulunamadı", robots: { index: false, follow: true } }
  }

  const { category, isVirtual, canonicalSlug } = data
  const title = category.metaTitle?.trim() || autoTitle(category.name, isVirtual)
  const description = truncateDescription(
    category.metaDescription?.trim() ||
      category.description ||
      data.autoDescription ||
      autoDescription(category.name)
  )

  const metadata = pageMetadata({
    title,
    description,
    path: categoryPath(canonicalSlug),
    images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
  })

  return category.metaTitle?.trim() ? { ...metadata, title: customTitle(title) } : metadata
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [data, products] = await Promise.all([getCategoryPageData(slug), getCategoryProducts(slug)])

  if (!data) notFound()

  const { category, canonicalSlug } = data
  const path = categoryPath(canonicalSlug)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Anasayfa", path: "/" },
            { name: category.name, path },
          ]),
          collectionPageJsonLd({
            name: category.name,
            description: truncateDescription(category.metaDescription || category.description || data.autoDescription),
            path,
            items: sortListingProducts(products, "new").map((p) => ({ name: p.name, path: p.path, image: p.image })),
          }),
        ]}
      />
      <CategoryPageClient
        slug={slug}
        category={{
          name: category.name,
          heading: category.heading?.trim() || category.name,
          image: category.image,
          video: category.video,
        }}
        products={products}
        seoText={<ListingSeoText title={`${category.name} Hakkında`} text={category.description} />}
      />
    </>
  )
}
