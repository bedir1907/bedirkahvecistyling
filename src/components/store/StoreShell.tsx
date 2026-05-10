"use client"

import { usePathname } from "next/navigation"
import StoreNavbar from "@/components/store/StoreNavbar"
import CookieBanner from "@/components/store/CookieBanner"
import WhatsappFloat from "@/components/store/WhatsappFloat"

export default function StoreShell() {
  const pathname = usePathname()

  // Admin sayfalarında store bileşenlerini gösterme
  if (pathname.startsWith("/admin")) return null

  return (
    <>
      <StoreNavbar />
      <CookieBanner />
      <WhatsappFloat />
    </>
  )
}