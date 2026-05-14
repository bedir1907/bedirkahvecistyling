"use client"

import { useEffect, useState } from "react"

type LinkOption = {
  label: string
  value: string
  group: string
}

export default function AdminAnnouncementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [enabled, setEnabled] = useState(false)
  const [text, setText] = useState("")
  const [link, setLink] = useState("")
  const [linkLabel, setLinkLabel] = useState("")
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, linksRes] = await Promise.all([
          fetch("/api/admin/homepage"),
          fetch("/api/admin/link-options"),
        ])
        const settingsData = await settingsRes.json()
        const linksData = await linksRes.json()
        if (!settingsRes.ok) throw new Error(settingsData.error || "Ayarlar alınamadı")
        setEnabled(settingsData.announcementEnabled ?? false)
        setText(settingsData.announcementText ?? "")
        setLink(settingsData.announcementLink ?? "")
        setLinkLabel(settingsData.announcementLinkLabel ?? "")
        setLinkOptions(Array.isArray(linksData) ? linksData : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ayarlar alınamadı")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function save() {
    setSaving(true); setError(""); setSuccess("")
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementEnabled: enabled,
          announcementText: text,
          announcementLink: link || null,
          announcementLinkLabel: linkLabel || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi")
      setSuccess("Duyuru başarıyla güncellendi ✓")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi")
    } finally {
      setSaving(false)
    }
  }

  const groupedOptions = linkOptions.reduce<Record<string, LinkOption[]>>((acc, opt) => {
    if (!acc[opt.group]) acc[opt.group] = []
    acc[opt.group].push(opt)
    return acc
  }, {})

  if (loading) {
    return (
      <main>
        <div className="max-w-xl animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Duyuru Bandı</h1>
          <p className="text-gray-500 mt-1 text-sm">Sitenin üstünde kayan duyuru metnini buradan yönet.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-4">{success}</div>}

        <div className="bg-white rounded-2xl border p-6 space-y-5">

          {/* Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Duyuru Bandını Göster</p>
              <p className="text-sm text-gray-500 mt-0.5">Kapatırsan duyuru bandı sitede görünmez</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enabled ? "bg-black" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="border-t border-gray-100" />

          {/* Metin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Duyuru Metni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              disabled={!enabled}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="ör: Tüm siparişlerde ücretsiz kargo! 🚀"
            />
          </div>

          {/* Link seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bağlantı <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <select
              value={link}
              onChange={(e) => { setLink(e.target.value); if (!e.target.value) setLinkLabel("") }}
              disabled={!enabled}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Bağlantı seçme —</option>
              {Object.entries(groupedOptions).map(([group, opts]) => (
                <optgroup key={group} label={group}>
                  {opts.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Link yazısı */}
          {link && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bağlantı Yazısı <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                disabled={!enabled}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition disabled:bg-gray-50 disabled:text-gray-400"
                placeholder="ör: Hemen İncele"
              />
            </div>
          )}

          {/* Önizleme */}
          {enabled && text.trim() && (
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <p className="text-xs text-gray-400 px-3 py-1.5 bg-gray-50 border-b">Önizleme</p>
              <div className="bg-black text-white text-sm py-2.5 px-4 flex items-center gap-3">
                <span>{text}</span>
                {link && linkLabel && <span className="underline opacity-70 text-xs">{linkLabel} →</span>}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving || (enabled && !text.trim())}
            className="w-full bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </main>
  )
}