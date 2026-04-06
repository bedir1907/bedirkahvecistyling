import { Suspense } from "react"
import EmailVerifyClient from "./EmailVerifyClient"

export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<div className="p-10">Yükleniyor...</div>}>
      <EmailVerifyClient />
    </Suspense>
  )
}