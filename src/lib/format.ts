/**
 * Fiyatı Türk Lirası formatında gösterir.
 * Örnek: 1250 → ₺1.250
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
