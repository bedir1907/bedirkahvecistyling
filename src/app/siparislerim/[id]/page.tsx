import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import { syncOrderRefundFromIyzico } from "@/lib/sync-order-refund"
import {
  getDisplayStatus,
  getStatusClass,
  getStatusLabel,
} from "@/lib/order-status"
import AccountShell from "@/components/account/AccountShell"

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function OrderDetailPage({ params }: Props) {
  const customer = await getCustomerUserFromCookie()

  if (!customer) {
    redirect("/giris")
  }

  const { id } = await params
  const orderId = Number(id)

  if (!Number.isFinite(orderId)) {
    notFound()
  }

  const firstOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
    include: {
      items: {
        orderBy: [{ id: "asc" }],
      },
    },
  })

  if (!firstOrder) {
    notFound()
  }

  if (["PAID", "APPROVED", "SHIPPED", "DELIVERED"].includes(firstOrder.status)) {
    await syncOrderRefundFromIyzico(firstOrder.id)
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
    include: {
      items: {
        orderBy: [{ id: "asc" }],
      },
    },
  })

  if (!order) {
    notFound()
  }

  const displayStatus = getDisplayStatus(order.status, order.createdAt)

  return (
    <AccountShell current="orders">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Sipariş Detayı
          </p>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black break-all">
            {order.orderNumber}
          </h2>
        </div>

        <span
          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
            displayStatus
          )}`}
        >
          {getStatusLabel(displayStatus)}
        </span>
      </div>

      <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-8">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Tarih</div>
            <div className="font-medium">
              {new Date(order.createdAt).toLocaleString("tr-TR")}
            </div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Toplam</div>
            <div className="font-medium">₺{order.totalPrice}</div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Ürün Sayısı</div>
            <div className="font-medium">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-8">
        <h3 className="text-xl font-medium mb-6">Ürünler</h3>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-black/10 bg-white p-4 flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-medium">{item.productName}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Renk: {item.color || "-"} • Beden: {item.size || "-"}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {item.quantity} adet × ₺{item.price}
                </div>
              </div>

              <div className="font-medium">₺{item.price * item.quantity}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-8">
        <h3 className="text-xl font-medium mb-6">Teslimat Bilgileri</h3>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Ad Soyad</div>
            <div className="font-medium">{order.name}</div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Telefon</div>
            <div className="font-medium">{order.phone}</div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">Şehir / İlçe</div>
            <div className="font-medium">
              {order.city} / {order.district}
            </div>
          </div>

          <div>
            <div className="text-gray-400 mb-1">E-posta</div>
            <div className="font-medium">{order.email}</div>
          </div>

          <div className="md:col-span-2">
            <div className="text-gray-400 mb-1">Adres</div>
            <div className="font-medium whitespace-pre-line">{order.address}</div>
          </div>

          {order.note ? (
            <div className="md:col-span-2">
              <div className="text-gray-400 mb-1">Sipariş Notu</div>
              <div className="font-medium whitespace-pre-line">{order.note}</div>
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <Link href="/siparislerim" className="text-sm text-gray-500 hover:text-black transition">
            ← Siparişlerime dön
          </Link>
        </div>
      </div>
    </AccountShell>
  )
}