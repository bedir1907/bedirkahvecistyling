import type { Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

type StockItem = {
  productId: number
  productName: string
  size: string | null
  quantity: number
}

/** Ödemesi alınmış (stoğu düşülmüş) sipariş durumları */
export const PAID_ORDER_STATUSES = ["PAID", "APPROVED", "SHIPPED", "DELIVERED"] as const

export function isPaidStatus(status: string) {
  return (PAID_ORDER_STATUSES as readonly string[]).includes(status)
}

async function findVariantId(tx: Tx, item: StockItem) {
  const variant = await tx.productVariant.findFirst({
    where: {
      productId: item.productId,
      ...(item.size ? { size: item.size } : {}),
    },
    orderBy: { id: "asc" },
    select: { id: true },
  })

  return variant?.id ?? null
}

/**
 * Stok düşümü. Stok asla negatife düşmez: yeterli stok yoksa kalan stok sıfırlanır
 * ve eksik kalemler geri döndürülür (ödeme alınmış olduğu için sipariş iptal edilmez,
 * admin'in manuel kontrol etmesi gerekir).
 */
export async function decrementStockForItems(tx: Tx, items: StockItem[]) {
  const shortages: string[] = []

  for (const item of items) {
    const variantId = await findVariantId(tx, item)

    if (!variantId) {
      shortages.push(`${item.productName}${item.size ? ` (${item.size})` : ""}: varyant bulunamadı`)
      continue
    }

    const updated = await tx.productVariant.updateMany({
      where: { id: variantId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    })

    if (updated.count === 0) {
      await tx.productVariant.updateMany({
        where: { id: variantId, stock: { gt: 0 } },
        data: { stock: 0 },
      })
      shortages.push(
        `${item.productName}${item.size ? ` (${item.size})` : ""}: ${item.quantity} adet için stok yetersiz`
      )
    }
  }

  return shortages
}

/**
 * Siparişin stoğunu tam olarak bir kez geri yükler (stockRestored bayrağı ile kilitlenir).
 * Yalnızca stoğu daha önce düşülmüş (ödenmiş) siparişler için çağrılmalıdır.
 */
export async function restoreStockOnce(tx: Tx, orderId: number, items: StockItem[]) {
  const claimed = await tx.order.updateMany({
    where: { id: orderId, stockRestored: false },
    data: { stockRestored: true },
  })

  if (claimed.count === 0) return false

  for (const item of items) {
    const variantId = await findVariantId(tx, item)
    if (!variantId) continue

    await tx.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: item.quantity } },
    })
  }

  return true
}
