import { redirect } from "next/navigation"
import { getCustomerUserFromCookie } from "@/lib/customer-auth"
import AccountShell from "@/components/account/AccountShell"
import SettingsForms from "./SettingsForms"

export default async function SettingsPage() {
  const customer = await getCustomerUserFromCookie()

  if (!customer) {
    redirect("/giris")
  }

  return (
    <AccountShell current="settings">
      <div className="max-w-2xl pb-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
          Hesap
        </p>
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-black">
          Profil ve güvenlik
        </h2>
        <p className="text-sm text-gray-400 mt-3">
          Profil bilgilerini ve şifreni güncelleyebilirsin.
        </p>
      </div>

      <SettingsForms customer={customer} />
    </AccountShell>
  )
}