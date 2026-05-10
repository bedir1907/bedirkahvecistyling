import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboardPage() {
  const [productCount, activeProductCount, outOfStockCount, categoryCount, lowStockProducts, latestProducts] =
    await Promise.all([
      prisma.product.count(),
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
      prisma.product.count({
        where: {
          stock: 0,
        },
      }),
      prisma.category.count(),
      prisma.product.findMany({
        where: {
          stock: {
            gt: 0,
            lte: 5,
          },
          isActive: true,
        },
        orderBy: {
          stock: "asc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          stock: true,
        },
      }),
      prisma.product.findMany({
        orderBy: {
          id: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          price: true,
          isActive: true,
        },
      }),
    ])

  const cards = [
    {
      title: "Toplam Ürün",
      value: productCount,
    },
    {
      title: "Aktif Ürün",
      value: activeProductCount,
    },
    {
      title: "Stokta Olmayan",
      value: outOfStockCount,
    },
    {
      title: "Kategori Sayısı",
      value: categoryCount,
    },
  ]

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Mağazanın genel durumunu buradan takip edebilirsin.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-sm border p-6"
          >
            <p className="text-sm text-gray-500 mb-2">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Düşük Stok Uyarısı
            </h2>

            <Link
              href="/admin/products"
              className="text-sm text-gray-600 hover:text-black"
            >
              Ürünlere Git
            </Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">Düşük stoklu ürün yok.</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      Ürün ID: {product.id}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-red-600">
                    {product.stock} adet
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Son Eklenen Ürünler
            </h2>

            <Link
              href="/admin/products"
              className="text-sm text-gray-600 hover:text-black"
            >
              Tümünü Gör
            </Link>
          </div>

          {latestProducts.length === 0 ? (
            <p className="text-gray-500">Henüz ürün yok.</p>
          ) : (
            <div className="space-y-3">
              {latestProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      ₺{product.price}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}