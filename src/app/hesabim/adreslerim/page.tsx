import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import AccountShell from "@/components/account/AccountShell"
import AddressManager from "./AddressManager"

export default async function AddressesPage() {
  const customer = await getCustomerUserFromCookie()

  if (!customer) {
    redirect("/giris")
  }

  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: customer.id },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  })

  return (
    <AccountShell current="addresses" emailVerified={customer.emailVerified}>
      <div className="max-w-2xl pb-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
          Adresler
        </p>
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black">
          Teslimat ve fatura bilgileri
        </h2>
        <p className="text-sm text-gray-400 mt-3">
          Adreslerini ekleyebilir, düzenleyebilir ve varsayılan yapabilirsin.
        </p>
      </div>

      <AddressManager initialAddresses={addresses} />
    </AccountShell>
  )
}