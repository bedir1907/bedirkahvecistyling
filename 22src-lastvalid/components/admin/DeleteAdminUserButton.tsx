"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  userId: number
}

export default function DeleteAdminUserButton({ userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      "Bu kullanıcıyı silmek istediğine emin misin?"
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kullanıcı silinemedi")
      }

      alert("Kullanıcı silindi")
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kullanıcı silinemedi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="border border-red-500 text-red-500 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition disabled:opacity-50"
    >
      {loading ? "Siliniyor..." : "Sil"}
    </button>
  )
}