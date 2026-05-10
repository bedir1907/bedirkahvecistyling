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
  const categories = [
    {
      name: "T-Shirt",
      slug: "t-shirt",
      image: "",
      isFeatured: true,
      isActive: true,
      displayOrder: 1,
    },
    {
      name: "Hoodie",
      slug: "hoodie",
      image: "",
      isFeatured: true,
      isActive: true,
      displayOrder: 2,
    },
    {
      name: "Gömlek",
      slug: "gomlek",
      image: "",
      isFeatured: true,
      isActive: true,
      displayOrder: 3,
    },
    {
      name: "Pantolon",
      slug: "pantolon",
      image: "",
      isFeatured: true,
      isActive: true,
      displayOrder: 4,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        image: category.image,
        isFeatured: category.isFeatured,
        isActive: category.isActive,
        displayOrder: category.displayOrder,
      },
      create: category,
    })
  }

  console.log("Kategoriler hazır")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })