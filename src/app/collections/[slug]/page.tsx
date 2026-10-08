import type { Metadata } from "next"
import { notFound } from "next/navigation"
import JsonLd from "@/components/seo/JsonLd"
import { getCollectionProducts, getCollectionRecord } from "@/lib/catalog"
import { sortListingProducts } from "@/lib/listing-sort"
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  collectionPath,
  customTitle,
  pageMetadata,
  SITE_NAME,
  truncateDescription,
} from "@/lib/seo"
import CollectionPageClient from "./CollectionPageClient"

export const revalidate = 60

// Build'de sayfa üretilmez (DB gerekmez); ilk istekte render edilip 60 sn ISR önbelleğinde tutulur.
export function generateStaticParams() {
  return []
}

type Props = {
  params: Promise<{ slug: string }>
}

function autoTitle(name: string) {
  return /koleksiyon/i.test(name) ? name : `${name} Koleksiyonu`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [collection, products] = await Promise.all([getCollectionRecord(slug), getCollectionProducts(slug)])

  if (!collection) {
    return { title: "Koleksiyon Bulunamadı", robots: { index: false, follow: true } }
  }

  const customMetaTitle = collection.metaTitle?.trim()
  const title = customMetaTitle || autoTitle(collection.name)
  const description =
    truncateDescription(collection.metaDescription) ||
    truncateDescription(collection.description) ||
    truncateDescription(`${collection.name} koleksiyonu: ${SITE_NAME} seçkisiyle modern erkek giyim ürünlerini keşfet.`)

  const metadata = pageMetadata({
    title,
    description,
    path: collectionPath(slug),
    images: collection.image ? [{ url: collection.image, alt: collection.name }] : undefined,
  })

  const withTitle = customMetaTitle ? { ...metadata, title: customTitle(customMetaTitle) } : metadata
  // Ürünsüz koleksiyon = zayıf içerik → indekslenmez (ürün eklenince otomatik açılır; sitemap'te de yok)
  return products.length === 0 ? { ...withTitle, robots: { index: false, follow: true } } : withTitle
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const [collection, products] = await Promise.all([getCollectionRecord(slug), getCollectionProducts(slug)])

  if (!collection) notFound()

  const path = collectionPath(slug)

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Anasayfa", path: "/" },
            { name: collection.name, path },
          ]),
          collectionPageJsonLd({
            name: collection.name,
            description: truncateDescription(collection.metaDescription || collection.description),
            path,
            items: sortListingProducts(products, "new").map((p) => ({ name: p.name, path: p.path, image: p.image })),
          }),
        ]}
      />
      <CollectionPageClient
        collection={{
          name: collection.name,
          description: collection.description,
          image: collection.image,
          video: collection.video,
        }}
        products={products}
      />
    </>
  )
}
