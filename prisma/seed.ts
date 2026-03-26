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
  await prisma.product.createMany({
    data: [
      {
        name: "Basic T-Shirt",
        slug: "basic-tshirt",
        price: 399,
        oldPrice: 499,
        image: "https://picsum.photos/300/300",
        category: "T-Shirt",
        description: "Günlük basic erkek tişört",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Siyah", "Beyaz"],
        stock: 20,
        featured: true,
        isNew: true,
        isActive: true,
        displayOrder: 1,
      },
      {
        name: "Oversize Hoodie",
        slug: "oversize-hoodie",
        price: 799,
        oldPrice: 999,
        image: "https://picsum.photos/300/301",
        category: "Hoodie",
        description: "Oversize hoodie",
        sizes: ["M", "L", "XL"],
        colors: ["Antrasit", "Bej"],
        stock: 15,
        featured: true,
        isNew: true,
        isActive: true,
        displayOrder: 2,
      },
      {
        name: "Slim Fit Gömlek",
        slug: "slim-fit-gomlek",
        price: 649,
        oldPrice: 749,
        image: "https://picsum.photos/300/302",
        category: "Gömlek",
        description: "Slim fit erkek gömlek",
        sizes: ["S", "M", "L"],
        colors: ["Mavi", "Beyaz"],
        stock: 10,
        featured: false,
        isNew: false,
        isActive: true,
        displayOrder: 3,
      },
    ],
    skipDuplicates: true,
  })

  console.log("Seed tamamlandı 🚀")
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