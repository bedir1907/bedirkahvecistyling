"use client"

import { useEffect, useMemo, useState } from "react"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"

type Customer = {
  id: number
  name: string
  email: string
  phone: string | null
} | null

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

async function safeJson(res: Response) {
  const text = await res.text()

  try {
    return text ? JSON.parse(text) : null
  } catch {
    throw new Error("Sunucudan beklenmeyen cevap geldi")
  }
}

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart)

  const [customer, setCustomer] = useState<Customer>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [loadingCustomer, setLoadingCustomer] = useState(true)

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

  useEffect(() => {
    async function bootstrap() {
      try {
        const meRes = await fetch("/api/customer/me", { cache: "no-store" })
        const meData = await safeJson(meRes)

        if (meRes.ok && meData?.customer) {
          setCustomer(meData.customer)

          setForm((prev) => ({
            ...prev,
            name: meData.customer.name || "",
            email: meData.customer.email || "",
            phone: meData.customer.phone || "",
          }))

          const addressRes = await fetch("/api/customer/addresses", {
            cache: "no-store",
          })
          const addressData = await safeJson(addressRes)

          if (addressRes.ok && Array.isArray(addressData)) {
            setAddresses(addressData)

            const defaultAddress =
              addressData.find((item: Address) => item.isDefault) ||
              addressData[0]

            if (defaultAddress) {
              setSelectedAddressId(String(defaultAddress.id))
              setForm((prev) => ({
                ...prev,
                name: defaultAddress.fullName || prev.name,
                phone: defaultAddress.phone || prev.phone,
                city: defaultAddress.city || "",
                district: defaultAddress.district || "",
                address: defaultAddress.address || "",
                note: defaultAddress.note || "",
              }))
            }
          }
        }
      } catch (error) {
        console.error("Checkout bootstrap hatası:", error)
      } finally {
        setLoadingCustomer(false)
      }
    }

    bootstrap()
  }, [])

  const selectedAddress = useMemo(() => {
    return (
      addresses.find((item) => String(item.id) === selectedAddressId) || null
    )
  }, [addresses, selectedAddressId])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSelectAddress(addressId: string) {
    setSelectedAddressId(addressId)

    const found = addresses.find((item) => String(item.id) === addressId)
    if (!found) return

    setForm((prev) => ({
      ...prev,
      name: found.fullName || prev.name,
      phone: found.phone || prev.phone,
      city: found.city,
      district: found.district,
      address: found.address,
      note: found.note || "",
    }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (cart.length === 0) {
      setError("Sepet boş")
      return
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.district.trim() ||
      !form.address.trim()
    ) {
      setError("Lütfen zorunlu alanları doldur")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payment/iyzico/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          addressId: selectedAddress ? selectedAddress.id : null,
          cart,
        }),
      })

      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data?.error || "Ödeme başlatılamadı")
      }

      if (!data?.paymentPageUrl) {
        throw new Error("Ödeme sayfası oluşturulamadı")
      }

      localStorage.setItem("pendingOrderNumber", data.orderNumber)
      window.location.href = data.paymentPageUrl
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ödeme başlatılırken hata oluştu"
      )
    } finally {
      setLoading(false)
    }
  }

  const hasSavedAddresses = Boolean(customer && addresses.length > 0)

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1.2fr_420px] gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-black/10 rounded-3xl p-6 md:p-8 space-y-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                Teslimat
              </p>
              <h1 className="text-3xl font-medium tracking-tight">Checkout</h1>
            </div>

            {loadingCustomer ? (
              <div className="text-sm text-gray-500">
                Bilgiler hazırlanıyor...
              </div>
            ) : null}

            {hasSavedAddresses ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Kayıtlı Adres Seç
                  </label>

                  <div className="space-y-3">
                    {addresses.map((item) => {
                      const active = String(item.id) === selectedAddressId

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectAddress(String(item.id))}
                          className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
                            active
                              ? "border-black bg-[#fafaf8]"
                              : "border-black/10 bg-white hover:bg-gray-50"
                          }`}
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
                              <div className="text-sm text-gray-500 mt-1">
                                {item.address}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-black/10 rounded-2xl px-4 py-3"
                  placeholder="Ad Soyad"
                  readOnly={hasSavedAddresses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-black/10 rounded-2xl px-4 py-3"
                  placeholder="mail@ornek.com"
                  readOnly={Boolean(customer)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-black/10 rounded-2xl px-4 py-3"
                  placeholder="05xx xxx xx xx"
                  readOnly={hasSavedAddresses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Şehir</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-black/10 rounded-2xl px-4 py-3"
                  placeholder="Şehir"
                  readOnly={hasSavedAddresses}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">İlçe</label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full border border-black/10 rounded-2xl px-4 py-3"
                  placeholder="İlçe"
                  readOnly={hasSavedAddresses}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Adres</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-black/10 rounded-2xl px-4 py-3 min-h-[120px]"
                  placeholder="Mahalle, sokak, bina no, daire no..."
                  readOnly={hasSavedAddresses}
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
                  className="w-full border border-black/10 rounded-2xl px-4 py-3 min-h-[100px]"
                  placeholder="Varsa sipariş notunuzu yazın"
                  readOnly={hasSavedAddresses}
                />
              </div>
            </div>

            {!hasSavedAddresses && customer ? (
              <div className="text-sm text-gray-500">
                Kayıtlı adresin yok. Adres ekledikten sonra checkout alanı
                otomatik doldurulacak.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1C1C1E] text-white px-6 py-4 text-base font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Ödeme Başlatılıyor..." : "Ödemeye Geç"}
            </button>
          </form>

          <aside className="bg-white border border-black/10 rounded-3xl p-6 md:p-8 lg:sticky lg:top-24">
            <h2 className="text-2xl font-medium tracking-tight mb-6">
              Sipariş Özeti
            </h2>

            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.variantId}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-black/5 pb-4"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.color || "-"} • {item.size || "-"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.quantity} adet × ₺{item.price}
                    </div>
                  </div>

                  <div className="font-medium">₺{item.price * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-black/10 flex items-center justify-between">
              <span className="text-gray-500">Toplam</span>
              <span className="text-2xl font-medium">₺{total}</span>
            </div>
          </aside>
        </div>
      </section>

      <StoreFooter />
    </main>
  )
}