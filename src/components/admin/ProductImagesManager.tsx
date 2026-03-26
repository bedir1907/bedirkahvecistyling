"use client"

import { useEffect, useState } from "react"

export default function ProductImagesManager({ productId }: { productId: number }) {
  const [images, setImages] = useState<any[]>([])
  const [url, setUrl] = useState("")

  async function fetchImages() {
    const res = await fetch(`/api/admin/products/${productId}/images`)
    const data = await res.json()
    setImages(data)
  }

  useEffect(() => {
    fetchImages()
  }, [])

  async function addImage() {
    if (!url) return

    await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      body: JSON.stringify({ url }),
    })

    setUrl("")
    fetchImages()
  }

  async function deleteImage(id: number) {
    await fetch(`/api/admin/product-images/${id}`, {
      method: "DELETE",
    })

    fetchImages()
  }

  async function makeCover(id: number) {
    await fetch(`/api/admin/product-images/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ makeCover: true }),
    })

    fetchImages()
  }

  return (
    <div className="mt-4 border rounded p-4 bg-gray-50">
      <h3 className="font-bold mb-3">Görseller</h3>

      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Görsel URL"
          className="border px-3 py-2 w-full"
        />
        <button onClick={addImage} className="bg-black text-white px-4">
          Ekle
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => (
          <div key={img.id} className="border p-2">
            <img src={img.url} className="w-full h-24 object-cover mb-2" />

            <div className="flex gap-2 text-xs">
              <button onClick={() => makeCover(img.id)}>Kapak</button>
              <button onClick={() => deleteImage(img.id)}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}