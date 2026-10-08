-- Ürün slug temizliği (okunabilir /urun/{slug} adresleri için)
-- Oluşturma: 2026-10-08 — canlı DB'den SALT-OKUNUR okunarak üretildi (89 ürün, 47 değişiklik).
-- Kural: slug = ad (aynı adlı birden çok ürün varsa + adda geçmeyen renk kelimeleri), Türkçe karaktersiz, küçük harf, "-" ile; çakışırsa -2, -3.
-- Eski /product/{id} linkleri slug'dan bağımsız olarak yeni adrese 308 ile yönlenir.
-- /urun/* adresleri henüz yayında olmadığından bu değişiklik indekslenmiş bir linki kırmaz.
-- ÖNEMLİ: Yeni kodu deploy etmeden ÖNCE (veya hemen ardından) bir kez çalıştırın. Tekrar çalıştırmak zararsızdır
-- (WHERE eski slug koşulu nedeniyle yalnızca henüz değişmemiş satırlar güncellenir).
-- Uygulama: Neon/psql konsolunda bu dosyanın içeriğini çalıştırın.

BEGIN;
UPDATE "Product" SET "slug" = 'rtr-beyaz-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 10 AND "slug" = 'GÖMLEK'; -- RTR BEYAZ KETEN GÖMLEK / BEYAZ
UPDATE "Product" SET "slug" = 'rtr-su-yesili-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 11 AND "slug" = 'SU YEŞİLİ GÖMLEK'; -- RTR SU YEŞİLİ KETEN GÖMLEK / SU YEŞİLİ
UPDATE "Product" SET "slug" = 'rtr-bej-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 12 AND "slug" = 'BEJ GÖMLEK'; -- RTR BEJ KETEN GÖMLEK / BEJ
UPDATE "Product" SET "slug" = 'rtr-gri-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 13 AND "slug" = 'GRİ GÖMLEK'; -- RTR GRİ KETEN GÖMLEK / GRİ
UPDATE "Product" SET "slug" = 'rtr-acik-mavi-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 14 AND "slug" = 'AÇIK MAVİ GÖMLEK'; -- RTR AÇIK MAVİ KETEN GÖMLEK / AÇIK MAVİ
UPDATE "Product" SET "slug" = 'rtr-zumrut-yesili-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 15 AND "slug" = 'ZÜMRÜT YEŞİLİ GÖMLEK'; -- RTR ZÜMRÜT YEŞİLİ KETEN GÖMLEK / ZÜMRÜT YEŞİLİ
UPDATE "Product" SET "slug" = 'rtr-siyah-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 16 AND "slug" = 'SİYAH GÖMLEK'; -- RTR SİYAH KETEN GÖMLEK / SİYAH
UPDATE "Product" SET "slug" = 'kiremit-kirmizisi-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 17 AND "slug" = 'KİREMİT KIRMIZISI GÖMLEK'; -- KİREMİT KIRMIZISI KETEN GÖMLEK / KİREMİT KIRMIZISI
UPDATE "Product" SET "slug" = 'rtr-bordo-keten-gomlek', "updatedAt" = NOW() WHERE "id" = 18 AND "slug" = 'BORDO KETEN GÖMLEK'; -- RTR BORDO KETEN GÖMLEK / BORDO
UPDATE "Product" SET "slug" = 'kahverengi-baggy-kumas-pantolon', "updatedAt" = NOW() WHERE "id" = 19 AND "slug" = 'KAHVERENGİ BAGGY KUMAŞ'; -- KAHVERENGİ BAGGY KUMAŞ PANTOLON / KAHVERENGİ
UPDATE "Product" SET "slug" = 'vizon-baggy-kumas-pantolon', "updatedAt" = NOW() WHERE "id" = 20 AND "slug" = 'VİZON KUMAŞ PANTOLON'; -- VİZON BAGGY KUMAŞ PANTOLON / VİZON
UPDATE "Product" SET "slug" = 'lacivert-baggy-kumas-pantolon', "updatedAt" = NOW() WHERE "id" = 21 AND "slug" = 'LACİVER BAGGY KUMAŞ PANTOLON'; -- LACİVERT BAGGY KUMAŞ PANTOLON / LACİVERT
UPDATE "Product" SET "slug" = 'haki-yesil-baggy-kumas-pantolon', "updatedAt" = NOW() WHERE "id" = 22 AND "slug" = 'HAKİ YEŞİL KUMAŞ PANTOLON'; -- HAKİ YEŞİL BAGGY KUMAŞ PANTOLON / HAKİ YEŞİL KUMAŞ PANTOLON
UPDATE "Product" SET "slug" = 'siyah-baggy-kumas-pantolon', "updatedAt" = NOW() WHERE "id" = 23 AND "slug" = 'SİYAH BAGGY KUMAŞ PANTOLON'; -- SİYAH BAGGY KUMAŞ PANTOLON / SİYAH
UPDATE "Product" SET "slug" = 'oversize-oysho-basic-tisort-beyaz', "updatedAt" = NOW() WHERE "id" = 24 AND "slug" = 'TİŞÖRT'; -- OVERSİZE OYSHO BASİC TİŞÖRT / BEYAZ
UPDATE "Product" SET "slug" = 'oversize-oysho-basic-tisort-gri', "updatedAt" = NOW() WHERE "id" = 25 AND "slug" = 'TİŞÖRT GRİ'; -- OVERSİZE OYSHO BASİC TİŞÖRT / GRİ
UPDATE "Product" SET "slug" = 'oversize-oysho-basic-tisort-bej', "updatedAt" = NOW() WHERE "id" = 26 AND "slug" = 'BEJ TİŞÖRT'; -- OVERSİZE OYSHO BASİC TİŞÖRT / BEJ
UPDATE "Product" SET "slug" = 'oversize-oysho-basic-tisort-siyah', "updatedAt" = NOW() WHERE "id" = 27 AND "slug" = 'SİYAH TİŞÖRT'; -- OVERSİZE OYSHO BASİC TİŞÖRT / SİYAH
UPDATE "Product" SET "slug" = 'rtr-desenli-muslim-keten-gomlek-gri', "updatedAt" = NOW() WHERE "id" = 28 AND "slug" = 'GÖMLEK 1'; -- RTR DESENLİ MÜSLİM KETEN GÖMLEK / GRİ
UPDATE "Product" SET "slug" = 'oversize-tisort-beyaz', "updatedAt" = NOW() WHERE "id" = 29 AND "slug" = 'tisort'; -- OVERSIZE TİŞORT / BEYAZ
UPDATE "Product" SET "slug" = 'oversize-tisort-siyah', "updatedAt" = NOW() WHERE "id" = 30 AND "slug" = 'tisort-siyah'; -- OVERSIZE TİŞORT / SİYAH
UPDATE "Product" SET "slug" = 'oversize-tisort-lacivert', "updatedAt" = NOW() WHERE "id" = 31 AND "slug" = 'lacivert-tisort'; -- OVERSIZE TİŞORT / LACİVERT
UPDATE "Product" SET "slug" = 'oversize-tisort-kahverengi', "updatedAt" = NOW() WHERE "id" = 32 AND "slug" = 'kahverengi-tisort'; -- OVERSIZE TİŞORT / KAHVERENGİ
UPDATE "Product" SET "slug" = 'kumas-baggy-pantolon-siyah', "updatedAt" = NOW() WHERE "id" = 33 AND "slug" = 'siyah-pantolon'; -- KUMAŞ BAGGY PANTOLON / SİYAH
UPDATE "Product" SET "slug" = 'kumas-baggy-pantolon-beyaz', "updatedAt" = NOW() WHERE "id" = 34 AND "slug" = 'beyaz-pantolon'; -- KUMAŞ BAGGY PANTOLON / BEYAZ
UPDATE "Product" SET "slug" = 'lacivert-baggy-kumas-pantolon-2', "updatedAt" = NOW() WHERE "id" = 35 AND "slug" = 'pantolon'; -- LACİVERT BAGGY KUMAŞ PANTOLON / LACİVERT
UPDATE "Product" SET "slug" = 'baggy-kumas-krem-pantolon', "updatedAt" = NOW() WHERE "id" = 36 AND "slug" = 'bej-baggy-pantolon'; -- BAGGY KUMAŞ KREM PANTOLON / BEJ
UPDATE "Product" SET "slug" = 'rtr-desenli-muslim-keten-gomlek-buz-mavisi', "updatedAt" = NOW() WHERE "id" = 37 AND "slug" = 'gomlek-1'; -- RTR DESENLİ MÜSLİM KETEN GÖMLEK / BUZ MAVİSİ
UPDATE "Product" SET "slug" = 'rtr-desenli-muslim-keten-gomlek-mavi', "updatedAt" = NOW() WHERE "id" = 38 AND "slug" = 'gomlek-3'; -- RTR DESENLİ MÜSLİM KETEN GÖMLEK / MAVİ
UPDATE "Product" SET "slug" = 'rtr-desenli-muslim-keten-gomlek-bej', "updatedAt" = NOW() WHERE "id" = 39 AND "slug" = 'gomlek-4'; -- RTR DESENLİ MÜSLİM KETEN GÖMLEK / BEJ
UPDATE "Product" SET "slug" = 'rtr-desenli-muslim-keten-gomlek-haki-yesil', "updatedAt" = NOW() WHERE "id" = 40 AND "slug" = 'gomlek-5'; -- RTR DESENLİ MÜSLİM KETEN GÖMLEK / HAKİ YEŞİL
UPDATE "Product" SET "slug" = 'rtr-cizgili-muslim-keten-gomlek-mavi', "updatedAt" = NOW() WHERE "id" = 41 AND "slug" = 'gomlek-cizgili-1'; -- RTR ÇİZGİLİ MÜSLİM KETEN GÖMLEK / MAVİ
UPDATE "Product" SET "slug" = 'rtr-cizgili-muslim-keten-gomlek-bej', "updatedAt" = NOW() WHERE "id" = 42 AND "slug" = 'gomlek-cizgili-2'; -- RTR ÇİZGİLİ MÜSLİM KETEN GÖMLEK / BEJ
UPDATE "Product" SET "slug" = 'rtr-cizgili-muslim-keten-gomlek-siyah', "updatedAt" = NOW() WHERE "id" = 43 AND "slug" = 'gomlek-cizgili-3'; -- RTR ÇİZGİLİ MÜSLİM KETEN GÖMLEK / SİYAH
UPDATE "Product" SET "slug" = 'rtr-cizgili-muslim-keten-gomlek-lacivert', "updatedAt" = NOW() WHERE "id" = 44 AND "slug" = 'gomlek-cizgili-4'; -- RTR ÇİZGİLİ MÜSLİM KETEN GÖMLEK / LACİVERT
UPDATE "Product" SET "slug" = 'rtr-cizgili-muslim-keten-gomlek-bordo', "updatedAt" = NOW() WHERE "id" = 45 AND "slug" = 'gomlek-cizgili-5'; -- RTR ÇİZGİLİ MÜSLİM KETEN GÖMLEK / BORDO
UPDATE "Product" SET "slug" = 'rtr-oversize-penye-tisort-lacivert', "updatedAt" = NOW() WHERE "id" = 46 AND "slug" = 'penye-1'; -- RTR OVERSİZE PENYE TİŞÖRT / LACİVERT
UPDATE "Product" SET "slug" = 'rtr-oversize-penye-tisort-beyaz', "updatedAt" = NOW() WHERE "id" = 47 AND "slug" = 'penye-2'; -- RTR OVERSİZE PENYE TİŞÖRT / BEYAZ
UPDATE "Product" SET "slug" = 'rtr-oversize-penye-tisort-bebe-mavisi', "updatedAt" = NOW() WHERE "id" = 48 AND "slug" = 'penye-3'; -- RTR OVERSİZE PENYE TİŞÖRT / BEBE MAVİSİ
UPDATE "Product" SET "slug" = 'rtr-oversize-penye-tisort-siyah', "updatedAt" = NOW() WHERE "id" = 49 AND "slug" = 'penye4'; -- RTR OVERSİZE PENYE TİŞÖRT / SİYAH
UPDATE "Product" SET "slug" = 'rtr-oversize-penye-tisort-bej', "updatedAt" = NOW() WHERE "id" = 50 AND "slug" = 'penye5'; -- RTR OVERSİZE PENYE TİŞÖRT / BEJ
UPDATE "Product" SET "slug" = 'etnik-desenli-mevsimlik-bomber-ceket', "updatedAt" = NOW() WHERE "id" = 51 AND "slug" = 'ceket-1'; -- ETNİK DESENLİ MEVSİMLİK BOMBER CEKET / Kırmızı
UPDATE "Product" SET "slug" = 'kahve-kadife-mont', "updatedAt" = NOW() WHERE "id" = 55 AND "slug" = 'kadife-mont'; -- KAHVE KADİFE MONT / KAHVERENGİ
UPDATE "Product" SET "slug" = 'fermuarli-kapsonlu-3-iplik-sweatshirt-gri', "updatedAt" = NOW() WHERE "id" = 66 AND "slug" = 'fermuarli-kapsonlu-3-iplik-sweatshirt'; -- FERMUARLI KAPŞONLU 3 İPLİK SWEATSHİRT / GRİ
UPDATE "Product" SET "slug" = 'fermuarli-kapsonlu-3-iplik-sweatshirt-siyah', "updatedAt" = NOW() WHERE "id" = 67 AND "slug" = 'FERMUARLI KAPŞONLU 3 İPLİK SWEATSHİRT'; -- FERMUARLI KAPŞONLU 3 İPLİK SWEATSHİRT / SİYAH
UPDATE "Product" SET "slug" = 'oversize-sweatshirt-kakao-basic', "updatedAt" = NOW() WHERE "id" = 71 AND "slug" = 'oversize-sweatshirt-kako-basic'; -- OVERSİZE SWEATSHİRT KAKAO BASİC / KAKAO
UPDATE "Product" SET "slug" = 'erkek-members-only-baskili-oversize-sweatshirt-ekru', "updatedAt" = NOW() WHERE "id" = 75 AND "slug" = 'erkek-members-only-baskili-oversize-sweatshirt-ekru-erkek-members-only-baskili-oversize-sweatshirt-ekru'; -- Erkek Members Only Baskılı Oversize Sweatshirt Ekru / EKRU
COMMIT;
