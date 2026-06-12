import SectionHeader from "@/components/store/SectionHeader"
import ProductSlider, { type SliderProduct } from "@/components/store/ProductSlider"
import { prisma } from "@/lib/prisma"

type Props = {
  title: string
  eyebrow?: string
  featuredOnly?: boolean
  newOnly?: boolean
  weeklyMode?: boolean
  viewAllHref?: string
}

type SiblingColorItem = {
  id: number
  color: string | null
  image: string
}

function getSectionDescription(featuredOnly: boolean, newOnly: boolean, weeklyMode: boolean) {
  if (weeklyMode) return "Bu hafta eklenen yeni parçaları keşfet."
  if (featuredOnly) return "Öne çıkan ürünleri keşfet."
  if (newOnly) return "Yeni sezona eklenen parçaları incele."
  return "Sezonun öne çıkan parçalarını keşfet."
}

const imageInclude = {
  images: {
    orderBy: [{ isCover: "desc" as const }, { sortOrder: "asc" as const }],
    take: 2,
  },
}

export default async function ProductSection({
  title,
  eyebrow,
  featuredOnly = false,
  newOnly = false,
  weeklyMode = false,
  viewAllHref,
}: Props) {
  let products

  if (weeklyMode) {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyProducts = await prisma.product.findMany({
      where: { isActive: true, createdAt: { gte: oneWeekAgo } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: imageInclude,
    })

    if (weeklyProducts.length >= 20) {
      products = weeklyProducts
    } else {
      const weeklyIds = weeklyProducts.map((p) => p.id)
      const needed = 20 - weeklyProducts.length
      const olderProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          id: weeklyIds.length > 0 ? { notIn: weeklyIds } : undefined,
          createdAt: { lt: oneWeekAgo },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: needed,
        include: imageInclude,
      })
      products = [...weeklyProducts, ...olderProducts]
    }
  } else {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(featuredOnly ? { featured: true } : {}),
        ...(newOnly ? { isNew: true } : {}),
      },
      orderBy: newOnly
        ? [{ createdAt: "desc" }, { id: "desc" }]
        : [{ displayOrder: "asc" }, { id: "desc" }],
      take: newOnly ? 30 : 12,
      include: imageInclude,
    })
  }

  const groupCodes = Array.from(
    new Set(
      products
        .map((product) => product.groupCode)
        .filter(
          (groupCode): groupCode is string =>
            typeof groupCode === "string" && groupCode.trim().length > 0
        )
    )
  )

  const siblingProducts = groupCodes.length
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          groupCode: { in: groupCodes },
        },
        select: {
          id: true,
          groupCode: true,
          color: true,
          image: true,
        },
        orderBy: [{ color: "asc" }, { id: "asc" }],
      })
    : []

  const siblingMap = new Map<string, SiblingColorItem[]>()
  for (const sibling of siblingProducts) {
    const key = sibling.groupCode?.trim()
    if (!key) continue
    const current = siblingMap.get(key) || []
    current.push({ id: sibling.id, color: sibling.color, image: sibling.image })
    siblingMap.set(key, current)
  }

  if (products.length === 0) return null

  const productIds = products.map((p) => p.id)
  const discountCollections = await prisma.collection.findMany({
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
  })

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
        eyebrow={eyebrow}
        title={title}
        description={getSectionDescription(featuredOnly, newOnly, weeklyMode)}
        href={viewAllHref}
      />

      <ProductSlider
        products={products.map((product): SliderProduct => {
          const colors =
            product.groupCode && siblingMap.has(product.groupCode)
              ? siblingMap.get(product.groupCode) || []
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
