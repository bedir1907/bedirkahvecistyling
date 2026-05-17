import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/format"

export default async function AdminDashboardPage() {
  const [
    productCount,
    activeProductCount,
    outOfStockCount,
    categoryCount,
    totalOrders,
    paidOrders,
    lowStockProducts,
    latestOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: 0 } }),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.productVariant.findMany({
      where: { stock: { gt: 0, lte: 3 } },
      orderBy: { stock: "asc" },
      take: 5,
      include: { product: { select: { name: true } } },
    }).catch(() => []),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        name: true,
        totalPrice: true,
        status: true,
        createdAt: true,
      },
    }).catch(() => []),
  ])

  const statusLabel: Record<string, string> = {
    PAID: "Oluşturuldu", APPROVED: "Onaylandı", PENDING: "Bekliyor",
    SHIPPED: "Kargoda", DELIVERED: "Teslim", CANCELLED: "İptal", REFUNDED: "İade",
  }
  const statusColor: Record<string, string> = {
    PAID: "bg-green-100 text-green-700", APPROVED: "bg-indigo-100 text-indigo-700",
    PENDING: "bg-yellow-100 text-yellow-700", SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-100 text-emerald-700", CANCELLED: "bg-gray-100 text-gray-600",
    REFUNDED: "bg-purple-100 text-purple-700",
  }

  const cards = [
    { title: "Aktif Ürün", value: activeProductCount, sub: `${productCount} toplam`, href: "/bksy0net1mp4neli/products", color: "bg-blue-50 text-blue-600" },
    { title: "Tükenen Varyant", value: outOfStockCount, sub: "stok 0", href: "/bksy0net1mp4neli/stock", color: "bg-red-50 text-red-600" },
    { title: "Toplam Sipariş", value: totalOrders, sub: `${paidOrders} ödendi`, href: "/bksy0net1mp4neli/orders", color: "bg-green-50 text-green-600" },
    { title: "Kategori", value: categoryCount, sub: "aktif kategori", href: "/bksy0net1mp4neli/categories", color: "bg-purple-50 text-purple-600" },
  ]

  return (
    <main>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Mağazanın genel durumu</p>
      </div>

      {/* Stat kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="bg-white rounded-2xl border p-4 md:p-5 hover:shadow-md transition">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${card.color} mb-3`}>
              <span className="text-lg font-bold">{card.value}</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{card.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Son siparişler */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Son Siparişler</h2>
            <Link href="/bksy0net1mp4neli/orders" className="text-xs text-gray-500 hover:text-black transition">Tümü →</Link>
          </div>
          {latestOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz sipariş yok.</p>
          ) : (
            <div className="space-y-2">
              {latestOrders.map((order) => (
                <Link key={order.id} href={`/bksy0net1mp4neli/orders/${order.id}`} className="flex items-center justify-between py-2.5 border-b last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(order.totalPrice)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Düşük stok */}
        <div className="bg-white rounded-2xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Düşük Stok Uyarısı</h2>
            <Link href="/bksy0net1mp4neli/stock" className="text-xs text-gray-500 hover:text-black transition">Stok →</Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Düşük stoklu ürün yok. 🎉</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between py-2.5 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{variant.product?.name}</p>
                    <p className="text-xs text-gray-500">Beden: {variant.size}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{variant.stock} adet</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}