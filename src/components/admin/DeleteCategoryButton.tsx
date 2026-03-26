"use client"

import { useRouter } from "next/navigation"

type Props = {
  id: number
}

export default function DeleteCategoryButton({ id }: Props) {
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm("Bu kategoriyi silmek istediğine emin misin?")

    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Kategori silinemedi")
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Kategori silinemedi")
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="border border-red-500 text-red-500 px-3 py-2 rounded hover:bg-red-500 hover:text-white"
    >
      Sil
    </button>
  )
}