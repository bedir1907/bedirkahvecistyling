import { prisma } from "@/lib/prisma"
import { productPath } from "@/lib/product-url"

/**
 * Eski ürün adresi `/product/{id}` → kalıcı (308) yönlendirme ile `/urun/{slug}`.
 * Sorgu parametreleri (ör. Merchant feed'deki `?size=M`, kategori `?from=`) korunur.
 * Ürün yoksa / pasifse 404.
 */
const NOT_FOUND_HTML = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Ürün bulunamadı</title></head><body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:16px;text-align:center"><div><h1 style="font-size:22px;font-weight:600">Ürün bulunamadı</h1><p style="color:#666">Aradığınız ürün yayından kaldırılmış olabilir.</p><p><a href="/" style="color:#000">Anasayfaya dön</a></p></div></body></html>`

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const productId = Number(id)

  const product =
    Number.isInteger(productId) && productId > 0
      ? await prisma.product.findUnique({
          where: { id: productId },
          select: { slug: true, isActive: true },
        })
      : null

  if (!product || !product.isActive || !product.slug) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
    })
  }

  const source = new URL(request.url)
  const target = `${productPath(product.slug)}${source.search}`

  return new Response(null, {
    status: 308,
    headers: {
      Location: target,
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

export const HEAD = GET
