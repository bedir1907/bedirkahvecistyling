"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type AdminRole = "CREATOR" | "MANAGER" | "SALES"

type Props = {
  user: {
    id: number
    role: AdminRole
    isActive: boolean
  }
}

function getRoleDescription(role: AdminRole) {
  switch (role) {
    case "SALES":
      return "Siparişleri görür, müşteri bilgilerini görür, satış ve gönderim süreçlerini yönetir."
    case "MANAGER":
      return "Sales yetkilerine ek olarak ürün, stok ve kategori yönetimi yapar."
    case "CREATOR":
      return "Tüm sistemi yönetir, kullanıcı oluşturur, yetki verir ve tüm kritik işlemleri yapar."
    default:
      return ""
  }
}

export default function UserPermissionsForm({ user }: Props) {
  const router = useRouter()

  const [role, setRole] = useState<AdminRole>(user.role)
  const [isActive, setIsActive] = useState(user.isActive)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${user.id}/permissions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          isActive,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Güncellenemedi")
      }

      alert("Kullanıcı rolü güncellendi")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Güncellenemedi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
      <div className="grid md:grid-cols-[220px_1fr_140px] gap-4 items-start">
        <div>
          <label className="block text-sm font-medium mb-2">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AdminRole)}
            className="w-full border rounded-xl px-4 py-3 bg-white"
          >
            <option value="SALES">SALES</option>
            <option value="MANAGER">MANAGER</option>
            <option value="CREATOR">CREATOR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Açıklama</label>
          <div className="rounded-xl border bg-white px-4 py-3 text-sm text-gray-600 min-h-[52px]">
            {getRoleDescription(role)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Durum</label>
          <label className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-3 w-full">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive((prev) => !prev)}
            />
            <span>{isActive ? "Aktif" : "Pasif"}</span>
          </label>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Rolü Kaydet"}
        </button>
      </div>
    </div>
  )
}