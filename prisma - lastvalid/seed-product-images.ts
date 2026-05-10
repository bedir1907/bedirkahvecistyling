import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL tanımlı değil")
}

const pool = new Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const products = await prisma.product.findMany()

  for (const product of products) {
    const existingImages = await prisma.productImage.findMany({
      where: {
        productId: product.id,
      },
    })

    if (existingImages.length > 0) continue

    await prisma.productImage.createMany({
      data: [
        {
          productId: product.id,
          url: product.image,
          alt: product.name,
          sortOrder: 0,
          isCover: true,
        },
        {
          productId: product.id,
          url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80&auto=format&fit=crop",
          alt: `${product.name} 2`,
          sortOrder: 1,
          isCover: false,
        },
        {
          productId: product.id,
          url: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1200&q=80&auto=format&fit=crop",
          alt: `${product.name} 3`,
          sortOrder: 2,
          isCover: false,
        },
      ],
    })
  }

  console.log("Product image seed tamam ✅")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })