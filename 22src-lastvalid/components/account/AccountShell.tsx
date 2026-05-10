import Link from "next/link"
import { ChevronRight, LayoutGrid, MapPin, Package, Settings } from "lucide-react"
import AccountLogoutButton from "@/components/account/AccountLogoutButton"
import ResendVerificationButton from "@/components/account/ResendVerificationButton"

type AccountShellProps = {
  current: "account" | "orders" | "addresses" | "settings"
  children: React.ReactNode
  emailVerified?: boolean
}

const navItems = [
  {
    key: "account",
    href: "/hesabim",
    label: "Genel Bakış",
    icon: LayoutGrid,
  },
  {
    key: "orders",
    href: "/siparislerim",
    label: "Siparişlerim",
    icon: Package,
  },
  {
    key: "addresses",
    href: "/hesabim/adreslerim",
    label: "Adreslerim",
    icon: MapPin,
  },
  {
    key: "settings",
    href: "/hesabim/ayarlar",
    label: "Ayarlar",
    icon: Settings,
  },
] as const

export default function AccountShell({
  current,
  children,
  emailVerified,
}: AccountShellProps) {
  return (
    <main className="min-h-screen bg-white text-[#111]">
      <section className="max-w-6xl mx-auto px-4 py-10">
        {emailVerified === false && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-amber-900">
                E-posta adresin henüz doğrulanmadı
              </div>
              <div className="text-sm text-amber-800 mt-1">
                Hesabını daha güvenli hale getirmek için doğrulama mailini tekrar gönderebilirsin.
              </div>
            </div>

            <ResendVerificationButton />
          </div>
        )}

        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          <aside className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.key === current

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-3 text-sm transition ${
                    isActive
                      ? "text-black font-medium"
                      : "text-gray-400 hover:text-black"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>

                  <ChevronRight size={14} />
                </Link>
              )
            })}

            <div className="pt-4 mt-4 border-t border-black/10">
              <AccountLogoutButton />
            </div>
          </aside>

          <div className="space-y-8">{children}</div>
        </div>
      </section>
    </main>
  )
}