import Link from "next/link"
import { redirect } from "next/navigation"
import { Package, ShoppingBag, ChevronRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { syncOrderRefundFromIyzico } from "@/lib/sync-order-refund"
import {
  getDisplayStatus,
  getStatusClass,
  getStatusLabel,
} from "@/lib/order-status"
import AccountShell from "@/components/account/AccountShell"

export default async function OrdersPage() {
  const customer = await getCustomerUserFromCookie()

  if (!customer) {
    redirect("/giris")
  }

  const rawOrders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      items: {
        orderBy: [{ id: "asc" }],
      },
    },
  })

  const syncableStatuses = new Set(["PAID", "APPROVED", "SHIPPED", "DELIVERED"])

  await Promise.allSettled(
    rawOrders
      .filter((order) => syncableStatuses.has(order.status))
      .slice(0, 10)
      .map((order) => syncOrderRefundFromIyzico(order.id))
  )

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      items: {
        orderBy: [{ id: "asc" }],
      },
    },
  })

  return (
    <AccountShell current="orders">
      <div className="max-w-2xl pb-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
          Siparişler
        </p>
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black">
          Sipariş geçmişin
        </h2>
        <p className="text-sm text-gray-400 mt-3">
          Güncel durumları ve geçmiş siparişlerini buradan takip edebilirsin.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-10 text-center">
          <div className="w-16 h-16 rounded-full border border-black/10 mx-auto flex items-center justify-center mb-5">
            <ShoppingBag size={24} className="text-gray-500" />
          </div>

          <h3 className="text-2xl font-medium text-black">Henüz siparişin yok</h3>

          <p className="text-gray-500 mt-3 max-w-xl mx-auto leading-7">
            İlk siparişini verdiğinde detaylarını ve güncel durumunu burada
            göreceksin.
          </p>

          <Link
            href="/"
            className="inline-flex mt-6 items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium hover:bg-white transition"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                Toplam Sipariş
              </div>
              <div className="text-3xl md:text-4xl font-medium tracking-tight">
                {orders.length}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                Son Sipariş
              </div>
              <div className="text-xl font-medium">
                {new Date(orders[0].createdAt).toLocaleDateString("tr-TR")}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                Toplam Harcama
              </div>
              <div className="text-3xl md:text-4xl font-medium tracking-tight">
                ₺{orders.reduce((sum, order) => sum + order.totalPrice, 0)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {orders.map((order) => {
              const displayStatus = getDisplayStatus(order.status, order.createdAt)
              const totalItems = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              )

              return (
                <Link
                  key={order.id}
                  href={`/siparislerim/${order.id}`}
                  className="group block rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 hover:bg-white hover:border-black/20 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="space-y-4 flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                        <div className="text-xl font-medium break-all">
                          {order.orderNumber}
                        </div>

                        <span
                          className={`inline-flex w-fit px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                            displayStatus
                          )}`}
                        >
                          {getStatusLabel(displayStatus)}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400 mb-1">Tarih</div>
                          <div className="font-medium">
                            {new Date(order.createdAt).toLocaleString("tr-TR")}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400 mb-1">Ürün</div>
                          <div className="font-medium">{totalItems} ürün</div>
                        </div>

                        <div>
                          <div className="text-gray-400 mb-1">Toplam</div>
                          <div className="font-medium">₺{order.totalPrice}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-black/5 px-3 py-2 text-sm"
                          >
                            <Package size={14} />
                            <span>
                              {item.productName}
                              {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                            </span>
                          </div>
                        ))}

                        {order.items.length > 3 && (
                          <div className="inline-flex items-center rounded-2xl bg-white border border-black/5 px-3 py-2 text-sm text-gray-600">
                            +{order.items.length - 3} ürün daha
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-sm text-gray-400 group-hover:text-black transition">
                      <span>Detay</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </AccountShell>
  )
}