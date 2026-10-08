# Yapılacaklar — SEO, Merchant Feed, Ödeme

> Her madde tamamlandıkça `[x]` ile işaretlenir. Push yapılmadan önce onay beklenir.

## 1. SEO & Metadata

- [x] Tüm sayfaların metadata durumunu incele (title, description, canonical, OG, Twitter)
- [x] Root layout metadata'yı güçlendir (OG görseli, canonical, alternates, icons, verification alanları)
- [x] Ürün sayfası `generateMetadata` (ürüne özel title/description/OG görseli/canonical)
- [x] Kategori sayfası `generateMetadata`
- [x] Koleksiyon sayfası `generateMetadata`
- [x] Statik/bilgi sayfaları (hakkımızda, iletişim, SSS, KVKK, sözleşmeler vb.) metadata
- [x] Özel/işlem sayfalarına `noindex` (sepet, checkout, hesap, giriş, kayıt, arama, favoriler, şifre sayfaları)
- [x] JSON-LD: Organization + WebSite (SearchAction) — root
- [x] JSON-LD: Product (Offer, fiyat, stok, marka, SKU, görseller) — ürün sayfası
- [x] JSON-LD: BreadcrumbList — ürün & kategori sayfaları
- [x] JSON-LD: FAQPage — SSS sayfası
- [x] `sitemap.ts` düzelt (BASE_URL www tutarlılığı, koleksiyonlar, görseller, sabit tarih yerine gerçek tarih)
- [x] `robots.ts` gözden geçir (feed/sitemap erişimi, gereksiz engeller)
- [x] Görsel alt metinleri ve heading (h1) hiyerarşisi kontrolü
- [x] `manifest` (PWA/web app manifest) ekle
- [x] Tip kontrolü & lint temiz
- [x] Varsayılan OG görseli (`opengraph-image.tsx`) ve ortak SEO yardımcıları (`src/lib/seo.ts`, `JsonLd` bileşeni)
- [x] Admin paneline `noindex, nofollow` (robots.txt'de yol ifşa edilmeden)
- [x] Koleksiyon sayfasını server wrapper + client bileşen olarak ayır (metadata için)
- [ ] (Opsiyonel/ileride) Ürün/kategori/koleksiyon içeriğini SSR ile ilk HTML'de render et (şu an client fetch)

## 2. Google Merchant Center Ürün Feed'i

- [x] Ürün/varyant/renk grubu veri modelini incele
- [x] Otomatik feed endpoint'i (`/feed/google-merchant.xml`) — RSS 2.0 + `g:` namespace
- [x] Zorunlu alanlar: id, title, description, link, image_link, availability, price, brand, condition
- [x] İndirimli ürünler için `sale_price` (oldPrice > price)
- [x] Giyim alanları: gender, age_group, color, size, item_group_id, google_product_category, product_type
- [x] Ek görseller (`additional_image_link`), kargo bilgisi (`shipping`)
- [x] Sadece aktif ürünler; stok 0 → `out_of_stock`
- [x] Önbellek/revalidate ayarı (yeni eklenen ürün otomatik düşsün)
- [x] robots/middleware feed'e erişimi engellemiyor mu kontrol
- [x] Merchant Center'a ekleme talimatı (README / bu dosya altında)
- [x] Tip kontrolü & lint temiz

## 3. Ödeme (iyzico) İncelemesi

- [x] Akışın uçtan uca incelenmesi (initialize → 3DS/checkout form → callback → verify → webhook)
- [x] Tutar doğrulaması sunucu tarafında mı (client fiyatına güvenilmiyor mu)
- [x] Sepet toplamı = basket item toplamı (iyzico `price` eşitliği), kargo/indirim dahil
- [x] Callback/verify'de ödeme durumunun iyzico'dan tekrar sorgulanması (token doğrulama)
- [x] Webhook imza doğrulaması
- [x] İdempotency: aynı ödemenin iki kez sipariş/stok düşürmemesi
- [x] Stok düşümü ve sipariş durum geçişleri doğru mu
- [x] İade (refund) akışı
- [x] Hata durumları ve fail sayfası yönlendirmesi
- [x] Ortam değişkenleri / sandbox-canlı ayrımı
- [x] Sandbox ile gerçek test (mümkünse) ve sonuç raporu
- [x] Bulunan hataların düzeltilmesi
- [x] Tip kontrolü & lint temiz

## 5. SEO İyileştirmeleri (2. tur)

### Ortak
- [x] Şemaya SEO alanları: Product/Collection `metaTitle`, `metaDescription`; Category `description`, `metaTitle`, `metaDescription`
- [x] Canlı DB için SQL hazır: `prisma/seo_fields_migration.sql`
- [ ] **SQL'i canlı DB'ye uygula (kullanıcı — deploy'dan ÖNCE şart)**

### Ürün tarafı
- [x] Okunabilir URL: `/urun/[slug]`, eski `/product/[id]` → 301 yönlendirme (`?size` korunur)
- [x] Tüm site içi ürün linkleri, sitemap, JSON-LD, Merchant feed linkleri slug URL'ye
- [x] Ürün sayfası içeriği sunucuda render (ilk HTML'de h1, fiyat, açıklama, görseller)
- [x] BÜYÜK HARF ürün adları → başlık/meta/JSON-LD'de Türkçe başlık düzeni
- [x] Admin ürün formuna Meta başlık / Meta açıklama alanları (boşsa otomatik)
- [x] Ürün açıklaması boşsa daha zengin otomatik açıklama
- [x] Tip kontrolü & lint temiz (tsc temiz, değişen dosyalarda eslint hata yok, `npm run build` başarılı)
- [ ] **`prisma/product_slug_cleanup.sql`'i canlı DB'ye uygula (kullanıcı — deploy ile birlikte, önerilir)**

### Kategori / Koleksiyon tarafı
- [x] Kategori & koleksiyon sayfaları sunucuda render (h1, ürün listesi linkleri ilk HTML'de)
- [x] Kategori açıklama metni (sayfa altı SEO metni) — admin'den girilebilir
- [x] Admin kategori & koleksiyon formlarına Meta başlık / Meta açıklama
- [x] Anasayfa ürün/kategori bölümleri ilk HTML'de link içeriyor mu kontrol
- [x] CollectionPage + ItemList JSON-LD (kategori & koleksiyon), olmayan kategori/koleksiyon → 404
- [x] Tip kontrolü & lint temiz (kendi dosyalarım; tsc'deki kalan hatalar ürün tarafının devam eden dosyalarında)

### Kategori içerikleri
- [x] Kategoriye "Sayfa başlığı (H1)" alanı (şema + admin + sayfa; boşsa kategori adı)
- [x] 6 aktif kategori için H1, meta başlık, meta açıklama, SEO metni → `prisma/category_seo_content.sql`
- [x] Sanal kategoriler (Yeni Sezon, İndirimdekiler, Haftanın Ürünleri) için H1/meta/SEO metni (kodda, `src/lib/catalog.ts`)
- [ ] **`prisma/category_seo_content.sql` canlı DB'ye uygula (kullanıcı)**
- [ ] Gömlek, Müslim Keten, Tişört ürünleri için kategori kaydı aç (şu an kategori sayfaları yok)

### Ürün açıklamaları
- [x] Boş açıklamalı ürünler için taslak açıklama dosyası (inceleme sonrası uygulanır) — `prisma/aciklama-taslaklari.json` + `prisma/apply-descriptions.ts` (9 ürün / 3 model; uygulama kullanıcıda: `--apply`)

## 6. SEO Denetimi (tarama + Lighthouse) — 2026-10-08

### Ölçüm (yerel prod build, mobil Lighthouse)
| Sayfa | Performans | Erişilebilirlik | En İyi Uygulamalar | SEO |
|---|---|---|---|---|
| Anasayfa | 80–84 | 92 | 100 | 100 |
| Ürün | 86–92 | 96 | 100 | 100 |
| Kategori | 88–90 | 94 | 100 | 100 |
| Hakkımızda | 94 | 98 | 100 | 100 |

Tarama: 108 sitemap URL'si — hepsi 200, hepsinde title + description + canonical + tek H1; eksik/çok uzun açıklama yok; kopya açıklama yok.

### Yapılanlar
- [x] Anasayfa HTML 2,9 MB → 1,3 MB (renk görselleri sabit boyut; gzip ~55 KB)
- [x] Ürün görselleri Cloudinary üzerinden boyutlandırılıp WebP/AVIF (ör. 142 KB → 16 KB); Vercel görsel kotası harcanmaz
- [x] Hero görseli optimize + preload (113 KB → 48 KB, yükleme gecikmesi 1,5 sn → 0)
- [x] Uzun ürün başlıklarında marka eki düşürülür (Google'da kesilmesin); renk alanı tekrarları temizlendi
- [x] Ürün meta açıklamaları her renk için benzersiz + BÜYÜK HARF açıklamalar cümle düzenine çevrilir
- [x] Hakkımızda / İletişim sunucuda render (H1 ve içerik ilk HTML'de)
- [x] Ürünsüz koleksiyonlar otomatik noindex + sitemap dışı
- [x] Sepetteki kırık `/kategoriler` linki düzeltildi

### Müşteri tarafı (admin'den)
- [ ] Aynı adlı iki ürün: `lacivert-baggy-kumas-pantolon` ve `-2` → birini pasife al (kopya içerik)
- [ ] Boş koleksiyonlar: `deneme-koleksiyon` (test), `yaz-koleksyionu` (slug yazım hatası, açıklamada "Keşfetxxx"), `pantolon` → düzelt veya pasife al
- [ ] Kategorisi kapalı 32 aktif ürün (Gömlek 9, Müslim Keten 10, Tişört 13): satışta değilse ürünleri de pasife al (aksi halde sitede ve Merchant feed'de satılmaya devam ediyor); satıştaysa kategoriyi aç
- [ ] Renk alanına ürün adı girilmiş ürünler var (ör. "Haki Yeşil Kumaş Pantolon") → yalnızca renk yaz
- [ ] Etnik desenli eşofman altı açıklaması yalnızca yıkama talimatı → ürün açıklaması ekle
- [ ] Anasayfa hero başlığı "BedirKahveci Styling" (boşluk eksik) → ör. "Bedir Kahveci Styling – Modern Erkek Giyim"
- [ ] (Tasarım kararı) Anasayfadaki ürün sayısını azaltmak mobil hızı artırır (DOM 5.700 öğe; öneri ≤1.500)

## 4. Son Kontrol

- [x] `next build` başarılı
- [x] Değişiklik özeti hazır — **push için onay bekleniyor**

## Notlar

<!-- Ajanlar bulgularını ve manuel yapılması gerekenleri buraya ekler -->

- Feed: Endpoint `src/app/feed/google-merchant.xml/route.ts` + üretici `src/lib/merchant-feed.ts`. URL: `https://www.bedirkahvecistyling.com/feed/google-merchant.xml` (taban adres `NEXT_PUBLIC_SITE_URL`, yoksa www'li adres). robots.ts ve middleware feed'i engellemiyor (middleware matcher yalnızca admin/api yolları) — değişiklik gerekmedi.
- Feed: Fiyatlar DB'de **TL** (kuruş değil; iyzico'ya da TL gidiyor) → `1100.00 TRY`. `oldPrice > price` ise `price=oldPrice`, `sale_price=price`.
- Feed: Her ürün satırı = bir renk; her beden (ProductVariant) ayrı item. `g:id = {productCode}-{BEDEN}` (ör. `333333332-M`), `item_group_id = groupCode` (aynı modelin renk+bedenleri tek grupta). Link `/product/{id}?size={beden}` (ürün sayfası bu parametreyle bedeni seçiyor). Varyantı olmayan ürün tek item (`id=productCode`, stok=Product.stock).
- Feed: `force-dynamic` + `Cache-Control: s-maxage=900, stale-while-revalidate=3600` → yeni aktif ürün/stok değişikliği en geç ~15 dk'da feed'de; build sırasında DB gerekmez, admin route'larına revalidatePath eklemeye gerek kalmadı. DB hatasında 503 (önbelleğe alınmaz).
- Feed: Tamamı BÜYÜK HARF ürün adları/renkler başlıkta Türkçe "Başlık Düzeni"ne çevriliyor (Google ALL CAPS başlıkları reddedebiliyor). Açıklaması boş ürünlere otomatik kısa açıklama yazılıyor — sitede açıklama girmek kaliteyi artırır.
- Feed: Kargo `g:shipping` ShippingSettings'ten (şu an 100 TL, `freeAbove` boş → ücretsiz kargo eşiği yok). Admin'den eşik girilirse feed otomatik kullanır. Koleksiyon "Sepette %X indirim"leri feed fiyatına yansıtılmadı (ürün sayfasında görünen fiyat ile eşleşme şartı nedeniyle).
- Feed: GTIN/barkod alanı yok → `identifier_exists=no`, `mpn=productCode` (varsa varyant sku). Kategori eşlemesi: Pantolon/Eşofman Altı→204, Gömlek/Tişört/Sweatshirt/Hırka/Müslim Keten→212, Ceket/Mont→5598, Eşofman Takımı→5322, bilinmeyen→1604. `product_type = Erkek Giyim > {Kategori}`.
- Feed: Aynı URL Meta/Facebook Commerce Manager katalog "veri akışı" olarak da kullanılabilir (RSS + g: formatını destekliyor).
- Feed: DB'den okunarak (salt-okunur) test edildi: 89 aktif ürün → 369 item, XML well-formed. Canlı Next sunucusunda (dev/build) ayrıca açıp kontrol edilmedi — deploy sonrası URL'yi tarayıcıda açıp doğrulayın.

- SEO: Ortak yardımcılar `src/lib/seo.ts` (getSiteUrl/absoluteUrl, pageMetadata, noIndexMetadata, JSON-LD builder'ları) + `src/components/seo/JsonLd.tsx`. Kanonik taban adres `NEXT_PUBLIC_SITE_URL`, yoksa `https://www.bedirkahvecistyling.com` (sitemap/robots/layout/ürün sayfası artık hep bunu kullanıyor). `base-url.ts` (ödeme/e-posta için APP_BASE_URL) değiştirilmedi.
- SEO: Prod'da `NEXT_PUBLIC_SITE_URL=https://www.bedirkahvecistyling.com` olarak ayarlayın (www'li, sonda / yok).
- SEO: Search Console doğrulaması için env: `GOOGLE_SITE_VERIFICATION` (meta content değeri), opsiyonel `YANDEX_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`. Ayarlanınca `<meta name="google-site-verification">` otomatik eklenir (build/deploy gerekir). Ardından Search Console'a `https://www.bedirkahvecistyling.com/sitemap.xml` gönderin.
- SEO: robots.txt artık `/api/` altında mağazanın client tarafında kullandığı herkese açık uçlara (products, categories, collections, homepage, site-pages, shipping, social, announcement) izin veriyor — aksi halde Googlebot ürün/kategori sayfalarını render edemiyordu (içerik client fetch ile geliyor). Özel sayfalar robots.txt ile değil `noindex` ile kapatıldı; admin yolu robots.txt'den çıkarıldı (gizli yolu ifşa ediyordu), admin layout `noindex,nofollow`. `/arama` disallow. `/feed/` engellenmiyor.
- SEO: Organization + WebSite(SearchAction → `/arama?q=`) JSON-LD anasayfada (Google önerisi; sosyal linkler SocialSettings'ten `sameAs`). Product JSON-LD: fiyat=güncel price (TRY), oldPrice varsa StrikethroughPrice, stok varyant toplamından, sku/mpn=productCode, kargo (ShippingSettings) ve 14 gün iade politikası. Koleksiyon "sepette %X" indirimi fiyata yansıtılmadı (feed ile tutarlı).
- SEO: `/category/en-yeniler` ile `/category/new-season` aynı ürünleri listeliyor → en-yeniler'in canonical'ı new-season; sitemap'te yalnız new-season var.
- SEO: Ürün URL'leri `/product/{id}` (slug route'u desteklenmiyor); canonical ve sitemap bununla tutarlı. Pasif ürün sayfası artık 404 (önceden JSON-LD'li boş sayfa dönüyordu).
- SEO (açık konu): Ürün/kategori/koleksiyon/hakkımızda/iletişim içerikleri client'ta fetch ediliyor; ilk HTML'de h1/ürün metni yok. Google JS render ediyor ama Bing/sosyal botlar için SSR'a geçmek (server'da veriyi çekip client bileşene prop olarak vermek) ileride önerilir.
- SEO (açık konu): `kvkk`, `mesafeli-satis-*` sayfalarında önceden var olan `react/no-unescaped-entities` lint hataları var (içerik metinlerinde tırnak) — bu iş kapsamında dokunulmadı.

- Ödeme (KRİTİK, düzeltildi): `iyzico-payment.ts` ödemeyi `status === "success" || paymentStatus === "SUCCESS"` ile başarılı sayıyordu. `status` sadece API çağrısının başarısını gösterir → başarısız/ödenmemiş form da PAID işaretlenebiliyor, stok düşülüp onay maili gidiyordu (herkese açık `/api/payment/iyzico/verify` ile token'la tetiklenebilirdi). Artık `status==="success" && paymentStatus==="SUCCESS"` + basketId/conversationId/token/para birimi ve `paidPrice >= totalPrice` kontrolü + fraudStatus (0 → incelemede, -1 → başarısız) şart.
- Ödeme: Sepet kalemleri artık indirimli satır tutarlarıyla gönderiliyor (`price == paidPrice == sum(basketItems)`), 0 TL kalem gönderilmiyor, fiyatlar SDK formatında (`"100.0"`). Adet doğrulaması eklendi (tam sayı, 1–20; negatif/ondalık adetle toplam düşürülebiliyordu), aynı varyant satırları birleştiriliyor, conversationId artık benzersiz (orderNumber; önce `conv_${Date.now()}` çakışabiliyordu). iyzico başlatma reddedilirse sipariş FAILED oluyor; 500 yanıtlarında iç hata mesajı dönmüyor.
- Ödeme: Stok düşümü tek seferlik (PENDING/FAILED → PAID koşullu claim) ve koşullu (`stock >= adet`) — stok asla negatife düşmez; ödeme sonrası stok yetmezse sipariş yine PAID olur ve log'a "manuel kontrol gerekli" yazılır (önceden transaction patlıyor, para çekilmiş müşteri hata sayfası görüyor, sipariş PENDING kalıyordu). Mail artık tek yerden (claim'i kazanan istek) gönderiliyor.
- Ödeme: Callback artık 303 ile success/fail'e yönlendiriyor (HTML meta-refresh yerine); GET de destekleniyor. Fail sayfası callback'in gönderdiği gerçek reason değerlerini (FAILED/PENDING/REVIEW/MISMATCH/...) gösteriyor. Success sayfası sepeti yalnızca `orderNumber` ile gelindiğinde temizliyor.
- Ödeme: Webhook, gövdedeki status'a güvenmeden iyzico'dan tekrar sorguluyor (X-IYZ-SIGNATURE-V3 HMAC doğrulaması korunuyor). iyzico panelinde webhook URL: `https://<canlı-alan-adı>/api/payment/iyzico/webhook`.
- Ödeme (iade, düzeltildi): Tam tutar ilk ürünün paymentTransactionId'sine iade ediliyordu → çok ürünlü siparişte iyzico reddeder. Yeni `src/lib/iyzico-refund.ts`: ödeme bazlı Refund V2 (`/v2/payment/refund`, paymentId), olmazsa ürün bazlı yedek; stok `stockRestored` claim'i ile tek sefer. Admin'den APPROVED/SHIPPED/DELIVERED sipariş iptal edilince iade YAPILMIYORDU (sadece PAID'de) ve PENDING sipariş iptalinde stok yanlışlıkla artırılıyordu — ikisi de düzeltildi. `sync-order-refund` artık sadece ödenmiş siparişlerde stok iade ediyor.
- Ödeme (MANUEL): `.env`'deki iyzico SANDBOX anahtarları geçersiz — resmi iyzipay SDK ile de `errorCode 1000 "Geçersiz imza"` dönüyor. sandbox-merchant.iyzipay.com → Ayarlar'dan API/Secret anahtarlarını yeniden kopyalayın; canlıda Vercel env'inde `IYZICO_BASE_URL=https://api.iyzipay.com` + canlı anahtarlar olmalı.
- Ödeme (MANUEL): Vercel'de `APP_BASE_URL` sitenin kanonik adresi olmalı (ör. `https://www.bedirkahvecistyling.com`, www'li/www'siz yönlendirme hedefiyle aynı). Yoksa callbackUrl `NEXT_PUBLIC_SITE_URL`'e, o da yoksa localhost'a düşer. 301/302 domain yönlendirmesi iyzico'nun POST'unu GET'e çevirip token'ı kaybettirir.
- Ödeme (açık konu): OrderItem'da variantId yok; stok productId+beden ile bulunuyor (aynı üründe aynı beden iki kez tanımlıysa ilki düşülür). Stok yetmezliği için admin'e görünür bir alan (ör. `adminNote`) eklemek önerilir — şu an sadece sunucu log'unda.

- Kategori SEO: Kategori (`/category/[slug]`) ve koleksiyon (`/collections/[slug]`) sayfaları artık sunucuda veri çekiyor (`src/lib/catalog.ts`, `cache()` ile generateMetadata ile paylaşılıyor) ve client bileşene prop veriyor → ilk HTML'de h1, ürün linkleri (`productPath(slug, id)` + kategoride `?from=`), ad, fiyat, `alt`'lı görseller var. Sıralama client'ta (`src/lib/listing-sort.ts`), koleksiyon "sepette %X" rozetleri sunucuda hesaplanıyor. Olmayan/pasif kategori ve koleksiyon artık `notFound()` → not-found sayfası + `noindex` (önce boş sayfa indexlenebiliyordu). Not: root/kategori `loading.tsx` Suspense'i nedeniyle HTTP durum kodu yine 200 (soft 404, noindex ile güvenli). Sayfalar `generateStaticParams() => []` + `revalidate=60` ile artık ISR (build'de DB gerekmez).
- Kategori SEO: JSON-LD = BreadcrumbList + `CollectionPage` (mainEntity: ItemList, ilk 60 ürün, ürün URL'leri `productPath`). Yardımcılar `seo.ts`: `itemListJsonLd`, `collectionPageJsonLd`, `customTitle`, `textToParagraphs`, `cleanSeoText`.
- Kategori SEO: Meta öncelik sırası — başlık: `metaTitle` (marka adı yoksa "… | Bedir Kahveci Styling" eklenir) → otomatik; açıklama: `metaDescription` → `description` (kategori SEO metni / koleksiyon açıklaması) → otomatik metin.
- Kategori SEO: Admin → Kategoriler listesinde her satıra **"SEO"** butonu eklendi (`/categories/{id}/edit` sayfası listeden erişilemiyordu): "Kategori açıklaması (SEO metni)" (sayfada ürünlerin altında "{Kategori} Hakkında" başlığıyla, boş satır = yeni paragraf), Meta başlık (60 sayaç), Meta açıklama (160 sayaç). Liste içi hızlı düzenleme SEO alanlarına dokunmaz. Koleksiyon formunda "SEO" bölümü. Ortak bileşen: `src/components/admin/SeoMetaFields.tsx` (ürün formunda da kullanılabilir).
- Kategori SEO: SEO kolonları DB'de yoksa (migration uygulanmadan) mağaza kategori/koleksiyon sayfaları çökmez; SEO alanları olmadan devam eder (P2022 yedeği, log'a uyarı). Admin'de bu alanları KAYDETMEK ise migration'dan sonra çalışır. Anasayfa koleksiyon sorgusu ve `/api/collections/[slug]` açık `select`'e çevrildi (yeni kolonlara bağımlı değil).
- Kategori SEO (MANUEL): Migration sonrası admin'den en azından ana kategorilere (Ceket, Pantolon, Gömlek, Sweatshirt…) 150–300 kelimelik özgün açıklama metni girin; koleksiyonlara açıklama + meta alanları. Şu an tüm koleksiyonlar boş (0 ürün) ve slug'ı yazım hatalı olan `yaz-koleksyionu` var — ürün eklenmeyecekse pasife alın (boş liste sayfaları zayıf içerik sayılır).
- Kategori SEO: Anasayfa zaten sunucuda render ediliyor (ürün slider'ları, kategori/koleksiyon kartları ilk HTML'de `<a href>` olarak var; tek h1 = hero başlığı). Hero başlığı şu an "BedirKahveci Styling" — admin → Anasayfa ayarlarından "Bedir Kahveci Styling – Modern Erkek Giyim" gibi anahtar kelimeli bir başlık önerilir.

- Ürün SEO: Kanonik ürün adresi artık `/urun/{slug}` (Product.slug) — yukarıdaki "Ürün URL'leri /product/{id}" notu geçersiz. Tek yardımcı: `productPath(slug, id?, query?)` — `src/lib/product-url.ts` (seo.ts'den de export). Slug yoksa `/product/{id}`'e düşer. ProductCard'a `slug` prop'u eklendi; kategori/koleksiyon tarafı `src/lib/catalog.ts`'de `productPath(row.slug, row.id)` kullanıyor (yalnız o satır değiştirildi).
- Ürün SEO: Eski `/product/{id}` artık route handler (`src/app/product/[id]/route.ts`): gerçek **308** → `/urun/{slug}`, sorgu (`?size=`, `?from=`) korunur; ürün yok/pasif → 404. `/urun/{sayısal-id}` ve normalize edilmiş eşleşmeler (büyük harf/Türkçe karakter/boşluk farkı) da kanonik slug'a yönlenir.
- Ürün SEO (önemli bulgu): Kök `src/app/loading.tsx` her sayfayı Suspense ile stream ettiği için sayfa içinden yapılan `notFound()`/`redirect()` HTTP 404/308 değil **200 + noindex** / **meta refresh** olarak dönüyor (botlar dahil; tüm site için geçerli — kategori/koleksiyon dahil). Kanonik linkler hiç bu yolları kullanmadığından ürün tarafında sorun yok; gerçek status kodları istenirse kök loading.tsx kaldırılmalı/route group'a taşınmalı.
- Ürün SEO: DB'deki 89 slug'ın 20'si bozuk (boşluk/BÜYÜK HARF/Türkçe karakter: "GÖMLEK", "SU YEŞİLİ GÖMLEK" …), birçoğu anlamsız ("gomlek-1", "penye4", "pantolon"). Kod bunlarla da çalışır (URL encode edilir) ama **`prisma/product_slug_cleanup.sql`** (47 UPDATE, salt-okunur sorguyla üretildi, tekrar çalıştırılabilir) okunabilir slug'lara çevirir: ad (+ aynı adlı ürünlerde renk), ör. `rtr-beyaz-keten-gomlek`, `oversize-oysho-basic-tisort-siyah`. /urun adresleri henüz yayında olmadığından şimdi uygulamak hiçbir linki kırmaz.
- Ürün SEO: Admin slug kuralları: oluştururken slug boşsa/otomatik öneriyse addan üretilir, çakışırsa renk sonra -2 eklenir; elle farklı slug girilirse benzersiz olmalı. Düzenlemede ad değişince slug artık otomatik DEĞİŞMİYOR (önceden değişiyordu) — "Ad + renkten üret" butonu var, slug değiştirilirse uyarı gösteriliyor. **Slug değişirse eski /urun/{eski} linki 404 olur** (slug geçmişi tablosu yok; /product/{id} linkleri her zaman çalışır). PATCH artık slug'ı normalize ediyor (bozuk slug'ların kaynağı buydu).
- Ürün SEO: Ürün sayfası SSR + ISR (60 sn, `generateStaticParams=[]` → ilk istekte üretilir). İlk HTML'de h1, fiyat, eski fiyat, açıklama, tüm görseller (alt: "Ad - Renk", "… - görsel N"), beden butonları, breadcrumb linkleri, diğer renk linkleri, "Benzer Ürünler" (aynı kategori, 4 ürün, iç link) ve koleksiyon "Sepette %X" etiketi var. Client yalnızca etkileşim + arka planda güncel stok/fiyat tazeleme yapıyor (`/api/products/{id}`). `?size`/`?from` useSearchParams yerine hydrate sonrası okunuyor (useSearchParams ISR'da içeriği CSR'a düşürürdü). Sepet/favori/son görüntülenen (localStorage) UI'ı hydration uyuşmazlığı olmasın diye hydrate sonrası gösteriliyor.
- Ürün SEO: title/OG/Twitter/JSON-LD name/JSON-LD breadcrumb'da BÜYÜK HARF adlar Türkçe başlık düzenine çevriliyor (`normalizeCaps` → `src/lib/text.ts`, feed de buradan kullanıyor; "RTR" gibi sesli harfsiz kısaltmalar büyük kalır, ASCII I ile yazılmış OVERSIZE/BASIC gibi yabancı kelimeler "Oversıze" olmaz). Sayfadaki görünen h1 değişmedi.
- Ürün SEO: Meta başlık/açıklama: admin'de girilirse kullanılır (başlıkta marka yoksa "| Bedir Kahveci Styling" eklenir), boşsa otomatik. Açıklama boş ürünlerde otomatik metin (sayfada da gösteriliyor, "Açıklama bulunmuyor." yerine): "{Ad} — {Renk} renk. Bedir Kahveci Styling erkek {kategori} koleksiyonundan. S, M ve L beden seçenekleriyle 800 TL. Güvenli ödeme ve 14 gün içinde kolay iade." (malzeme iddiası yok; renk/kategori adda geçiyorsa tekrar edilmiyor). Ek meta: product:brand/availability/condition/price/retailer_item_id; JSON-LD'ye url, inProductGroupWithID eklendi; ana görsel `preload`.
- Ürün SEO: Migration öncesi güvenlik: ürün sayfası, admin GET/POST/PATCH metaTitle/metaDescription kolonları DB'de yoksa (P2022) bu alanlar olmadan çalışmaya devam ediyor (`src/lib/db-errors.ts`). Ana sayfa bileşenleri (ProductSection, DiscountedProducts, /api/products/discounted) `include` → `select`'e çevrildi; artık tüm kolonları çekmediği için migration öncesi patlamıyor. Ürün listesindeki hızlı düzenleme formu meta alanları göndermiyor → PATCH bu alanlara dokunmuyor.
- Ürün SEO: Eski sepet/favori/son görüntülenen kayıtlarında (localStorage) slug yok → linkleri `/product/{id}` üzerinden yönlenir; yeni eklenenler slug saklıyor.

### Merchant Center kurulumu (Feed)

1. merchant.google.com → işletme bilgileri: ülke **Türkiye**, para birimi **TRY**, web sitesi `https://www.bedirkahvecistyling.com` → site sahipliğini doğrulayıp **hak talebinde bulunun** (Search Console ile aynı Google hesabı en kolayı).
2. **Ürünler → Veri kaynakları → Ürün kaynağı ekle → "Dosya ekle" → "Dosya URL'si girin"**: `https://www.bedirkahvecistyling.com/feed/google-merchant.xml`. Hedef ülke Türkiye, dil Türkçe. Getirme sıklığı **Günlük** (saat: gece, ör. 03:00 Europe/Istanbul). İlk yüklemeyi hemen "Şimdi getir" ile başlatın.
3. **Kargo ve iade ayarları**: Gönderim hizmeti ekleyin (Türkiye, TRY, kargo ücreti 100 TL veya sitedeki ücretsiz kargo eşiği; teslimat süresi ör. işlem 1–2 gün + kargo 1–3 gün). Feed'deki `g:shipping` ücreti hesap ayarını ürün bazında geçersiz kılar; ikisini tutarlı tutun.
4. **İade politikası**: 14 gün, iade adresi/yöntemi ve iade kargo ücreti — `/iade-ve-degisim` sayfasıyla birebir aynı olmalı.
5. İşletme bilgileri: iletişim e-postası/telefon, adres, ödeme yöntemleri (iyzico/kredi kartı). Sitede iletişim bilgileri, iade ve gizlilik sayfaları görünür olmalı (Google "yanlış beyan" incelemesi için).
6. Ücretsiz listelemeler (Free listings) programını etkinleştirin; reklam için Google Ads hesabını bağlayın.
7. 24–72 saat sonra **Ürünler → Teşhis** ekranından onaylanmayan ürünleri/uyarıları kontrol edin (ör. görsel kalitesi, eksik açıklama).
