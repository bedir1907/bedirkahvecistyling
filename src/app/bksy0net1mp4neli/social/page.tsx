"use client"

import { useEffect, useState } from "react"

type SocialForm = {
  instagramEnabled: boolean
  instagramUrl: string
  tiktokEnabled: boolean
  tiktokUrl: string
  youtubeEnabled: boolean
  youtubeUrl: string
  whatsappEnabled: boolean
  whatsappNumber: string
  whatsappMessage: string
  twitterEnabled: boolean
  twitterUrl: string
  facebookEnabled: boolean
  facebookUrl: string
}

const defaultForm: SocialForm = {
  instagramEnabled: false,
  instagramUrl: "",
  tiktokEnabled: false,
  tiktokUrl: "",
  youtubeEnabled: false,
  youtubeUrl: "",
  whatsappEnabled: false,
  whatsappNumber: "",
  whatsappMessage: "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
  twitterEnabled: false,
  twitterUrl: "",
  facebookEnabled: false,
  facebookUrl: "",
}

type Platform = {
  key: keyof SocialForm
  enabledKey: keyof SocialForm
  label: string
  icon: string
  color: string
  urlKey: keyof SocialForm
  urlLabel: string
  urlPlaceholder: string
  extraKey?: keyof SocialForm
  extraLabel?: string
  extraPlaceholder?: string
}

const PLATFORMS: Platform[] = [
  {
    key: "instagramEnabled",
    enabledKey: "instagramEnabled",
    label: "Instagram",
    icon: "📸",
    color: "from-purple-500 to-pink-500",
    urlKey: "instagramUrl",
    urlLabel: "Instagram Profil URL",
    urlPlaceholder: "https://instagram.com/magazaAdiniz",
  },
  {
    key: "tiktokEnabled",
    enabledKey: "tiktokEnabled",
    label: "TikTok",
    icon: "🎵",
    color: "from-gray-900 to-gray-700",
    urlKey: "tiktokUrl",
    urlLabel: "TikTok Profil URL",
    urlPlaceholder: "https://tiktok.com/@magazaAdiniz",
  },
  {
    key: "youtubeEnabled",
    enabledKey: "youtubeEnabled",
    label: "YouTube",
    icon: "▶️",
    color: "from-red-600 to-red-500",
    urlKey: "youtubeUrl",
    urlLabel: "YouTube Kanal URL",
    urlPlaceholder: "https://youtube.com/@kanalAdiniz",
  },
  {
    key: "whatsappEnabled",
    enabledKey: "whatsappEnabled",
    label: "WhatsApp",
    icon: "💬",
    color: "from-green-600 to-green-500",
    urlKey: "whatsappNumber",
    urlLabel: "WhatsApp Numarası",
    urlPlaceholder: "905XXXXXXXXX  (başında 90 ile, boşluksuz)",
    extraKey: "whatsappMessage",
    extraLabel: "Hazır Mesaj (opsiyonel)",
    extraPlaceholder: "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
  },
  {
    key: "twitterEnabled",
    enabledKey: "twitterEnabled",
    label: "X (Twitter)",
    icon: "🐦",
    color: "from-sky-500 to-sky-400",
    urlKey: "twitterUrl",
    urlLabel: "X (Twitter) Profil URL",
    urlPlaceholder: "https://x.com/hesapAdiniz",
  },
  {
    key: "facebookEnabled",
    enabledKey: "facebookEnabled",
    label: "Facebook",
    icon: "👍",
    color: "from-blue-700 to-blue-600",
    urlKey: "facebookUrl",
    urlLabel: "Facebook Sayfa URL",
    urlPlaceholder: "https://facebook.com/sayfaAdiniz",
  },
]

export default function AdminSocialPage() {
  const [form, setForm] = useState<SocialForm>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/social")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Ayarlar alınamadı")
        if (data) {
          setForm({
            instagramEnabled: Boolean(data.instagramEnabled),
            instagramUrl: data.instagramUrl || "",
            tiktokEnabled: Boolean(data.tiktokEnabled),
            tiktokUrl: data.tiktokUrl || "",
            youtubeEnabled: Boolean(data.youtubeEnabled),
            youtubeUrl: data.youtubeUrl || "",
            whatsappEnabled: Boolean(data.whatsappEnabled),
            whatsappNumber: data.whatsappNumber || "",
            whatsappMessage: data.whatsappMessage || defaultForm.whatsappMessage,
            twitterEnabled: Boolean(data.twitterEnabled),
            twitterUrl: data.twitterUrl || "",
            facebookEnabled: Boolean(data.facebookEnabled),
            facebookUrl: data.facebookUrl || "",
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ayarlar yüklenemedi")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  function handleToggle(key: keyof SocialForm) {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch("/api/admin/social", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi")
    } finally {
      setSaving(false)
    }
  }

  const activeCount = PLATFORMS.filter((p) => form[p.enabledKey]).length

  if (loading) {
    return (
      <main>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sosyal Medya Ayarları</h1>
          <p className="text-gray-600 mt-1">
            Hangi platformların görüneceğini ve linklerini buradan yönet.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${activeCount > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? "bg-green-500" : "bg-gray-400"}`} />
            {activeCount} platform aktif
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {PLATFORMS.map((platform) => {
          const isEnabled = Boolean(form[platform.enabledKey])
          return (
            <div
              key={platform.label}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isEnabled ? "border-black/20 shadow-sm" : "border-gray-200"
              }`}
            >
              {/* Platform başlık satırı */}
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-xl shrink-0`}>
                    {platform.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{platform.label}</p>
                    <p className="text-sm text-gray-500">
                      {isEnabled
                        ? (form[platform.urlKey] as string) || "URL girilmedi"
                        : "Kapalı — footer'da gösterilmiyor"}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(platform.enabledKey)}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                    isEnabled ? "bg-black" : "bg-gray-200"
                  }`}
                  aria-label={`${platform.label} ${isEnabled ? "kapat" : "aç"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      isEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* URL ve ekstra alan — sadece aktifken göster */}
              {isEnabled && (
                <div className="px-6 pb-5 pt-1 border-t border-gray-100 space-y-4 bg-gray-50/50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {platform.urlLabel}
                    </label>
                    <input
                      type="text"
                      name={platform.urlKey as string}
                      value={form[platform.urlKey] as string}
                      onChange={handleChange}
                      placeholder={platform.urlPlaceholder}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/40 transition bg-white"
                    />
                    {platform.key === "whatsappEnabled" && (
                      <p className="text-xs text-gray-500 mt-1">
                        Numara formatı: ülke kodu + hat (örn: 905321234567)
                      </p>
                    )}
                  </div>

                  {platform.extraKey && platform.extraLabel && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {platform.extraLabel}
                      </label>
                      <textarea
                        name={platform.extraKey as string}
                        value={form[platform.extraKey] as string}
                        onChange={handleChange}
                        placeholder={platform.extraPlaceholder}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-black/40 transition bg-white resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Kullanıcı WhatsApp'ı açtığında bu metin otomatik yazılır.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Kaydet */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>

          {saved && (
            <span className="text-green-600 font-medium text-sm flex items-center gap-1.5">
              ✓ Kaydedildi
            </span>
          )}

          {error && (
            <span className="text-red-600 text-sm">{error}</span>
          )}
        </div>
      </form>
    </main>
  )
}
