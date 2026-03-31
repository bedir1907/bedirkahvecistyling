import { prisma } from "@/lib/prisma"
import { iyzico } from "@/lib/iyzico"

type VerifyOrderPaymentInput = {
  orderNumber?: string
  token?: string
}

function isSuccessResult(result: any) {
  return (
    result?.paymentStatus === "SUCCESS" ||
    result?.status === "success"
  )
}

function isFailureResult(result: any) {
  return (
    result?.paymentStatus === "FAILURE" ||
    result?.status === "failure"
  )
}

async function retrieveCheckoutForm(token: string) {
  return await new Promise<any>((resolve, reject) => {
    iyzico.checkoutForm.retrieve(
      {
        locale: "TR",
        token,
      },
      (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res)
      }
    )
  })
}

async function finalizePaidOrder(orderId: number, result: any) {
  return await prisma.$transaction(async (tx) => {
    const freshOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!freshOrder) {
      throw new Error("Sipariş bulunamadı")
    }

    if (freshOrder.status === "PAID") {
      return {
        order: freshOrder,
        justPaidNow: false,
      }
    }

    if (
      freshOrder.status === "CANCELLED" ||
      freshOrder.status === "REFUNDED"
    ) {
      throw new Error("Bu sipariş terminal durumda olduğu için tekrar işlenemez")
    }

    for (const item of freshOrder.items) {
      const variant = await tx.productVariant.findFirst({
        where: {
          productId: item.productId,
          size: item.size || undefined,
        },
        select: {
          id: true,
          stock: true,
        },
      })

      if (!variant || variant.stock < item.quantity) {
        throw new Error(`${item.productName} için stok yetersiz`)
      }

      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    const updatedOrder = await tx.order.update({
      where: { id: freshOrder.id },
      data: {
        status: "PAID",
        paidAt: freshOrder.paidAt || new Date(),
        paymentId: result?.paymentId ? String(result.paymentId) : freshOrder.paymentId,
        paymentTransactionId:
          result?.itemTransactions?.[0]?.paymentTransactionId
            ? String(result.itemTransactions[0].paymentTransactionId)
            : freshOrder.paymentTransactionId,
      },
      include: {
        items: true,
      },
    })

    return {
      order: updatedOrder,
      justPaidNow: true,
    }
  })
}

async function markFailedIfPending(orderId: number) {
  const freshOrder = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!freshOrder) return null

  if (freshOrder.status !== "PENDING") {
    return freshOrder
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "FAILED",
    },
  })
}

export async function verifyOrderPayment(input: VerifyOrderPaymentInput) {
  const order = await prisma.order.findFirst({
    where: input.orderNumber
      ? { orderNumber: input.orderNumber }
      : { paymentToken: input.token },
    include: {
      items: true,
    },
  })

  if (!order) {
    return {
      ok: false,
      state: "NOT_FOUND" as const,
      message: "Sipariş bulunamadı",
      justPaidNow: false,
    }
  }

  if (!order.paymentToken) {
    return {
      ok: false,
      state: "NO_TOKEN" as const,
      orderNumber: order.orderNumber,
      message: "Sipariş için ödeme tokenı bulunamadı",
      justPaidNow: false,
    }
  }

  if (order.status === "PAID") {
    return {
      ok: true,
      state: "PAID" as const,
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: "Sipariş zaten ödenmiş",
      justPaidNow: false,
    }
  }

  if (order.status === "CANCELLED") {
    return {
      ok: false,
      state: "CANCELLED" as const,
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: "Sipariş iptal edilmiş",
      justPaidNow: false,
    }
  }

  if (order.status === "REFUNDED") {
    return {
      ok: false,
      state: "REFUNDED" as const,
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: "Sipariş iade edilmiş",
      justPaidNow: false,
    }
  }

  const result = await retrieveCheckoutForm(order.paymentToken)

  if (isSuccessResult(result)) {
    const finalized = await finalizePaidOrder(order.id, result)

    return {
      ok: true,
      state: "PAID" as const,
      orderNumber: finalized.order.orderNumber,
      orderId: finalized.order.id,
      message: finalized.justPaidNow
        ? "Ödeme doğrulandı"
        : "Sipariş zaten ödenmiş",
      justPaidNow: finalized.justPaidNow,
    }
  }

  if (isFailureResult(result)) {
    await markFailedIfPending(order.id)

    return {
      ok: false,
      state: "FAILED" as const,
      orderNumber: order.orderNumber,
      orderId: order.id,
      message: result?.errorMessage || "Ödeme başarısız",
      justPaidNow: false,
    }
  }

  return {
    ok: false,
    state: "PENDING" as const,
    orderNumber: order.orderNumber,
    orderId: order.id,
    message: "Ödeme henüz kesinleşmedi",
    justPaidNow: false,
  }
}