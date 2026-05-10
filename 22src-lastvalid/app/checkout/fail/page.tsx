import { Suspense } from "react"
import CheckoutFailClient from "./CheckoutFailClient"

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<div className="p-10">Yükleniyor...</div>}>
      <CheckoutFailClient />
    </Suspense>
  )
}