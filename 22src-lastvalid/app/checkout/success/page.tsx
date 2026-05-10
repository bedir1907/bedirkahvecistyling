import { Suspense } from "react"
import CheckoutSuccessClient from "./CheckoutSuccessClient"

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10">Yükleniyor...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  )
}