import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = "Bedir Kahveci Styling <info@bedirkahvecistyling.com>"

// ── E-posta doğrulama ─────────────────────────────────────────────────────────
export async function sendCustomerVerificationEmail(params: {
  to: string
  name: string
  verificationUrl: string
}) {
  const { to, name, verificationUrl } = params

  const result = await resend.emails.send({
    from: FROM,
    to, // ← DÜZELTME: sabit adres kaldırıldı, müşteriye gönderiliyor
    subject: "E-posta adresinizi doğrulayın — Bedir Kahveci Styling",
    html: buildEmailHtml({
      title: `Merhaba ${name},`,
      body: "Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın. Bu link <strong>24 saat</strong> geçerlidir.",
      buttonText: "E-postamı Doğrula",
      buttonUrl: verificationUrl,
      footer: "Bu maili siz talep etmediyseniz görmezden gelebilirsiniz.",
    }),
  })

  if ((result as { error?: { message?: string } }).error) {
    const err = (result as { error: { message?: string } }).error
    console.error("Verification mail error:", err)
    throw new Error(err.message || "Mail gönderilemedi")
  }

  return result
}

// ── Şifre sıfırlama ───────────────────────────────────────────────────────────
export async function sendCustomerResetPasswordEmail(params: {
  to: string
  name: string
  resetUrl: string
}) {
  const { to, name, resetUrl } = params

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: "Şifre sıfırlama bağlantınız — Bedir Kahveci Styling",
    html: buildEmailHtml({
      title: `Merhaba ${name},`,
      body: "Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu link <strong>1 saat</strong> geçerlidir.",
      buttonText: "Şifremi Sıfırla",
      buttonUrl: resetUrl,
      footer: "Bu talebi siz yapmadıysanız bu maili dikkate almayın. Şifreniz değiştirilmeyecektir.",
    }),
  })

  if ((result as { error?: { message?: string } }).error) {
    const err = (result as { error: { message?: string } }).error
    console.error("Reset password mail error:", err)
    throw new Error(err.message || "Mail gönderilemedi")
  }

  return result
}

// ── Sipariş onayı ─────────────────────────────────────────────────────────────
type OrderItem = {
  productName: string
  color?: string | null
  size?: string | null
  quantity: number
  price: number
}

export async function sendOrderEmail(params: {
  to: string
  name: string
  orderNumber: string
  total: number
  items?: OrderItem[]
}) {
  const { to, name, orderNumber, total, items } = params

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(n)

  const siteUrl = process.env.APP_BASE_URL || "https://bedirkahvecistyling.com"

  const itemsHtml =
    items && items.length > 0
      ? `
        <table style="width:100%; border-collapse:collapse; margin: 24px 0 0;">
          <tr>
            <td colspan="3" style="padding: 0 0 10px; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#999; font-family:Arial,sans-serif; border-bottom:1px solid #e5e5e5;">
              Sipariş Kalemleri
            </td>
          </tr>
          ${items
            .map(
              (item) => `
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 0; font-size:14px; color:#111; font-family:Arial,sans-serif;">
              ${item.productName}
              ${
                item.size || item.color
                  ? `<br/><span style="font-size:12px; color:#999;">${[item.color, item.size].filter(Boolean).join(" · ")}</span>`
                  : ""
              }
            </td>
            <td style="padding:12px 8px; font-size:13px; color:#666; font-family:Arial,sans-serif; text-align:center; white-space:nowrap;">
              ${item.quantity} adet
            </td>
            <td style="padding:12px 0; font-size:14px; font-weight:600; color:#111; font-family:Arial,sans-serif; text-align:right; white-space:nowrap;">
              ${fmt(item.price * item.quantity)}
            </td>
          </tr>`
            )
            .join("")}
          <tr>
            <td colspan="2" style="padding:14px 0 0; font-size:13px; color:#666; font-family:Arial,sans-serif; font-weight:500;">
              Genel Toplam
            </td>
            <td style="padding:14px 0 0; font-size:16px; font-weight:700; color:#111; font-family:Arial,sans-serif; text-align:right;">
              ${fmt(total)}
            </td>
          </tr>
        </table>`
      : `
        <table style="width:100%; border-collapse:collapse; margin: 24px 0 0;">
          <tr style="border-bottom:1px solid #e5e5e5;">
            <td style="padding:12px 0; color:#666; font-size:14px; font-family:Arial,sans-serif;">Toplam Tutar</td>
            <td style="padding:12px 0; font-weight:700; font-size:16px; color:#111; font-family:Arial,sans-serif; text-align:right;">${fmt(total)}</td>
          </tr>
        </table>`

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Siparişiniz Onaylandı — #${orderNumber}`,
    html: buildOrderConfirmHtml({ name, orderNumber, itemsHtml, siteUrl }),
  })

  if ((result as { error?: { message?: string } }).error) {
    const err = (result as { error: { message?: string } }).error
    console.error("Order mail error:", err)
    throw new Error(err.message || "Mail gönderilemedi")
  }

  return result
}

// ── Kargo bildirimi ───────────────────────────────────────────────────────────
export async function sendShippedEmail(params: {
  to: string
  name: string
  orderNumber: string
  cargoCompanyName: string
  trackingNumber: string
  trackingUrl: string
}) {
  const { to, name, orderNumber, cargoCompanyName, trackingNumber, trackingUrl } = params

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Siparişiniz Kargoya Verildi #${orderNumber} — Bedir Kahveci Styling`,
    html: buildEmailHtml({
      title: `Siparişiniz Yola Çıktı! 🚚`,
      body: `
        Merhaba ${name},<br/><br/>
        <strong>#${orderNumber}</strong> numaralı siparişiniz kargoya verildi.<br/><br/>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666; font-size:14px;">Kargo Firması</td>
            <td style="padding: 10px 0; font-weight:600; font-size:14px; text-align:right;">${cargoCompanyName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-size:14px;">Takip Numarası</td>
            <td style="padding: 10px 0; font-weight:600; font-size:14px; text-align:right;">${trackingNumber}</td>
          </tr>
        </table>
        Kargonuzun durumunu aşağıdaki butona tıklayarak takip edebilirsiniz.
      `,
      buttonText: "Kargo Takibi",
      buttonUrl: trackingUrl,
      footer: "Teslimat hakkında sorularınız için info@bedirkahvecistyling.com adresine yazabilirsiniz.",
    }),
  })

  const err = (result as { error?: { message?: string } }).error
  if (err) {
    console.error("Shipped mail error:", err)
    throw new Error(err.message || "Mail gönderilemedi")
  }

  return result
}

// ── Sipariş onayı HTML ────────────────────────────────────────────────────────
function buildOrderConfirmHtml({
  name,
  orderNumber,
  itemsHtml,
  siteUrl,
}: {
  name: string
  orderNumber: string
  itemsHtml: string
  siteUrl: string
}) {
  const year = new Date().getFullYear()
  const siparisUrl = `${siteUrl}/siparislerim`

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#f5f4f0; font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0; padding:48px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

        <!-- Marka başlığı -->
        <tr>
          <td align="center" style="padding-bottom:36px;">
            <p style="margin:0; font-size:13px; letter-spacing:0.3em; text-transform:uppercase; color:#555; font-weight:600;">
              Bedir Kahveci
            </p>
            <p style="margin:3px 0 0; font-size:9px; letter-spacing:0.45em; text-transform:uppercase; color:#999;">
              Styling
            </p>
          </td>
        </tr>

        <!-- Onay rozeti -->
        <tr>
          <td align="center" style="padding-bottom:24px;">
            <div style="display:inline-block; background:#111; border-radius:50%; width:48px; height:48px; line-height:48px; text-align:center; font-size:22px; color:#ffffff;">
              ✓
            </div>
          </td>
        </tr>

        <!-- Kart -->
        <tr>
          <td style="background:#ffffff; border-radius:16px; padding:40px 40px 36px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">

            <!-- Başlık -->
            <h1 style="margin:0 0 8px; font-size:26px; font-weight:700; color:#111; letter-spacing:-0.02em;">
              Siparişiniz Onaylandı
            </h1>
            <p style="margin:0 0 28px; font-size:15px; color:#666; line-height:1.65;">
              Merhaba <strong>${name}</strong>, siparişiniz başarıyla alındı ve hazırlanmaya başlandı.
            </p>

            <!-- Sipariş özeti -->
            <table style="width:100%; border-collapse:collapse; background:#f9f9f7; border-radius:10px; overflow:hidden; margin-bottom:8px;">
              <tr>
                <td style="padding:14px 18px; font-size:13px; color:#888;">Sipariş Numarası</td>
                <td style="padding:14px 18px; font-size:13px; font-weight:700; color:#111; text-align:right; letter-spacing:0.02em;">
                  #${orderNumber}
                </td>
              </tr>
            </table>

            <!-- Ürünler / Toplam -->
            ${itemsHtml}

            <!-- Ayırıcı -->
            <div style="border-top:1px solid #eeeeee; margin:32px 0 28px;"></div>

            <!-- Kargo bilgisi -->
            <p style="margin:0 0 28px; font-size:14px; color:#555; line-height:1.7; background:#fffbf0; border-left:3px solid #e8b84b; padding:14px 16px; border-radius:0 8px 8px 0;">
              Siparişiniz en kısa sürede kargoya verilecektir. Kargo takip numaranız tarafınıza e-posta ile iletilecektir.
            </p>

            <!-- Buton -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:10px; background:#111;">
                  <a href="${siparisUrl}"
                     style="display:inline-block; padding:14px 30px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:600; letter-spacing:0.04em;">
                    Siparişlerimi Görüntüle
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 0 0; text-align:center;">
            <p style="margin:0 0 6px; font-size:12px; color:#999; line-height:1.7;">
              Sorularınız için
              <a href="mailto:info@bedirkahvecistyling.com" style="color:#555; text-decoration:none;">info@bedirkahvecistyling.com</a>
              adresine yazabilirsiniz.
            </p>
            <p style="margin:0; font-size:11px; color:#bbb;">
              © ${year} Bedir Kahveci Styling · Tirebolu, Giresun
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
  `.trim()
}

// ── HTML Şablon builder ───────────────────────────────────────────────────────
function buildEmailHtml({
  title,
  body,
  buttonText,
  buttonUrl,
  footer,
}: {
  title: string
  body: string
  buttonText: string
  buttonUrl: string
  footer: string
}) {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#f5f4f0; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="margin:0; font-size:11px; letter-spacing:0.35em; text-transform:uppercase; color:#888; font-family: Arial, sans-serif;">
                Bedir Kahveci
              </p>
              <p style="margin:2px 0 0; font-size:8px; letter-spacing:0.4em; text-transform:uppercase; color:#aaa; font-family: Arial, sans-serif;">
                Styling
              </p>
            </td>
          </tr>

          <!-- Kart -->
          <tr>
            <td style="background:#ffffff; border-radius:16px; padding: 40px 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

              <!-- Başlık -->
              <h1 style="margin:0 0 16px; font-size:24px; font-weight:400; color:#111; line-height:1.3;">
                ${title}
              </h1>

              <!-- İçerik -->
              <p style="margin:0 0 28px; font-size:15px; color:#555; line-height:1.7; font-family: Arial, sans-serif;">
                ${body}
              </p>

              <!-- Buton -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="border-radius:10px; background:#111;">
                    <a href="${buttonUrl}"
                       style="display:inline-block; padding:14px 28px; color:#ffffff; text-decoration:none; font-size:14px; font-weight:500; letter-spacing:0.04em; font-family: Arial, sans-serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link yedek -->
              <p style="margin:0 0 8px; font-size:12px; color:#999; font-family: Arial, sans-serif;">
                Buton çalışmazsa bu linki tarayıcıya yapıştırın:
              </p>
              <p style="margin:0; word-break:break-all; font-size:12px; color:#111; font-family: Arial, sans-serif;">
                <a href="${buttonUrl}" style="color:#111;">${buttonUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 0 0; text-align:center;">
              <p style="margin:0 0 6px; font-size:12px; color:#999; font-family: Arial, sans-serif; line-height:1.6;">
                ${footer}
              </p>
              <p style="margin:0; font-size:11px; color:#bbb; font-family: Arial, sans-serif;">
                © ${new Date().getFullYear()} Bedir Kahveci Styling · Tirebolu, Giresun
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}