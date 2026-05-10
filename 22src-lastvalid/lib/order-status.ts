export function getDisplayStatus(status: string, createdAt: Date | string) {
  if (status === "PAID") return "CREATED"
  if (status === "REFUNDED") return "REFUNDED"
  if (status !== "PENDING") return status

  const createdTime = new Date(createdAt).getTime()
  const now = Date.now()
  const diffMinutes = (now - createdTime) / (1000 * 60)

  if (diffMinutes >= 15) {
    return "FAILED_PAYMENT"
  }

  return "PENDING"
}

export function getStatusLabel(status: string) {
  switch (status) {
    case "CREATED":
      return "Sipariş Oluşturuldu"
    case "PAID":
      return "Ödeme Alındı"
    case "APPROVED":
      return "Sipariş Onaylandı"
    case "PENDING":
      return "Ödeme Bekleniyor"
    case "FAILED":
      return "Ödeme Başarısız"
    case "FAILED_PAYMENT":
      return "Ödeme Alınamadı"
    case "SHIPPED":
      return "Kargoya Verildi"
    case "DELIVERED":
      return "Teslim Edildi"
    case "CANCELLED":
      return "İptal Edildi"
    case "REFUNDED":
      return "İade Edildi"
    default:
      return status
  }
}

export function getStatusClass(status: string) {
  switch (status) {
    case "CREATED":
      return "bg-green-100 text-green-700"
    case "APPROVED":
      return "bg-indigo-100 text-indigo-700"
    case "PENDING":
      return "bg-yellow-100 text-yellow-700"
    case "FAILED":
    case "FAILED_PAYMENT":
      return "bg-red-100 text-red-700"
    case "SHIPPED":
      return "bg-blue-100 text-blue-700"
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700"
    case "CANCELLED":
      return "bg-gray-100 text-gray-700"
    case "REFUNDED":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}