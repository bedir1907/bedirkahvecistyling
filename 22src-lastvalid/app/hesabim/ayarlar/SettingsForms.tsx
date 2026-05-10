"use client"

import { useState } from "react"

type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
}

type Props = {
  customer: Customer
}

export default function SettingsForms({ customer }: Props) {
  const [profile, setProfile] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
  })

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)

    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Profil güncellenemedi")
      }

      alert("Profil bilgileri güncellendi")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Profil güncellenemedi")
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)

    try {
      const res = await fetch("/api/customer/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(password),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Şifre güncellenemedi")
      }

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      alert("Şifre güncellendi")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Şifre güncellenemedi")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form
        onSubmit={saveProfile}
        className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-8 space-y-4"
      >
        <h3 className="text-xl font-medium">Profil Bilgileri</h3>

        <input
          value={profile.name}
          onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Ad Soyad"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        />
        <input
          value={profile.email}
          onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="E-posta"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        />
        <input
          value={profile.phone}
          onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="Telefon"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        />

        <button
          type="submit"
          disabled={savingProfile}
          className="rounded-2xl bg-[#1C1C1E] text-white px-5 py-3 text-sm font-medium"
        >
          {savingProfile ? "Kaydediliyor..." : "Profili Kaydet"}
        </button>
      </form>

      <form
        onSubmit={savePassword}
        className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-8 space-y-4"
      >
        <h3 className="text-xl font-medium">Şifre Değiştir</h3>

        <input
          type="password"
          value={password.currentPassword}
          onChange={(e) =>
            setPassword((prev) => ({ ...prev, currentPassword: e.target.value }))
          }
          placeholder="Mevcut şifre"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        />
        <input
          type="password"
          value={password.newPassword}
          onChange={(e) =>
            setPassword((prev) => ({ ...prev, newPassword: e.target.value }))
          }
          placeholder="Yeni şifre"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        />
        <input
          type="password"
          value={password.confirmPassword}
          onChange={(e) =>
            setPassword((prev) => ({ ...prev, confirmPassword: e.target.value }))
          }
          placeholder="Yeni şifre tekrar"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
        />

        <button
          type="submit"
          disabled={savingPassword}
          className="rounded-2xl bg-[#1C1C1E] text-white px-5 py-3 text-sm font-medium"
        >
          {savingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </button>
      </form>
    </div>
  )
}