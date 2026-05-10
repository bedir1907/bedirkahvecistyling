"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

function isStrongPassword(password: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
}

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Lütfen zorunlu alanları doldurun.")
      return
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.")
      return
    }

    if (!isStrongPassword(password)) {
      setError("Şifre en az 8 karakter olmalı; büyük harf, küçük harf, rakam ve özel karakter içermelidir.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Kayıt oluşturulamadı")

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#fafaf8]">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block leading-none">
            <span className="block text-[15px] font-semibold tracking-[0.22em] uppercase text-black">Bedir Kahveci</span>
            <span className="block text-[10px] font-light tracking-[0.35em] uppercase text-black/40">Styling</span>
          </Link>
        </div>

        <div className="border border-black/10 rounded-3xl p-8 bg-white shadow-sm">

          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-xl font-medium mb-2">Hesabınız oluşturuldu!</h2>
              <p className="text-gray-500 text-sm mb-6">
                E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin.
              </p>
              <Link
                href="/giris"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition"
              >
                Giriş Yap
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-medium tracking-tight mb-1">Hesap Oluştur</h1>
              <p className="text-gray-500 text-sm mb-7">Birkaç saniyede üye ol, alışverişe başla.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                    placeholder="ornek@mail.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Telefon <span className="text-gray-400 font-normal">(opsiyonel)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                    placeholder="05xx xxx xx xx"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                    placeholder="••••••••"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    En az 8 karakter, büyük/küçük harf, rakam ve özel karakter
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Şifre Tekrar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black/30 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white rounded-xl px-4 py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-gray-500">
                Zaten hesabın var mı?{" "}
                <Link href="/giris" className="text-black font-medium hover:opacity-70 transition">
                  Giriş Yap
                </Link>
              </p>
            </>
          )}
        </div>

      </div>
    </main>
  )
}