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
  const products = await prisma.product.findMany({
    select: {
      id: true,
      colors: true,
      sizes: true,
    },
  })

  for (const product of products) {
    for (const color of product.colors) {
      for (const size of product.sizes) {
        const exists = await prisma.productVariant.findFirst({
          where: {
            productId: product.id,
            color,
            size,
          },
          select: {
            id: true,
          },
        })

        if (!exists) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              color,
              size,
              stock: 0,
            },
          })
        }
      }
    }
  }

  console.log("Product variants hazır")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })