import "dotenv/config"
import bcrypt from "bcryptjs"
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
  const passwordHash = await bcrypt.hash("12345678", 10)

  await prisma.adminUser.upsert({
    where: {
      email: "admin@site.com",
    },
    update: {
      name: "Site Sahibi",
      passwordHash,
      role: "CREATOR",
      isActive: true,
      canManageProducts: true,
      canManageStock: true,
      canManageUsers: true,
      canAssignPermissions: true,
      canSell: true,
      canViewOrders: true,
      canViewSensitiveData: true,
    },
    create: {
      name: "Site Sahibi",
      email: "admin@site.com",
      passwordHash,
      role: "CREATOR",
      isActive: true,
      canManageProducts: true,
      canManageStock: true,
      canManageUsers: true,
      canAssignPermissions: true,
      canSell: true,
      canViewOrders: true,
      canViewSensitiveData: true,
    },
  })

  console.log("Admin kullanıcı hazır")
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })