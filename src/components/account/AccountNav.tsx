"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Settings } from "lucide-react"

const links = [
  {
    href: "/hesabim",
    label: "Hesabım",
    icon: User,
  },
  {
    href: "/siparislerim",
    label: "Siparişlerim",
    icon: Package,
  },
  {
    href: "/hesabim/adreslerim",
    label: "Adreslerim",
    icon: MapPin,
  },
  {
    href: "/hesabim/ayarlar",
    label: "Hesap Ayarları",
    icon: Settings,
  },
]

export default function AccountNav() {
  const pathname = usePathname()

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between rounded-2xl px-4 py-4 transition ${
                isActive
                  ? "bg-black text-white"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-medium">{link.label}</span>
              </div>

              <span className={isActive ? "text-white/70" : "text-gray-400"}>
                →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}