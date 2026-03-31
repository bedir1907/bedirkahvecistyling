import Link from "next/link"
import { redirect } from "next/navigation"
import { Package, MapPin, UserCircle, ChevronRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import AccountShell from "@/components/account/AccountShell"

export default async function AccountPage() {
  const customer = await getCustomerUserFromCookie()

  if (!customer) {
    redirect("/giris")
  }

  const orderCount = await prisma.order.count({
    where: {
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
  })

  return (
    <AccountShell current="account">
      <div className="max-w-2xl pb-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
          Hesap Bilgileri
        </p>

        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black break-all">
          {customer.email}
        </h2>

        <p className="text-sm text-gray-400 mt-3">
          {customer.phone || "Telefon eklenmemiş"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 pt-2">
        <Link
          href="/siparislerim"
          className="group rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 hover:border-black/20 hover:bg-white transition"
        >
          <div className="flex items-start justify-between mb-10">
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
              <Package size={17} />
            </div>
            <ChevronRight
              size={16}
              className="text-gray-400 group-hover:text-black transition"
            />
          </div>

          <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Siparişler
          </div>

          <div className="text-3xl md:text-4xl font-medium tracking-tight text-black">
            {orderCount}
          </div>

          <div className="text-base text-gray-700 mt-2">sipariş</div>
        </Link>

        <Link
          href="/hesabim/adreslerim"
          className="group rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 hover:border-black/20 hover:bg-white transition"
        >
          <div className="flex items-start justify-between mb-10">
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
              <MapPin size={17} />
            </div>
            <ChevronRight
              size={16}
              className="text-gray-400 group-hover:text-black transition"
            />
          </div>

          <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Adresler
          </div>

          <div className="text-3xl md:text-4xl font-medium tracking-tight text-black">
            Yönet
          </div>

          <div className="text-base text-gray-700 mt-2">
            Teslimat ve fatura bilgileri
          </div>
        </Link>

        <Link
          href="/hesabim/ayarlar"
          className="group rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 hover:border-black/20 hover:bg-white transition"
        >
          <div className="flex items-start justify-between mb-10">
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
              <UserCircle size={17} />
            </div>
            <ChevronRight
              size={16}
              className="text-gray-400 group-hover:text-black transition"
            />
          </div>

          <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Hesap
          </div>

          <div className="text-3xl md:text-4xl font-medium tracking-tight text-black">
            Düzenle
          </div>

          <div className="text-base text-gray-700 mt-2">
            Profil ve hesap ayarları
          </div>
        </Link>
      </div>

      <div className="pt-2">
        <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
            Müşteri Durumu
          </div>

          <div className="text-2xl font-medium text-black">Aktif hesap</div>

          <p className="text-gray-500 mt-3 max-w-2xl leading-7">
            Sipariş verebilir, hesap bilgilerini görüntüleyebilir ve sipariş
            geçmişini takip edebilirsin.
          </p>
        </div>
      </div>
    </AccountShell>
  )
}