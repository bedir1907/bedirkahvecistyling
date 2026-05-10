import { prisma } from "@/lib/prisma"
import FeaturedCategorySlider from "@/components/store/FeaturedCategorySlider"

type Props = {
  title?: string
}

export default async function CategoryShowcase({ title }: Props) {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      isFeatured: true,
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
  })

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      {title ? (
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-gray-500 mt-2">
            Vitrine alınan kategorileri keşfet.
          </p>
        </div>
      ) : null}

      <FeaturedCategorySlider categories={categories} />
    </section>
  )
}