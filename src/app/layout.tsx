import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import StoreShell from "@/components/store/StoreShell"
import IntroSplash, { INTRO_SPLASH_SCRIPT } from "@/components/store/IntroSplash"
import { getSiteUrl, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME } from "@/lib/seo"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()
const yandexVerification = process.env.YANDEX_SITE_VERIFICATION?.trim()
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim()

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["erkek giyim", "erkek modası", "online alışveriş", "erkek kıyafet", SITE_NAME],
  authors: [{ name: SITE_NAME, url: getSiteUrl() }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  formatDetection: { telephone: false, email: false, address: false },
  // Not: canonical burada tanımlanmaz; tanımlansa tüm alt sayfalara miras kalır.
  // Her indekslenen sayfa kendi canonical'ını pageMetadata() ile verir.
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(googleVerification || yandexVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(yandexVerification ? { yandex: yandexVerification } : {}),
          ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
        },
      }
    : {}),
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>
) {
  return (
    // suppressHydrationWarning: splash script'i hydration'dan önce <html>'e sınıf ekler
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_SPLASH_SCRIPT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}>
        <IntroSplash />
        <StoreShell />
        {children}
      </body>
    </html>
  )
}