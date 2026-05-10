-- Prisma schema'ya bu model bloğunu ekle:
-- prisma/schema.prisma içinde herhangi bir model'in altına yapıştır

-- ─────────────────────────────────────────────────────────────────
-- ADIM 1: prisma/schema.prisma dosyasına aşağıdaki modeli ekle
-- ─────────────────────────────────────────────────────────────────

-- model SocialSettings {
--   id Int @id @default(autoincrement())
--
--   instagramEnabled Boolean @default(false)
--   instagramUrl     String? -- örn: https://instagram.com/magazaAdi
--
--   tiktokEnabled Boolean @default(false)
--   tiktokUrl     String?
--
--   youtubeEnabled Boolean @default(false)
--   youtubeUrl     String?
--
--   whatsappEnabled Boolean @default(false)
--   whatsappNumber  String? -- örn: 905XXXXXXXXX (başında 90 ile)
--   whatsappMessage String? -- Hazır mesaj metni (opsiyonel)
--
--   twitterEnabled Boolean @default(false)
--   twitterUrl     String?
--
--   facebookEnabled Boolean @default(false)
--   facebookUrl     String?
--
--   isActive  Boolean  @default(true)
--   createdAt DateTime @default(now())
--   updatedAt DateTime @updatedAt
-- }

-- ─────────────────────────────────────────────────────────────────
-- ADIM 2: Terminalde çalıştır:
--   npx prisma migrate dev --name add_social_settings
-- ─────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────
-- ADIM 3 (opsiyonel): İlk kaydı seed olarak ekle
-- ─────────────────────────────────────────────────────────────────
INSERT INTO "SocialSettings" (
  "instagramEnabled", "instagramUrl",
  "tiktokEnabled",    "tiktokUrl",
  "youtubeEnabled",   "youtubeUrl",
  "whatsappEnabled",  "whatsappNumber", "whatsappMessage",
  "twitterEnabled",   "twitterUrl",
  "facebookEnabled",  "facebookUrl",
  "isActive", "createdAt", "updatedAt"
) VALUES (
  false, null,
  false, null,
  false, null,
  false, null, 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.',
  false, null,
  false, null,
  true,  NOW(), NOW()
) ON CONFLICT DO NOTHING;
