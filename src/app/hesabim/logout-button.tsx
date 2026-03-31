"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    try {
      setLoading(true)

      const res = await fetch("/api/customer/logout", {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Çıkış yapılamadı")
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Çıkış yapılamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
    >
      <LogOut size={16} />
      {loading ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
    </button>
  )
}