"use client"

import { useRouter } from "next/navigation"

type Props = {
  id: number
}

export default function DeleteProductButton({ id }: Props) {
  const router = useRouter()

  async function handleDelete() {
    const confirmed = window.confirm("Bu ürünü silmek istediğine emin misin?")

    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Ürün silinemedi")
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Ürün silinirken hata oluştu")
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