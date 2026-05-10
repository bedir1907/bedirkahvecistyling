import ProductCard from "@/components/ProductCard"
import SectionHeader from "@/components/store/SectionHeader"
import HorizontalSlider from "@/components/store/HorizontalSlider"
import { prisma } from "@/lib/prisma"

type Props = {
  title: string
  eyebrow?: string
  featuredOnly?: boolean
  newOnly?: boolean
}

type SiblingColorItem = {
  id: number
  color: string | null
  image: string
}

function getSectionDescription(featuredOnly: boolean, newOnly: boolean) {
  if (featuredOnly) {
    return "Öne çıkan ürünleri keşfet."
  }

  if (newOnly) {
    return "Yeni sezona eklenen parçaları incele."
  }

  return "Sezonun öne çıkan parçalarını keşfet."
}

export default async function ProductSection({
  title,
  eyebrow,
  featuredOnly = false,
  newOnly = false,
}: Props) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(featuredOnly ? { featured: true } : {}),
      ...(newOnly ? { isNew: true } : {}),
    },
    orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
    take: 12,
    include: {
      images: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 2,
      },
    },
  })

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
          groupCode: {
            in: groupCodes,
          },
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

    current.push({
      id: sibling.id,
      color: sibling.color,
      image: sibling.image,
    })

    siblingMap.set(key, current)
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={getSectionDescription(featuredOnly, newOnly)}
      />

      <HorizontalSlider>
        {products.map((product) => {
          const productColors =
            product.groupCode && siblingMap.has(product.groupCode)
              ? siblingMap.get(product.groupCode) || []
              : []

          return (
            <div
              key={product.id}
              data-slider-item="true"
              className="w-[280px] shrink-0"
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                oldPrice={product.oldPrice}
                image={product.images?.[0]?.url || product.image}
                //hoverImage={product.images?.[1]?.url || null}
                href={`/product/${product.id}`}
                colorName={product.color || ""}
                category={product.category}
                colors={productColors}
              />
            </div>
          )
        })}
      </HorizontalSlider>
    </section>
  )
}