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
    for (let colorIndex = 0; colorIndex < product.colors.length; colorIndex++) {
      const color = product.colors[colorIndex]

      let colorGroup = await prisma.productColorGroup.findFirst({
        where: {
          productId: product.id,
          colorName: color,
        },
      })

      if (!colorGroup) {
        colorGroup = await prisma.productColorGroup.create({
          data: {
            productId: product.id,
            colorName: color,
            sizeType: "letter",
            sortOrder: colorIndex,
            isActive: true,
          },
        })
      }

      for (const size of product.sizes) {
        const existingVariant = await prisma.productVariant.findFirst({
          where: {
            colorGroupId: colorGroup.id,
            size,
          },
        })

        if (!existingVariant) {
          await prisma.productVariant.create({
            data: {
              colorGroupId: colorGroup.id,
              size,
              stock: 0,
            },
          })
        }
      }
    }
  }

  console.log("Color groups ve variants hazır")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })