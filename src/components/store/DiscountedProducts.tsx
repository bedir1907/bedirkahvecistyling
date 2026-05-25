import SectionHeader from "@/components/store/SectionHeader"
import ProductSlider, { type SliderProduct } from "@/components/store/ProductSlider"
import { prisma } from "@/lib/prisma"

type Props = {
  title?: string
  viewAllHref?: string
}

type SiblingColorItem = {
  id: number
  color: string | null
  image: string
}

export default async function DiscountedProducts({ title = "İndirimdekiler", viewAllHref }: Props) {
  const rawProducts = await prisma.product.findMany({
    where: { isActive: true, oldPrice: { not: null } },
    orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
    take: 12,
    include: {
      images: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 2,
      },
    },
  })

  const products = rawProducts.filter(
    (p) => p.oldPrice !== null && p.oldPrice > p.price
  )

  if (products.length === 0) return null

  const productIds = products.map((p) => p.id)

  const groupCodes = Array.from(
    new Set(
      products
        .map((p) => p.groupCode)
        .filter((gc): gc is string => typeof gc === "string" && gc.trim().length > 0)
    )
  )

  const [siblingProducts, discountCollections] = await Promise.all([
    groupCodes.length
      ? prisma.product.findMany({
          where: { isActive: true, groupCode: { in: groupCodes } },
          select: { id: true, groupCode: true, color: true, image: true },
          orderBy: [{ color: "asc" }, { id: "asc" }],
        })
      : Promise.resolve([]),
    prisma.collection.findMany({
      where: {
        isActive: true,
        discount: { not: null },
        products: { some: { productId: { in: productIds } } },
      },
      select: {
        discount: true,
        products: {
          where: { productId: { in: productIds } },
          select: { productId: true },
        },
      },
    }),
  ])

  const siblingMap = new Map<string, SiblingColorItem[]>()
  for (const sibling of siblingProducts) {
    const key = sibling.groupCode?.trim()
    if (!key) continue
    const arr = siblingMap.get(key) ?? []
    arr.push({ id: sibling.id, color: sibling.color, image: sibling.image })
    siblingMap.set(key, arr)
  }

  const discountMap = new Map<number, number>()
  for (const col of discountCollections) {
    const d = col.discount ?? 0
    for (const cp of col.products) {
      const current = discountMap.get(cp.productId) ?? 0
      if (d > current) discountMap.set(cp.productId, d)
    }
  }

  return (
    <section className="py-10 md:py-16">
      <SectionHeader
        title={title}
        description="Fiyat avantajı sunan seçili ürünleri keşfet."
        href={viewAllHref}
      />
      <ProductSlider
        products={products.map((product): SliderProduct => {
          const colors =
            product.groupCode && siblingMap.has(product.groupCode)
              ? siblingMap.get(product.groupCode) ?? []
              : []
          return {
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            image: product.images?.[0]?.url || product.image,
            colorName: product.color || "",
            category: product.category,
            href: `/product/${product.id}`,
            colors,
            collectionDiscount: discountMap.get(product.id) ?? null,
          }
        })}
      />
    </section>
  )
}
