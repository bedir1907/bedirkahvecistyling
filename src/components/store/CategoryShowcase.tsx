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
      video: true,
    },
  })

  return (
    <section className="py-6 md:py-10">
      <FeaturedCategorySlider categories={categories} />
    </section>
  )
}