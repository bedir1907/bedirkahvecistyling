"use client"

import { useEffect, useState } from "react"
import CloudinaryUploadButton from "@/components/admin/CloudinaryUploadButton"

type LinkOption = {
  label: string
  value: string
  group: string
}

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([])

  const [form, setForm] = useState({
    heroEyebrow: "",
    heroTitle: "",
    heroSubtitle: "",
    heroButtonText: "",
    heroButtonLink: "",

    heroCard1Enabled: true,
    heroCard1Title: "",
    heroCard1Image: "",
    heroCard1Link: "",

    heroCard2Enabled: false,
    heroCard2Title: "",
    heroCard2Image: "",
    heroCard2Link: "",

    announcementEnabled: false,
    announcementText: "",
    announcementLink: "",
    announcementLinkLabel: "",
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const [settingsRes, optionsRes] = await Promise.all([
          fetch("/api/admin/homepage"),
          fetch("/api/admin/link-options"),
        ])

        const data = await settingsRes.json()
        const optionsData = await optionsRes.json()

        if (!settingsRes.ok) {
          throw new Error(data.error || "Ayarlar alınamadı")
        }

        if (!optionsRes.ok) {
          throw new Error(optionsData.error || "Link seçenekleri alınamadı")
        }

        setLinkOptions(optionsData)

        if (data) {
          setForm({
            heroEyebrow: data.heroEyebrow || "",
            heroTitle: data.heroTitle || "",
            heroSubtitle: data.heroSubtitle || "",
            heroButtonText: data.heroButtonText || "",
            heroButtonLink: data.heroButtonLink || "",

            heroCard1Enabled: Boolean(data.heroCard1Enabled),
            heroCard1Title: data.heroCard1Title || "",
            heroCard1Image: data.heroCard1Image || "",
            heroCard1Link: data.heroCard1Link || "",

            heroCard2Enabled: Boolean(data.heroCard2Enabled),
            heroCard2Title: data.heroCard2Title || "",
            heroCard2Image: data.heroCard2Image || "",
            heroCard2Link: data.heroCard2Link || "",

            announcementEnabled: Boolean(data.announcementEnabled),
            announcementText: data.announcementText || "",
            announcementLink: data.announcementLink || "",
            announcementLinkLabel: data.announcementLinkLabel || "",
          })
        }
      } catch (error) {
        console.error(error)
        alert("Homepage ayarları yüklenemedi")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setForm((prev) => ({ ...prev, [name]: checked }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kaydedilemedi")
      }

      alert("Homepage ayarları güncellendi")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kaydedilemedi")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-10">Yükleniyor...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ana Sayfa Ayarları</h1>
          <p className="text-gray-600 mt-1">
            Hero ve gösterilecek alanları buradan yönetebilirsin
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-8"
        >
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Ana Hero Alanı</h2>

            <div>
              <label className="block mb-2 font-medium">Üst Küçük Başlık</label>
              <input
                name="heroEyebrow"
                value={form.heroEyebrow}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Başlık</label>
              <input
                name="heroTitle"
                value={form.heroTitle}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Açıklama</label>
              <textarea
                name="heroSubtitle"
                value={form.heroSubtitle}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3 min-h-[120px]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Buton Metni</label>
                <input
                  name="heroButtonText"
                  value={form.heroButtonText}
                  onChange={handleChange}
                  className="w-full border rounded px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Buton Linki</label>
                <select
                  name="heroButtonLink"
                  value={form.heroButtonLink}
                  onChange={handleChange}
                  className="w-full border rounded px-4 py-3"
                >
                  <option value="">Link seç</option>
                  {linkOptions.map((option) => (
                    <option key={`hero-btn-${option.value}`} value={option.value}>
                      {option.group} - {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-5 border-t pt-6">
            <h2 className="text-xl font-semibold">Sağ Kart 1</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="heroCard1Enabled"
                checked={form.heroCard1Enabled}
                onChange={handleChange}
              />
              <span>Bu kartı göster</span>
            </label>

            <div>
              <label className="block mb-2 font-medium">Kart Başlığı</label>
              <input
                name="heroCard1Title"
                value={form.heroCard1Title}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            <div className="space-y-3">
  <label className="block font-medium">Kart Görseli</label>

  <div className="flex flex-wrap items-center gap-3">
    <CloudinaryUploadButton
      buttonText="Kart 1 Görseli Seç"
      onUploadSuccess={(url) =>
        setForm((prev) => ({
          ...prev,
          heroCard1Image: url,
        }))
      }
    />

    {form.heroCard1Image ? (
      <button
        type="button"
        onClick={() =>
          setForm((prev) => ({
            ...prev,
            heroCard1Image: "",
          }))
        }
        className="border border-red-200 text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 transition"
      >
        Görseli Kaldır
      </button>
    ) : null}
  </div>

  {form.heroCard1Image ? (
    <div className="rounded-xl border p-3 bg-gray-50">
      <img
        src={form.heroCard1Image}
        alt="Kart 1 görsel önizleme"
        className="w-full max-w-sm h-48 object-cover rounded-lg border"
      />
    </div>
  ) : (
    <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
      Henüz kart görseli seçilmedi.
    </div>
  )}
</div>

            <div>
              <label className="block mb-2 font-medium">Kart Linki</label>
              <select
                name="heroCard1Link"
                value={form.heroCard1Link}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
              >
                <option value="">Link seç</option>
                {linkOptions.map((option) => (
                  <option key={`hero-card1-${option.value}`} value={option.value}>
                    {option.group} - {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-5 border-t pt-6">
            <h2 className="text-xl font-semibold">Sağ Kart 2</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="heroCard2Enabled"
                checked={form.heroCard2Enabled}
                onChange={handleChange}
              />
              <span>Bu kartı göster</span>
            </label>

            <div>
              <label className="block mb-2 font-medium">Kart Başlığı</label>
              <input
                name="heroCard2Title"
                value={form.heroCard2Title}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
              />
            </div>

            <div className="space-y-3">
  <label className="block font-medium">Kart Görseli</label>

  <div className="flex flex-wrap items-center gap-3">
    <CloudinaryUploadButton
      buttonText="Kart 2 Görseli Seç"
      onUploadSuccess={(url) =>
        setForm((prev) => ({
          ...prev,
          heroCard2Image: url,
        }))
      }
    />

    {form.heroCard2Image ? (
      <button
        type="button"
        onClick={() =>
          setForm((prev) => ({
            ...prev,
            heroCard2Image: "",
          }))
        }
        className="border border-red-200 text-red-600 px-4 py-3 rounded-xl hover:bg-red-50 transition"
      >
        Görseli Kaldır
      </button>
    ) : null}
  </div>

  {form.heroCard2Image ? (
    <div className="rounded-xl border p-3 bg-gray-50">
      <img
        src={form.heroCard2Image}
        alt="Kart 2 görsel önizleme"
        className="w-full max-w-sm h-48 object-cover rounded-lg border"
      />
    </div>
  ) : (
    <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
      Henüz kart görseli seçilmedi.
    </div>
  )}
</div>

            <div>
              <label className="block mb-2 font-medium">Kart Linki</label>
              <select
                name="heroCard2Link"
                value={form.heroCard2Link}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
              >
                <option value="">Link seç</option>
                {linkOptions.map((option) => (
                  <option key={`hero-card2-${option.value}`} value={option.value}>
                    {option.group} - {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-5 border-t pt-6">
            <h2 className="text-xl font-semibold">Duyuru Barı</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="announcementEnabled"
                checked={form.announcementEnabled}
                onChange={handleChange}
              />
              <span>Duyuru barını aktif et</span>
            </label>

            <div>
              <label className="block mb-2 font-medium">Duyuru Metni</label>
              <input
                name="announcementText"
                value={form.announcementText}
                onChange={handleChange}
                className="w-full border rounded px-4 py-3"
                placeholder="Örn: 16:30'a kadar verilen siparişler aynı gün kargoda"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Link</label>
                <select
                  name="announcementLink"
                  value={form.announcementLink}
                  onChange={handleChange}
                  className="w-full border rounded px-4 py-3"
                >
                  <option value="">Link seç</option>
                  {linkOptions.map((option) => (
                    <option key={`ann-${option.value}`} value={option.value}>
                      {option.group} - {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Link Yazısı</label>
                <input
                  name="announcementLinkLabel"
                  value={form.announcementLinkLabel}
                  onChange={handleChange}
                  className="w-full border rounded px-4 py-3"
                  placeholder="Örn: Detayları Gör"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </form>
      </div>
    </main>
  )
}