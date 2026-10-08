-- Kategori SEO içerikleri: H1 (heading), meta başlık, meta açıklama ve sayfa altı SEO metni.
-- Güvenli: hiçbir şey silmez; yalnızca BOŞ olan alanları doldurur (admin'den girilmiş değerlere dokunmaz).
-- Tekrar çalıştırmak zararsızdır.
-- Uygulama: npx prisma db execute --file prisma/category_seo_content.sql

BEGIN;

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "heading" TEXT;

-- ── Pantolon ────────────────────────────────────────────────────────────────
UPDATE "Category" SET
  "heading"         = COALESCE(NULLIF(TRIM("heading"), ''), $t$Erkek Baggy Kumaş Pantolon$t$),
  "metaTitle"       = COALESCE(NULLIF(TRIM("metaTitle"), ''), $t$Erkek Baggy Kumaş Pantolon Modelleri$t$),
  "metaDescription" = COALESCE(NULLIF(TRIM("metaDescription"), ''), $t$Erkek baggy kumaş pantolon modelleri: siyah, lacivert, haki, vizon ve kahverengi renklerde rahat kesim. Güvenli ödeme ve 14 gün kolay iade.$t$),
  "description"     = COALESCE(NULLIF(TRIM("description"), ''), $t$Bedir Kahveci Styling erkek pantolon koleksiyonu, rahat kesimi şık bir duruşla buluşturan baggy kumaş pantolonlardan oluşur. Geniş kalıp gün boyu hareket özgürlüğü sağlarken dökümlü kumaş, pantolona hem tişörtle hem gömlekle uyum sağlayan derli toplu bir görünüm kazandırır.

Siyah, lacivert, haki yeşil, vizon, kahverengi ve krem renk seçenekleriyle tek bir modelle gardırobunu zenginleştirebilirsin. Koyu tonlar ofis ve akşam kombinlerinde klasik bir hava yaratırken toprak tonları hafta sonu stillerinde oversize tişört, keten gömlek ya da sweatshirt ile rahat ve modern bir görünüm sunar.

Baggy kumaş pantolonu sneaker ile spor, loafer ile daha şık kombinleyebilirsin. Beden seçimi için ürün sayfasındaki beden rehberine göz atabilir, siparişini güvenli ödeme ile tamamlayabilirsin. Tüm ürünlerde 14 gün içinde kolay iade ve değişim imkânı vardır.$t$),
  "updatedAt"       = NOW()
WHERE "slug" = 'pantolon';

-- ── Ceket ───────────────────────────────────────────────────────────────────
UPDATE "Category" SET
  "heading"         = COALESCE(NULLIF(TRIM("heading"), ''), $t$Erkek Ceket ve Mont Modelleri$t$),
  "metaTitle"       = COALESCE(NULLIF(TRIM("metaTitle"), ''), $t$Erkek Ceket ve Mont Modelleri$t$),
  "metaDescription" = COALESCE(NULLIF(TRIM("metaDescription"), ''), $t$Erkek deri ceket, kadife mont, bomber ve mevsimlik ceket modelleri. Siyah, lacivert, bej ve kahve tonlarında şık dış giyim, 14 gün kolay iade.$t$),
  "description"     = COALESCE(NULLIF(TRIM("description"), ''), $t$Erkek ceket ve mont koleksiyonumuz, mevsim geçişlerinden soğuk günlere kadar her ihtiyaca uygun dış giyim parçalarını bir araya getirir. Deri ceket ve montlar, kadife montlar, bomber ceketler, kapitone modeller ve mevsimlik yağmurluklar arasından tarzına en uygun olanı seçebilirsin.

Fermuar detaylı deri ceketler kombinlere güçlü ve karakterli bir duruş katarken kadife montlar daha yumuşak ve sofistike bir görünüm sunar. Mevsimlik ceket ve bomber modeller ise baharda ve sonbaharda tişört, sweatshirt ya da gömlek üzerine rahatça kullanılabilir.

Siyah, lacivert, bej, bordo ve kahve gibi kolay kombinlenen renklerde sunulan ceketleri baggy pantolon, eşofman altı ya da jean ile tamamlayabilirsin. Beden seçimi için ürün sayfasındaki beden rehberini inceleyebilir, güvenli ödeme ile sipariş verebilirsin. Tüm ürünlerde 14 gün içinde kolay iade ve değişim imkânı vardır.$t$),
  "updatedAt"       = NOW()
WHERE "slug" = 'ceket';

-- ── Sweatshirt ──────────────────────────────────────────────────────────────
UPDATE "Category" SET
  "heading"         = COALESCE(NULLIF(TRIM("heading"), ''), $t$Erkek Oversize Sweatshirt ve Hoodie$t$),
  "metaTitle"       = COALESCE(NULLIF(TRIM("metaTitle"), ''), $t$Erkek Oversize Sweatshirt ve Hoodie$t$),
  "metaDescription" = COALESCE(NULLIF(TRIM("metaDescription"), ''), $t$Erkek oversize sweatshirt ve hoodie modelleri: nakışlı, baskılı ve polo yaka seçenekleri ekru ve siyah renklerde. Güvenli ödeme, 14 gün kolay iade.$t$),
  "description"     = COALESCE(NULLIF(TRIM("description"), ''), $t$Erkek sweatshirt koleksiyonumuz, rahat oversize kesimi sokak stiliyle birleştiren modellerden oluşur. Kapüşonlu hoodie'ler, polo yaka sweatshirtler, double sleeve modeller ile nakış ve baskı detaylı tasarımlar arasından günlük stiline uygun olanı seçebilirsin.

Oversize kalıp, düşük omuz ve bol gövdesiyle hem rahat hem de modern bir siluet oluşturur. Ekru ve siyah gibi kolay kombinlenen renkler; baggy pantolon, eşofman altı ya da jean ile sade ama dikkat çekici kombinler kurmanı sağlar. Serin havalarda ceket ya da mont altında katmanlı kullanıma da uygundur.

Oversize modellerde normal bedenini seçmen bol ve rahat bir görünüm sağlar; daha oturan bir kalıp için ürün sayfasındaki beden rehberine göz atabilirsin. Tüm ürünlerde güvenli ödeme ve 14 gün içinde kolay iade ve değişim imkânı vardır.$t$),
  "updatedAt"       = NOW()
WHERE "slug" = 'sweatshirt';

-- ── Eşofman Altı ────────────────────────────────────────────────────────────
UPDATE "Category" SET
  "heading"         = COALESCE(NULLIF(TRIM("heading"), ''), $t$Erkek Baggy Eşofman Altı$t$),
  "metaTitle"       = COALESCE(NULLIF(TRIM("metaTitle"), ''), $t$Erkek Baggy Eşofman Altı Modelleri$t$),
  "metaDescription" = COALESCE(NULLIF(TRIM("metaDescription"), ''), $t$Erkek baggy eşofman altı modelleri: 3 iplik, etnik desenli ve şeritli seçenekler siyah, gri, lacivert ve bej renklerde. 14 gün kolay iade.$t$),
  "description"     = COALESCE(NULLIF(TRIM("description"), ''), $t$Erkek eşofman altı koleksiyonumuz, konforu günlük stilden ödün vermeden sunan baggy kesim modellerden oluşur. 3 iplik baggy eşofman altları, etnik desenli modeller ve şeritli tasarımlar evde, sokakta ya da spor sonrası rahatça kullanabileceğin parçalardır.

Geniş kalıp ve rahat bel yapısı gün boyu hareket özgürlüğü sağlar. Siyah, gri, lacivert ve bej gibi temel renkler oversize sweatshirt, hoodie ya da basic bir tişörtle kolayca kombinlenir; sneaker ile tamamladığında modern bir sokak stili elde edersin.

Üst parçasıyla birlikte giymek istersen eşofman takımı modellerimize de göz atabilirsin. Beden seçimi için ürün sayfasındaki beden rehberini inceleyebilir, güvenli ödeme ile siparişini tamamlayabilirsin. Tüm ürünlerde 14 gün içinde kolay iade ve değişim imkânı vardır.$t$),
  "updatedAt"       = NOW()
WHERE "slug" = 'esofman-alti';

-- ── Kapşonlu Hırka ──────────────────────────────────────────────────────────
UPDATE "Category" SET
  "heading"         = COALESCE(NULLIF(TRIM("heading"), ''), $t$Erkek Fermuarlı Kapşonlu Hırka$t$),
  "metaTitle"       = COALESCE(NULLIF(TRIM("metaTitle"), ''), $t$Erkek Fermuarlı Kapşonlu Hırka$t$),
  "metaDescription" = COALESCE(NULLIF(TRIM("metaDescription"), ''), $t$Erkek fermuarlı kapşonlu hırka modelleri: 3 iplik kumaş, rahat kesim, lacivert ve kahverengi renk seçenekleri. Güvenli ödeme ve 14 gün kolay iade.$t$),
  "description"     = COALESCE(NULLIF(TRIM("description"), ''), $t$Fermuarlı kapşonlu hırka, mevsim geçişlerinin ve serin akşamların en pratik parçalarından biridir. Bedir Kahveci Styling kapşonlu hırka modelleri 3 iplik kumaşı ve rahat kesimiyle hem tek başına hem de katmanlı kombinlerde kullanılabilir.

Ön fermuarı sayesinde tişört ya da gömlek üzerine açık giyerek rahat bir görünüm, kapatarak daha derli toplu bir stil elde edebilirsin. Lacivert ve kahverengi gibi kolay kombinlenen renkler; baggy pantolon, eşofman altı ve jean ile uyum sağlar.

Beden seçimi için ürün sayfasındaki beden rehberine göz atabilir, siparişini güvenli ödeme ile tamamlayabilirsin. Tüm ürünlerde 14 gün içinde kolay iade ve değişim imkânı vardır.$t$),
  "updatedAt"       = NOW()
WHERE "slug" = 'kapsonlu-hirka';

-- ── Eşofman Takımı ──────────────────────────────────────────────────────────
UPDATE "Category" SET
  "heading"         = COALESCE(NULLIF(TRIM("heading"), ''), $t$Erkek Eşofman Takımı$t$),
  "metaTitle"       = COALESCE(NULLIF(TRIM("metaTitle"), ''), $t$Erkek Eşofman Takımı Modelleri$t$),
  "metaDescription" = COALESCE(NULLIF(TRIM("metaDescription"), ''), $t$Erkek eşofman takımı modelleri: etnik desenli ve şeritli tasarımlar, rahat kesim üst ve alt bir arada. Güvenli ödeme ve 14 gün kolay iade.$t$),
  "description"     = COALESCE(NULLIF(TRIM("description"), ''), $t$Erkek eşofman takımları, üst ve altın birbirini tamamladığı, kombin düşünmeden giyebileceğin pratik setlerdir. Bedir Kahveci Styling eşofman takımı modelleri etnik desenli ve şeritli tasarımlarıyla rahatlığı dikkat çekici bir stille buluşturur.

Takımı birlikte giyerek derli toplu bir sokak stili oluşturabilir ya da parçaları ayrı ayrı kullanarak gardırobundaki tişört, sweatshirt ve pantolonlarla farklı kombinler kurabilirsin. Sneaker ile tamamladığında günlük kullanım, seyahat ve hafta sonu planları için ideal bir seçenek olur.

Beden seçimi için ürün sayfasındaki beden rehberini inceleyebilir, siparişini güvenli ödeme ile tamamlayabilirsin. Tüm ürünlerde 14 gün içinde kolay iade ve değişim imkânı vardır.$t$),
  "updatedAt"       = NOW()
WHERE "slug" = 'esofman-takimi';

COMMIT;
