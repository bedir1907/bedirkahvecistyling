/**
 * Şemaya eklenen ama canlı DB'ye henüz uygulanmamış kolonlar (ör. prisma/seo_fields_migration.sql)
 * sorguda "column does not exist" (Prisma P2022) hatası verir. Bu durumda yedek sorguya düşmek için kullanılır.
 */
export function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false
  const code = (error as { code?: unknown }).code
  const message = String((error as { message?: unknown }).message ?? "")
  return code === "P2022" || /column .* does not exist/i.test(message)
}
