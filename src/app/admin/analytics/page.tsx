import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"

export default async function AdminAnalyticsPage() {
  // Prisma'dan gerçek sipariş ve ürün verileri çek
  const [
    totalOrders,
    paidOrders,
    pendingOrders,
    cancelledOrders,
    totalProducts,
    outOfStockVariants,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    // Toplam sipariş sayısı
    prisma.order.count().catch(() => 0),

    // Ödenen siparişler
    prisma.order.count({ where: { status: "PAID" } }).catch(() => 0),

    // Bekleyen siparişler
    prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),

    // İptal edilen siparişler
    prisma.order.count({ where: { status: "CANCELLED" } }).catch(() => 0),

    // Aktif ürün sayısı
    prisma.product.count({ where: { isActive: true } }).catch(() => 0),

    // Stokta olmayan varyantlar
    prisma.productVariant.count({ where: { stock: 0 } }).catch(() => 0),

    // Son 10 sipariş
    prisma.order
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
            id: true,
            orderNumber: true,
            name: true,
            total: true,
            status: true,
            createdAt: true,
          },
      })
      .catch(() => []),

    // En çok satan ürünler (order items üzerinden)
    prisma.orderItem
      .groupBy({
        by: ["productName"],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      })
      .catch(() => []),
  ])

  // Toplam ciro hesapla (sadece PAID siparişler)
  const revenueData = await prisma.order
    .aggregate({ where: { status: "PAID" }, _sum: { total: true } })
    .catch(() => ({ _sum: { total: 0 } }))

  const totalRevenue = revenueData._sum.total ?? 0

  const statusLabel: Record<string, string> = {
    PAID: "Ödendi",
    PENDING: "Bekliyor",
    CANCELLED: "İptal",
    SHIPPED: "Kargoda",
    DELIVERED: "Teslim",
    REFUNDED: "İade",
  }

  const statusColor: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    REFUNDED: "bg-gray-100 text-gray-600",
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analiz</h1>
        <p className="text-gray-600 mt-2">
          Satış, sipariş ve ürün performans verileri.
        </p>
      </div>

      {/* ── Özet kartlar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Toplam Ciro", value: formatPrice(totalRevenue), sub: "Ödenen siparişler" },
          { label: "Toplam Sipariş", value: String(totalOrders), sub: `${paidOrders} ödendi` },
          { label: "Bekleyen Sipariş", value: String(pendingOrders), sub: `${cancelledOrders} iptal` },
          { label: "Aktif Ürün", value: String(totalProducts), sub: `${outOfStockVariants} tükenen varyant` },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border shadow-sm p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Son siparişler ── */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Siparişler</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz sipariş yok.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── En çok satanlar ── */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">En Çok Satanlar</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz satış verisi yok.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, i) => (
                <div key={item.productName} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center shrink-0 font-semibold">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item._sum.quantity} adet</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">
                    {formatPrice(item._sum.price ?? 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
