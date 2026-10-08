-- SEO alanları (nullable, geriye dönük uyumlu). Yeni kod deploy edilmeden ÖNCE canlı DB'ye uygulanmalı.
ALTER TABLE "Product"    ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Product"    ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
ALTER TABLE "Category"   ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Category"   ADD COLUMN IF NOT EXISTS "metaTitle" TEXT;
ALTER TABLE "Category"   ADD COLUMN IF NOT EXISTS "metaDescription" TEXT;
