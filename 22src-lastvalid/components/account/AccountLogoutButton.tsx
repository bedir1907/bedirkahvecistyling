"use client"

import { useRouter } from "next/navigation"

export default function AccountLogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/customer/logout", {
      method: "POST",
    })

    router.push("/giris")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center justify-between px-3 py-3 text-sm text-gray-400 hover:text-black transition w-full"
    >
      <span>Çıkış Yap</span>
    </button>
  )
}