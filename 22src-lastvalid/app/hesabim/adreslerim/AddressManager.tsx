"use client"

import { useState } from "react"

type Address = {
  id: number
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  address: string
  note: string | null
  isDefault: boolean
}

type Props = {
  initialAddresses: Address[]
}

const emptyForm = {
  title: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  note: "",
  isDefault: false,
}

export default function AddressManager({ initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function startEdit(address: Address) {
    setEditingId(address.id)
    setForm({
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      district: address.district,
      address: address.address,
      note: address.note || "",
      isDefault: address.isDefault,
    })
  }

  async function refreshAddresses() {
    const res = await fetch("/api/customer/addresses", { cache: "no-store" })
    const data = await res.json()
    if (res.ok) {
      setAddresses(data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(
        editingId
          ? `/api/customer/addresses/${editingId}`
          : "/api/customer/addresses",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Adres kaydedilemedi")
      }

      await refreshAddresses()
      resetForm()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Adres kaydedilemedi")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Bu adres silinsin mi?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Adres silinemedi")
      }

      await refreshAddresses()
      if (editingId === id) {
        resetForm()
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Adres silinemedi")
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_420px] gap-6">
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-8 text-gray-500">
            Henüz kayıtlı adres yok.
          </div>
        ) : (
          addresses.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">
                    {item.title}
                    {item.isDefault ? " • Varsayılan" : ""}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.fullName} • {item.phone}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {item.city} / {item.district}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{item.address}</div>
                  {item.note ? (
                    <div className="text-sm text-gray-500 mt-1">{item.note}</div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="text-sm text-black hover:underline"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-black/10 bg-white p-6 space-y-4"
      >
        <h3 className="text-xl font-medium">
          {editingId ? "Adresi Düzenle" : "Yeni Adres"}
        </h3>

        <input
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Adres Başlığı (Ev / İş)"
          className="w-full rounded-2xl border border-black/10 px-4 py-3"
        />
        <input
          value={form.fullName}
          onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          placeholder="Ad Soyad"
          className="w-full rounded-2xl border border-black/10 px-4 py-3"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="Telefon"
          className="w-full rounded-2xl border border-black/10 px-4 py-3"
        />
        <input
          value={form.city}
          onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
          placeholder="Şehir"
          className="w-full rounded-2xl border border-black/10 px-4 py-3"
        />
        <input
          value={form.district}
          onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
          placeholder="İlçe"
          className="w-full rounded-2xl border border-black/10 px-4 py-3"
        />
        <textarea
          value={form.address}
          onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
          placeholder="Açık adres"
          className="w-full rounded-2xl border border-black/10 px-4 py-3 min-h-[110px]"
        />
        <textarea
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="Adres notu"
          className="w-full rounded-2xl border border-black/10 px-4 py-3 min-h-[90px]"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
            }
          />
          Varsayılan adres yap
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#1C1C1E] text-white px-5 py-3 text-sm font-medium"
          >
            {loading
              ? "Kaydediliyor..."
              : editingId
                ? "Güncelle"
                : "Adres Ekle"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium"
            >
              Vazgeç
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}