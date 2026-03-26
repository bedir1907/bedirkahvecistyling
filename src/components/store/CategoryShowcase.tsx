import { prisma } from "@/lib/prisma"
import FeaturedCategorySlider from "@/components/store/FeaturedCategorySlider"

export default async function CategoryShowcase() {
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
     
      <FeaturedCategorySlider categories={categories} />
    </section>
  )
}