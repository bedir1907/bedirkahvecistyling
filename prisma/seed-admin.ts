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
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD tanimli degil")
  }

  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL tanimli degil")
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.adminUser.upsert({
    where: {
      email: adminEmail,
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
      email: adminEmail,
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
