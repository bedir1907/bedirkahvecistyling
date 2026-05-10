"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, Plus, Check, ShoppingBag, Receipt } from "lucide-react"
import StoreFooter from "@/components/store/StoreFooter"
import { useCartStore } from "@/store/cartStore"
import Link from "next/link"

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

type AddressForm = {
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  address: string
  note: string
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

const emptyAddressForm: AddressForm = {
  title: "",
  fullName: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  note: "",
  isDefault: false,
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

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)

  const [billingForm, setBillingForm] = useState({
    billingName: "",
    billingPhone: "",
    billingCity: "",
    billingDistrict: "",
    billingAddress: "",
    billingNote: "",
  })

  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm)
  const [savingAddress, setSavingAddress] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
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
              addressData.find((item: Address) => item.isDefault) || addressData[0]

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
    return addresses.find((item) => String(item.id) === selectedAddressId) || null
  }, [addresses, selectedAddressId])

  const hasSavedAddresses = Boolean(customer && addresses.length > 0)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleBillingChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target

    setBillingForm((prev) => ({
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

  function handleAddressFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target as HTMLInputElement

    setAddressForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }))
  }

  async function refreshAddresses() {
    const res = await fetch("/api/customer/addresses", { cache: "no-store" })
    const data = await safeJson(res)

    if (res.ok && Array.isArray(data)) {
      setAddresses(data)

      const defaultAddress =
        data.find((item: Address) => item.isDefault) || data[0]

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

  async function handleCreateAddress(e: React.FormEvent) {
    e.preventDefault()

    if (!customer) {
      setError("Adres eklemek için giriş yapmalısın")
      return
    }

    setSavingAddress(true)
    setError("")

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressForm),
      })

      const data = await safeJson(res)

      if (!res.ok) {
        throw new Error(data?.error || "Adres oluşturulamadı")
      }

      await refreshAddresses()
      setShowNewAddressForm(false)
      setAddressForm(emptyAddressForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adres oluşturulamadı")
    } finally {
      setSavingAddress(false)
    }
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
      setError("Lütfen teslimat için zorunlu alanları doldur")
      return
    }

    if (!billingSameAsShipping) {
      if (
        !billingForm.billingName.trim() ||
        !billingForm.billingPhone.trim() ||
        !billingForm.billingCity.trim() ||
        !billingForm.billingDistrict.trim() ||
        !billingForm.billingAddress.trim()
      ) {
        setError("Lütfen fatura adresi için zorunlu alanları doldur")
        return
      }
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
          billingSameAsShipping,
          ...billingForm,
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

  return (
    <main className="min-h-screen bg-[#fafaf8] text-black">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[1.15fr_420px] gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-black/10 rounded-[28px] p-6 md:p-8 space-y-8"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                Teslimat ve ödeme
              </p>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
                Checkout
              </h1>
              <p className="text-sm text-gray-500">
                Sipariş bilgilerini kontrol et ve ödemeye güvenle geç.
              </p>
            </div>

            {loadingCustomer ? (
              <div className="text-sm text-gray-500">
                Bilgiler hazırlanıyor...
              </div>
            ) : null}

            {customer ? (
              <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] px-5 py-4">
                <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
                  Giriş yapan müşteri
                </div>
                <div className="font-medium">{customer.email}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {customer.name}
                  {customer.phone ? ` • ${customer.phone}` : ""}
                </div>
              </div>
            ) : null}

            {hasSavedAddresses ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
                      Kayıtlı adresler
                    </div>
                    <div className="text-xl font-medium">Teslimat adresi seç</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <Plus size={16} />
                    Yeni Adres
                  </button>
                </div>

                <div className="grid gap-3">
                  {addresses.map((item) => {
                    const active = String(item.id) === selectedAddressId

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectAddress(String(item.id))}
                        className={`w-full text-left rounded-3xl border px-5 py-5 transition ${
                          active
                            ? "border-black bg-[#fafaf8]"
                            : "border-black/10 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="font-medium">
                              {item.title}
                              {item.isDefault ? " • Varsayılan" : ""}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.fullName} • {item.phone}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.city} / {item.district}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.address}
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                              active
                                ? "border-black bg-black text-white"
                                : "border-black/20"
                            }`}
                          >
                            {active ? <Check size={14} /> : null}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : customer ? (
              <div className="rounded-3xl border border-dashed border-black/10 bg-[#fcfcfb] px-5 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-medium">Kayıtlı adres yok</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Yeni adres ekleyebilir ya da aşağıdaki alanları elle doldurabilirsin.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium hover:bg-white transition"
                  >
                    <Plus size={16} />
                    Adres Ekle
                  </button>
                </div>
              </div>
            ) : null}

            {showNewAddressForm && customer ? (
              <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 space-y-4">
                <div className="text-xl font-medium">Yeni adres ekle</div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    name="title"
                    value={addressForm.title}
                    onChange={handleAddressFormChange}
                    placeholder="Adres Başlığı (Ev / İş)"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                  />
                  <input
                    name="fullName"
                    value={addressForm.fullName}
                    onChange={handleAddressFormChange}
                    placeholder="Ad Soyad"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                  />
                  <input
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                    placeholder="Telefon"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                  />
                  <input
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressFormChange}
                    placeholder="Şehir"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3"
                  />
                  <input
                    name="district"
                    value={addressForm.district}
                    onChange={handleAddressFormChange}
                    placeholder="İlçe"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 md:col-span-2"
                  />
                  <textarea
                    name="address"
                    value={addressForm.address}
                    onChange={handleAddressFormChange}
                    placeholder="Açık adres"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 min-h-[110px] md:col-span-2"
                  />
                  <textarea
                    name="note"
                    value={addressForm.note}
                    onChange={handleAddressFormChange}
                    placeholder="Adres notu"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 min-h-[90px] md:col-span-2"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressFormChange}
                  />
                  Varsayılan adres yap
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCreateAddress}
                    disabled={savingAddress}
                    className="rounded-2xl bg-[#1C1C1E] text-white px-5 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {savingAddress ? "Kaydediliyor..." : "Adresi Kaydet"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(false)
                      setAddressForm(emptyAddressForm)
                    }}
                    className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium hover:bg-white transition"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                  Teslimat bilgileri
                </div>
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
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-[#fcfcfb] p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Receipt size={20} />
                <div>
                  <div className="text-xl font-medium">Fatura Bilgileri</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Fatura adresi teslimat adresinle aynı olabilir ya da ayrı tanımlanabilir.
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                />
                <span>Fatura adresim teslimat adresi ile aynı</span>
              </label>

              {!billingSameAsShipping && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fatura Ad Soyad
                    </label>
                    <input
                      type="text"
                      name="billingName"
                      value={billingForm.billingName}
                      onChange={handleBillingChange}
                      className="w-full border border-black/10 rounded-2xl px-4 py-3"
                      placeholder="Ad Soyad / Ünvan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fatura Telefon
                    </label>
                    <input
                      type="text"
                      name="billingPhone"
                      value={billingForm.billingPhone}
                      onChange={handleBillingChange}
                      className="w-full border border-black/10 rounded-2xl px-4 py-3"
                      placeholder="Telefon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fatura Şehir
                    </label>
                    <input
                      type="text"
                      name="billingCity"
                      value={billingForm.billingCity}
                      onChange={handleBillingChange}
                      className="w-full border border-black/10 rounded-2xl px-4 py-3"
                      placeholder="Şehir"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Fatura İlçe
                    </label>
                    <input
                      type="text"
                      name="billingDistrict"
                      value={billingForm.billingDistrict}
                      onChange={handleBillingChange}
                      className="w-full border border-black/10 rounded-2xl px-4 py-3"
                      placeholder="İlçe"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Fatura Adresi
                    </label>
                    <textarea
                      name="billingAddress"
                      value={billingForm.billingAddress}
                      onChange={handleBillingChange}
                      className="w-full border border-black/10 rounded-2xl px-4 py-3 min-h-[120px]"
                      placeholder="Fatura adresi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Fatura Notu
                    </label>
                    <textarea
                      name="billingNote"
                      value={billingForm.billingNote}
                      onChange={handleBillingChange}
                      className="w-full border border-black/10 rounded-2xl px-4 py-3 min-h-[100px]"
                      placeholder="Varsa fatura notu"
                    />
                  </div>
                </div>
              )}
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <p className="text-xs text-gray-500 leading-6">
  Siparişi tamamlayarak{" "}
  <Link
    href="/mesafeli-satis-sozlesmesi"
    className="underline hover:text-black transition"
  >
    Mesafeli Satış Sözleşmesi
  </Link>{" "}
  ve{" "}
  <Link
    href="/mesafeli-satis-on-bilgilendirme"
    className="underline hover:text-black transition"
  >
    Ön Bilgilendirme Formu
  </Link>
  ’nu okuduğunu ve kabul ettiğini beyan etmiş olursun.
</p>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1C1C1E] text-white px-6 py-4 text-base font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Ödeme Başlatılıyor..." : "Ödemeye Geç"}
            </button>
          </form>

          <aside className="bg-white border border-black/10 rounded-[28px] p-6 md:p-8 lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-medium tracking-tight">
                  Sipariş Özeti
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {itemCount} ürün
                </p>
              </div>
            </div>

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