import ProductCard from "./ProductCard"
import { prisma } from "@/lib/prisma"

export default async function ProductGrid() {
  const products = await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
  })

  return (
    <section className="max-w-6xl mx-auto py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          hoverImage={product.hoverImage}
        />
      ))}
    </section>
  )
}