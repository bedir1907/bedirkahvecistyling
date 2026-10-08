import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import JsonLd from "@/components/seo/JsonLd"
import ProductCard from "@/components/ProductCard"
import {
  absoluteUrl,
  breadcrumbJsonLd,
  categoryPath,
  customTitle,
  productPath,
  SITE_LOCALE,
  SITE_NAME,
  truncateDescription,
} from "@/lib/seo"
import {
  buildAutoDescription,
  getRelatedProducts,
  getShippingSettings,
  lookupProduct,
  productMetaDescription,
  productSeoName,
  type ProductPageData,
} from "@/lib/product-page"
import { normalizeCaps } from "@/lib/text"
import ProductPageClient from "./ProductPageClient"

export const revalidate = 60

// Ürün sayfaları build'de değil ilk istekte üretilir ve ISR ile önbelleğe alınır.
export async function generateStaticParams() {
  return []
}

type Props = {
  params: Promise<{ slug: string }>
}

function productImageUrls(product: ProductPageData["product"]) {
  const urls = [product.image, ...product.images.map((img) => img.url)]
    .filter((url): url is string => Boolean(url && url.trim()))
    .map((url) => absoluteUrl(url))
  return [...new Set(urls)]
}

async function resolve(slug: string) {
  const result = await lookupProduct(slug)
  if (result.kind === "redirect") permanentRedirect(productPath(result.slug))
  if (result.kind === "notFound") notFound()
  return result.data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await lookupProduct(slug)

  // Yönlendirme metadata aşamasında da yapılır: botlara (metadata stream edilmeden) gerçek 308 döner.
  if (result.kind === "redirect") permanentRedirect(productPath(result.slug))
  if (result.kind !== "found") {
    return { title: "Ürün Bulunamadı", robots: { index: false, follow: true } }
  }

  const data = result.data
  const { product } = data
  const seoName = productSeoName(product)
  // Marka ekiyle 60 karakteri aşan başlıklar Google'da kesilir → uzun ürün adlarında marka eki düşülür
  const title = data.metaTitle
    ? customTitle(data.metaTitle)
    : `${seoName} | ${SITE_NAME}`.length > 60 ? { absolute: seoName } : seoName
  const socialTitle = data.metaTitle || seoName
  const description = productMetaDescription(data, buildAutoDescription(product))
  const url = absoluteUrl(productPath(product.slug))
  const images = productImageUrls(product).slice(0, 4)
  const totalStock = product.productVariants.length > 0
    ? product.productVariants.reduce((sum, v) => sum + Math.max(0, v.stock), 0)
    : data.stock

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title: socialTitle,
      description,
      images: images.map((src) => ({ url: src, alt: seoName })),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images,
    },
    other: {
      "product:brand": SITE_NAME,
      "product:availability": totalStock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:price:amount": String(product.price),
      "product:price:currency": "TRY",
      "product:retailer_item_id": product.productCode,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const data = await resolve(slug)
  const { product } = data

  const [shipping, related] = await Promise.all([
    getShippingSettings(),
    getRelatedProducts(product.id, product.category, product.groupCode),
  ])

  const url = absoluteUrl(productPath(product.slug))
  const seoName = productSeoName(product)
  const autoDescription = buildAutoDescription(product)
  const shippingFee = shipping && (shipping.freeAbove == null || product.price < shipping.freeAbove) ? shipping.fee : 0

  const totalStock = product.productVariants.length > 0
    ? product.productVariants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0)
    : data.stock

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: seoName,
    description: truncateDescription(product.description, 5000) || autoDescription,
    image: productImageUrls(product),
    url,
    sku: product.productCode,
    mpn: product.productCode,
    category: normalizeCaps(product.category),
    ...(product.color ? { color: normalizeCaps(product.color) } : {}),
    ...(product.groupCode ? { inProductGroupWithID: product.groupCode } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
      ...(product.oldPrice && product.oldPrice > product.price
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              priceType: "https://schema.org/StrikethroughPrice",
              price: product.oldPrice,
              priceCurrency: "TRY",
            },
          }
        : {}),
      ...(shipping
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: shippingFee, currency: "TRY" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
                transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
              },
            },
          }
        : {}),
      // Teslimat: /kargo-ve-teslimat (3–7 iş günü). İade: /iade-ve-degisim — teslimden itibaren 14 gün, iade kargo bedeli alıcıya ait.
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
    },
  }

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Anasayfa", path: "/" },
    ...(product.categorySlug ? [{ name: normalizeCaps(product.category), path: categoryPath(product.categorySlug) }] : []),
    { name: seoName, path: productPath(product.slug) },
  ])

  const relatedSection =
    related.length > 0 ? (
      <section className="max-w-7xl mx-auto px-4 pb-16" aria-labelledby="related-products-title">
        <h2 id="related-products-title" className="text-xl font-semibold mb-6 tracking-tight">
          Benzer Ürünler
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {related.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              name={item.name}
              price={item.price}
              oldPrice={item.oldPrice}
              image={item.image}
              colorName={item.color}
            />
          ))}
        </div>
      </section>
    ) : null

  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbs]} />
      <ProductPageClient
        key={product.id}
        initialProduct={product}
        collectionDiscount={data.collectionDiscount}
        autoDescription={autoDescription}
        imageAlt={seoName}
        related={relatedSection}
      />
    </>
  )
}
