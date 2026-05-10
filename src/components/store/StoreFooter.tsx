"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type SocialSettings = {
  instagramEnabled: boolean
  instagramUrl: string | null
  tiktokEnabled: boolean
  tiktokUrl: string | null
  youtubeEnabled: boolean
  youtubeUrl: string | null
  whatsappEnabled: boolean
  whatsappNumber: string | null
  whatsappMessage: string | null
  twitterEnabled: boolean
  twitterUrl: string | null
  facebookEnabled: boolean
  facebookUrl: string | null
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TiktokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.83a8.2 8.2 0 0 0 4.78 1.52V6.89a4.85 4.85 0 0 1-1.01-.2z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  )
}

function WhatsappIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function SocialButton({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full border border-black/10 text-black/60 hover:bg-black hover:text-white hover:border-black transition" aria-label={label}>
      {children}
    </a>
  )
}

export default function StoreFooter() {
  const [social, setSocial] = useState<SocialSettings | null>(null)

  useEffect(() => {
    fetch("/api/social").then(r => r.json()).then(d => setSocial(d)).catch(() => {})
  }, [])

  function buildWhatsappLink() {
    if (!social?.whatsappNumber) return null
    const num = social.whatsappNumber.replace(/\D/g, "")
    const msg = social.whatsappMessage ? encodeURIComponent(social.whatsappMessage) : ""
    return `https://wa.me/${num}${msg ? `?text=${msg}` : ""}`
  }

  const whatsappLink = buildWhatsappLink()

  const hasSocial = social && (
    (social.instagramEnabled && social.instagramUrl) ||
    (social.tiktokEnabled && social.tiktokUrl) ||
    (social.youtubeEnabled && social.youtubeUrl) ||
    (social.whatsappEnabled && whatsappLink) ||
    (social.twitterEnabled && social.twitterUrl) ||
    (social.facebookEnabled && social.facebookUrl)
  )

  return (
    <footer className="border-t border-black/10 bg-[#fafaf8] text-black mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-block leading-none mb-5">
              <span className="block text-[15px] font-semibold tracking-[0.22em] uppercase text-black leading-tight">Bedir Kahveci</span>
              <span className="block text-[11px] font-light tracking-[0.35em] uppercase text-black/40 leading-tight">Styling</span>
            </Link>

            <p className="text-gray-600 leading-7 max-w-xs text-sm">
              Modern erkek giyim için sade, güçlü ve güven veren bir alışveriş deneyimi.
            </p>

            <div className="mt-4 space-y-1 text-sm text-gray-500">
              <p>Yeniköy Mah. Amiral Şükrü Okan Cad.</p>
              <p>Altay Apartmanı No:26</p>
              <p>Tirebolu / Giresun 28500</p>
              <p className="mt-2">
                <a href="tel:+905531361261" className="hover:text-black transition">+90 553 136 12 61</a>
              </p>
              <p>
                <a href="mailto:info@bedirkahvecistyling.com" className="hover:text-black transition">info@bedirkahvecistyling.com</a>
              </p>
            </div>

            {/* Sosyal medya — DB'den + hardcoded Instagram */}
            <div className="flex items-center gap-3 mt-5 flex-wrap">
              {/* Instagram her zaman göster */}
              <SocialButton href="https://www.instagram.com/bedirkahvecistyling/" label="Instagram">
                <InstagramIcon />
              </SocialButton>

              {hasSocial && (
                <>
                  {social?.tiktokEnabled && social.tiktokUrl && (
                    <SocialButton href={social.tiktokUrl} label="TikTok"><TiktokIcon /></SocialButton>
                  )}
                  {social?.youtubeEnabled && social.youtubeUrl && (
                    <SocialButton href={social.youtubeUrl} label="YouTube"><YoutubeIcon /></SocialButton>
                  )}
                  {social?.whatsappEnabled && whatsappLink && (
                    <SocialButton href={whatsappLink} label="WhatsApp"><WhatsappIcon /></SocialButton>
                  )}
                  {social?.twitterEnabled && social.twitterUrl && (
                    <SocialButton href={social.twitterUrl} label="X (Twitter)"><TwitterIcon /></SocialButton>
                  )}
                  {social?.facebookEnabled && social.facebookUrl && (
                    <SocialButton href={social.facebookUrl} label="Facebook"><FacebookIcon /></SocialButton>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Kurumsal */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Kurumsal</h3>
            <div className="space-y-3 text-gray-600">
              <Link href="/hakkimizda" className="block hover:text-black transition">Hakkımızda</Link>
              <Link href="/iletisim" className="block hover:text-black transition">İletişim</Link>
            </div>
          </div>

          {/* Yasal */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Yasal</h3>
            <div className="space-y-3 text-gray-600">
              <Link href="/kvkk" className="block hover:text-black transition">KVKK Aydınlatma Metni</Link>
              <Link href="/cerez-politikasi" className="block hover:text-black transition">Çerez Politikası</Link>
              <Link href="/mesafeli-satis-on-bilgilendirme" className="block hover:text-black transition">Ön Bilgilendirme Formu</Link>
              <Link href="/mesafeli-satis-sozlesmesi" className="block hover:text-black transition">Mesafeli Satış Sözleşmesi</Link>
            </div>
          </div>

          {/* Müşteri Hizmetleri */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Müşteri Hizmetleri</h3>
            <div className="space-y-3 text-gray-600">
              <Link href="/kargo-ve-teslimat" className="block hover:text-black transition">Kargo ve Teslimat</Link>
              <Link href="/iade-ve-degisim" className="block hover:text-black transition">İade ve Değişim</Link>
              <Link href="/sikca-sorulan-sorular" className="block hover:text-black transition">Sık Sorulan Sorular</Link>
            </div>
          </div>
        </div>

        {/* Güven rozetleri */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🔒", title: "Güvenli Ödeme", sub: "SSL ile korumalı" },
            { icon: "🚚", title: "Ücretsiz Kargo", sub: "Tüm siparişlerde" },
            { icon: "↩️", title: "Kolay İade", sub: "14 gün içinde" },
            { icon: "💳", title: "Iyzico ile Öde", sub: "3D Secure güvencesi" },
          ].map((badge) => (
            <div key={badge.title} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3">
              <span className="text-2xl shrink-0">{badge.icon}</span>
              <div>
                <p className="text-sm font-semibold leading-tight">{badge.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{badge.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Alt bar */}
        <div className="mt-10 pt-6 border-t border-black/10 text-sm text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>© {new Date().getFullYear()} Bedir Kahveci Styling. Tüm hakları saklıdır.</p>
          <p>Vergi Dairesi: Tirebolu · VKN: 4880688583</p>
        </div>
      </div>
    </footer>
  )
}