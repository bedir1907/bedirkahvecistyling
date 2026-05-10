import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import StoreShell from "@/components/store/StoreShell"
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
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bedirkahvecistyling.com"
  ),
  title: {
    default: "Bedir Kahveci Styling",
    template: "%s | Bedir Kahveci Styling",
  },
  description:
    "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi. Ücretsiz kargo, kolay iade.",
  keywords: ["erkek giyim", "e-ticaret", "online alışveriş", "moda", "giyim"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Bedir Kahveci Styling",
    title: "Bedir Kahveci Styling",
    description:
      "Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bedir Kahveci Styling",
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
        {/* StoreShell — admin sayfalarında otomatik gizlenir */}
        <StoreShell />
        {children}
      </body>
    </html>
  )
}