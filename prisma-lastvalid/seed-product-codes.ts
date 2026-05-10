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

function makeCode(id: number) {
  return String(10000000 + id)
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      productCode: true,
    },
  })

  for (const product of products) {
    if (!product.productCode) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          productCode: makeCode(product.id),
        },
      })
    }
  }

  console.log("Product codes hazır")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })