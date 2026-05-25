import { prisma } from "@/lib/prisma"
import ProductSpotlightSlider from "@/components/store/ProductSpotlightSlider"
import Link from "next/link"

type Props = {
  title: string
  viewAllHref: string
  featured?: boolean
  isNew?: boolean
  discounted?: boolean
}

export default async function ProductSpotlight({ title, viewAllHref, featured, isNew, discounted }: Props) {
  const raw = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(featured ? { featured: true } : {}),
      ...(isNew ? { isNew: true } : {}),
      ...(discounted ? { oldPrice: { not: null } } : {}),
    },
    orderBy: [{ displayOrder: "asc" }, { id: "desc" }],
    take: 12,
    select: {
      id: true,
      name: true,
      price: true,
      oldPrice: true,
      image: true,
      category: true,
      images: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 1,
        select: { url: true },
      },
    },
  })

  if (raw.length === 0) return null

  const products = raw.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
    image: p.images[0]?.url || p.image,
    category: p.category,
    href: `/product/${p.id}`,
  }))

  return (
    <section className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 mb-6 flex items-end justify-between gap-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-black/60 hover:text-black transition border-b border-black/20 hover:border-black pb-0.5 whitespace-nowrap"
        >
          Tümünü Gör →
        </Link>
      </div>
      <ProductSpotlightSlider products={products} />
    </section>
  )
}
