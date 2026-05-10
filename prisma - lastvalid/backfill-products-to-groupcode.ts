import { prisma } from "../src/lib/prisma"

async function main() {
  const products = await prisma.product.findMany({
    include: {
      colorGroups: {
        include: {
          variants: true,
        },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      },
    },
    orderBy: [{ id: "asc" }],
  })

  for (const product of products) {
    const defaultGroupCode = `GRP-${String(product.id).padStart(6, "0")}`

    const firstColorGroup = product.colorGroups[0]

    const color =
      product.color?.trim() ||
      firstColorGroup?.colorName?.trim() ||
      (product.colors.length > 0 ? product.colors[0] : "") ||
      "Varsayılan"

    const groupCode =
      product.groupCode?.trim() ||
      defaultGroupCode

    await prisma.product.update({
      where: { id: product.id },
      data: {
        color,
        groupCode,
      },
    })

    const colorGroupIds = product.colorGroups.map((g) => g.id)

    if (colorGroupIds.length > 0) {
      await prisma.productVariant.updateMany({
        where: {
          colorGroupId: {
            in: colorGroupIds,
          },
          productId: null,
        },
        data: {
          productId: product.id,
        },
      })
    }
  }

  console.log("Backfill tamamlandı.")
}

main()
  .catch((error) => {
    console.error("Backfill hatası:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })