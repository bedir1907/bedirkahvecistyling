"use client"

import { usePathname } from "next/navigation"
import StoreNavbar from "@/components/store/StoreNavbar"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import CookieBanner from "@/components/store/CookieBanner"
import WhatsappFloat from "@/components/store/WhatsappFloat"

export default function StoreShell() {
  const pathname = usePathname()

  if (pathname.startsWith("/bksy0net1mp4neli")) return null

  return (
    <>
      <AnnouncementBar />
      <StoreNavbar />
      <CookieBanner />
      <WhatsappFloat />
    </>
  )
}