"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AnnouncementBar from "@/components/store/AnnouncementBar"
import StoreNavbar from "@/components/store/StoreNavbar"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"

export default function CheckoutPage() {
  const router = useRouter()

  const cart = useCartStore((state) => state.cart)
  const clearCart = useCartStore((state) => state.clearCart)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    note: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (cart.length === 0) {
      setError("Sepetiniz boş.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          cart,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Sipariş oluşturulamadı")
      }

      clearCart()
      router.push(`/checkout/success?orderId=${data.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      <StoreNavbar />

      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Checkout
          </h1>
          <p className="text-gray-500 mt-2">
            Teslimat bilgilerini girip siparişini tamamla.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="border rounded-3xl p-10 text-center bg-white">
            <p className="text-gray-600 mb-5">Sepetiniz boş.</p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex px-6 py-3 rounded-2xl bg-black text-white"
            >
              Alışverişe Dön
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border bg-white p-6 md:p-8"
            >
              <h2 className="text-xl font-semibold mb-6">Teslimat Bilgileri</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ad Soyad
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:border-black"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:border-black"
                    placeholder="05xx xxx xx xx"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:border-black"
                    placeholder="ornek@mail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">İl</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:border-black"
                    placeholder="İl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    İlçe
                  </label>
                  <input
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 outline-none focus:border-black"
                    placeholder="İlçe"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Adres
                  </label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 min-h-[120px] outline-none focus:border-black"
                    placeholder="Mahalle, sokak, bina no, daire no..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Sipariş Notu
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    className="w-full border rounded-2xl px-4 py-3 min-h-[100px] outline-none focus:border-black"
                    placeholder="Varsa notunu yazabilirsin"
                  />
                </div>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-black text-white px-6 py-4 font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Sipariş Oluşturuluyor..." : "Siparişi Tamamla"}
              </button>
            </form>

            <aside className="rounded-3xl border bg-gray-50 p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold mb-6">Sipariş Özeti</h2>

              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex items-start justify-between gap-4 border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Renk: {item.color} • Beden: {item.size}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.quantity} x ₺{item.price}
                      </p>
                    </div>

                    <p className="font-medium">₺{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ürün Adedi</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>₺{total}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span>Ücretsiz</span>
                </div>

                <div className="border-t pt-4 flex items-center justify-between text-base font-semibold">
                  <span>Toplam</span>
                  <span>₺{total}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <StoreFooter />
    </main>
  )
}