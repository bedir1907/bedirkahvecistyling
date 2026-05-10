# E-TİC v2 — Sosyal Medya + Admin Güncellemesi

## 📁 Dosya Haritası

```
prisma/
├── schema_addition.prisma          ← Bu modeli schema.prisma'ya ekle
└── social_settings_migration.sql   ← Migration notu + seed SQL

src/
├── app/
│   ├── layout.tsx                              ← DEĞİŞTİ  (WhatsappFloat eklendi)
│   │
│   ├── admin/
│   │   └── social/page.tsx                     ← YENİ    (sosyal medya admin sayfası)
│   │
│   └── api/
│       ├── admin/social/route.ts               ← YENİ    (admin GET + PATCH)
│       └── social/route.ts                     ← YENİ    (public GET — footer için)
│
└── components/
    ├── admin/
    │   └── AdminSidebar.tsx                    ← DEĞİŞTİ  (📱 Sosyal Medya linki eklendi)
    │
    └── store/
        ├── StoreFooter.tsx                     ← DEĞİŞTİ  (dinamik sosyal medya ikonları)
        └── WhatsappFloat.tsx                   ← YENİ    (sağ altta sabit WhatsApp butonu)
```

---

## 🚀 Kurulum Adımları (Sırasıyla)

### 1. Prisma Schema'ya model ekle
`prisma/schema.prisma` dosyasını aç,
en alt satıra `schema_addition.prisma` içindeki `model SocialSettings { ... }` bloğunu yapıştır.

### 2. Migration çalıştır
```bash
npx prisma migrate dev --name add_social_settings
```

### 3. Dosyaları kopyala
Yukarıdaki tablodaki her dosyayı projedeki aynı yola yapıştır.

### 4. Sunucuyu başlat
```bash
npm run dev
```

### 5. Admin panelinden ayarla
`/admin/social` sayfasına git →
İstediğin platformu toggle ile aç →
URL veya telefon numarasını gir →
"Ayarları Kaydet"e bas.

---

## ✅ Ne Çalışıyor?

| Özellik | Detay |
|---------|-------|
| **Toggle on/off** | Her platform bağımsız açılıp kapatılabilir |
| **Dinamik footer** | Sadece aktif + URL'li platformlar görünür |
| **WhatsApp float** | Sağ altta yeşil buton, ping animasyonlu |
| **Hazır mesaj** | WhatsApp açılınca önceden yazılmış metin |
| **Admin sidebar** | 📱 Sosyal Medya menüsü eklendi |

---

## WhatsApp Numara Formatı
```
905321234567   ✅ doğru  (90 + hat numarası, boşluksuz)
5321234567     ❌ yanlış (ülke kodu olmadan)
+905321234567  ❌ yanlış (+ işareti)
```
