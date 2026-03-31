import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import StoreNavbar from "@/components/store/StoreNavbar"
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
  title: "E-Ticaret",
  description: "Modern e-ticaret sitesi",
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
      </body>
    </html>
  )
}