"use client"

import { useEffect, useState } from "react"

export default function AdminAnnouncementPage() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)

    await fetch("/api/admin/announcement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    setLoading(false)
    alert("Kaydedildi")
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Duyuru Barı</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border p-3 rounded mb-4"
        rows={3}
        placeholder="Duyuru metni..."
      />

      <button
        onClick={save}
        className="bg-black text-white px-5 py-3 rounded"
      >
        Kaydet
      </button>
    </div>
  )
}