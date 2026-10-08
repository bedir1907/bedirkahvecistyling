/**
 * Metin yardımcıları (saf, DB/Next bağımsız — hem sunucu hem istemci kullanabilir).
 */

const TR = "tr-TR"

/** Sesli harf içermeyen kısa kelimeler (ör. "RTR") kısaltma kabul edilip büyük harf bırakılır. */
function isAcronym(word: string) {
  const letters = word.replace(/[^\p{L}]/gu, "")
  return letters.length > 0 && letters.length <= 4 && !/[aeıioöuüAEIİOÖUÜ]/.test(letters)
}

/**
 * Türkçe olmayan (İngilizce kökenli) sık ürün kelimeleri: büyük harfle "I" yazıldıklarında Türkçe
 * kuralla "ı"ya dönmesinler diye ("OVERSIZE" → "Oversize", "Oversıze" değil).
 */
const LATIN_WORDS = new Set([
  "oversize", "basic", "slim", "fit", "regular", "relaxed", "skinny", "denim", "jogger", "cargo",
  "chino", "premium", "limited", "edition", "vintage", "print", "classic", "minimal", "street",
  "style", "zip", "polo", "sweatshirt", "shirt", "tshirt", "hoodie", "bomber", "trench",
  "parka", "loose", "wide", "leg", "linen", "stripe", "striped", "essential", "essentials", "studio",
  "patch", "graphic", "members", "only", "double", "sleeve", "the", "art", "of", "for", "everyone",
  "vinci", "rosette", "served", "cold", "massimo", "oysho", "melanj",
])

/**
 * Tamamı BÜYÜK HARF olan metni Türkçe kurallarıyla "Başlık Düzeni"ne çevirir
 * ("BEYAZ KETEN GÖMLEK" → "Beyaz Keten Gömlek", "İ/I" doğru işlenir).
 * İçinde küçük harf olan metinler (admin'in bilinçli yazımı) olduğu gibi kalır;
 * yalnızca fazla boşluklar sadeleştirilir.
 *
 * Google, başlıklarda aşırı büyük harf kullanımını (ALL CAPS) sevmiyor/reddedebiliyor.
 */
export function normalizeCaps(value: string | null | undefined): string {
  const text = String(value ?? "").trim().replace(/\s+/g, " ")
  if (!text) return text
  const hasLower = text !== text.toLocaleUpperCase(TR)
  if (hasLower) return text
  return text
    .split(" ")
    .map((word) => {
      if (!word || isAcronym(word)) return word
      // ASCII "I" içeren yabancı kelimeler (OVERSIZE, BASIC) İngilizce kuralla küçültülür
      const lower = lowerWord(word)
      return lower.charAt(0).toLocaleUpperCase(TR) + lower.slice(1)
    })
    .join(" ")
}

/** Türkçe karakterleri sadeleştirip karşılaştırma anahtarı üretir ("Yeşil" → "yesil"). */
export function foldKey(value: string | null | undefined): string {
  return String(value ?? "")
    .toLocaleLowerCase(TR)
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/** `text` içinde `part` (Türkçe karakter/büyük-küçük harf duyarsız) geçiyor mu? */
export function containsFolded(text: string | null | undefined, part: string | null | undefined) {
  const p = foldKey(part)
  if (!p) return true
  return ` ${foldKey(text)} `.includes(` ${p} `)
}

/**
 * "Ürün adı - Renk". Renk eklenmez: adda zaten geçiyorsa, renk kelimelerinden biri adda varsa
 * ("Haki Yeşil Pantolon" + "Haki") ya da renk alanına renk yerine uzun bir ad girilmişse (>3 kelime).
 */
export function nameWithColor(name: string, color: string | null | undefined) {
  if (!color || containsFolded(name, color)) return name
  const words = foldKey(color).split(" ").filter(Boolean)
  if (words.length > 3 || words.some((word) => containsFolded(name, word))) return name
  return `${name} - ${color}`
}

function lowerWord(word: string) {
  return /I/.test(word) && LATIN_WORDS.has(foldKey(word).replace(/\s+/g, ""))
    ? word.toLowerCase()
    : word.toLocaleLowerCase(TR)
}

/**
 * Tamamı BÜYÜK HARF olan paragraf metnini cümle düzenine çevirir ("MİNİMAL TASARIMI. KONFORLU" →
 * "Minimal tasarımı. Konforlu"). Küçük harf içeren metin olduğu gibi kalır.
 */
export function normalizeSentenceCaps(value: string | null | undefined): string {
  const text = String(value ?? "").trim()
  const letters = text.replace(/[^\p{L}]/gu, "")
  if (!letters || letters !== letters.toLocaleUpperCase(TR)) return text
  const lower = text
    .split(/(\s+)/)
    .map((part) => (/\s/.test(part) || isAcronym(part) ? part : lowerWord(part)))
    .join("")
  return lower.replace(/(^|[.!?]\s+)(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase(TR))
}
