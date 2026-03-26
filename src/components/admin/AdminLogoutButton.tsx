"use client"

import { useRouter } from "next/navigation"

export default function AdminLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    })

    router.push("/admin/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white"
    >
      Çıkış Yap
    </button>
  )
}