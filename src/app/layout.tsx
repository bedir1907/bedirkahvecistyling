import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import StoreNavbar from "@/components/store/StoreNavbar"
import CookieBanner from "@/components/store/CookieBanner"
import WhatsappFloat from "@/components/store/WhatsappFloat"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://e-ticaret.com"
  ),
  title: {
    default: "E-TİCARET — Modern Giyim",
    template: "%s | E-TİCARET",
  },
  description:
    "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi. Ücretsiz kargo, kolay iade.",
  keywords: ["erkek giyim", "e-ticaret", "online alışveriş", "moda", "giyim"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "E-TİCARET",
    title: "E-TİCARET — Modern Giyim",
    description:
      "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "E-TİCARET — Modern Giyim",
    description:
      "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi.",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
      >
        <StoreNavbar />
        {children}
        {/* KVKK çerez onay banner */}
        <CookieBanner />
        {/* WhatsApp — sadece admin'den aktif edilince görünür */}
        <WhatsappFloat />
      </body>
    </html>
  )
}
