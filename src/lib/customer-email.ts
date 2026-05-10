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

  if ((result as any)?.error) {
    console.error("Verification mail error:", (result as any).error)
    throw new Error((result as any).error.message || "Mail gönderilemedi")
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

  if ((result as any)?.error) {
    console.error("Reset password mail error:", (result as any).error)
    throw new Error((result as any).error.message || "Mail gönderilemedi")
  }

  return result
}

// ── Sipariş onayı ─────────────────────────────────────────────────────────────
export async function sendOrderEmail(params: {
  to: string
  name: string
  orderNumber: string
  total: number
}) {
  const { to, name, orderNumber, total } = params

  const formattedTotal = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(total)

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Siparişiniz alındı #${orderNumber} — Bedir Kahveci Styling`,
    html: buildEmailHtml({
      title: `Teşekkürler ${name}!`,
      body: `
        Siparişiniz başarıyla oluşturuldu ve hazırlanmaya başlandı.<br/><br/>
        <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
          <tr style="border-bottom: 1px solid #e5e5e5;">
            <td style="padding: 10px 0; color: #666; font-size:14px;">Sipariş No</td>
            <td style="padding: 10px 0; font-weight:600; font-size:14px; text-align:right;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666; font-size:14px;">Toplam Tutar</td>
            <td style="padding: 10px 0; font-weight:600; font-size:14px; text-align:right;">${formattedTotal}</td>
          </tr>
        </table>
        En kısa sürede kargoya verilecektir. Kargo takip numaranız tarafınıza ayrıca iletilecektir.
      `,
      buttonText: "Siparişlerimi Görüntüle",
      buttonUrl: `${process.env.APP_BASE_URL || "https://bedirkahvecistyling.com"}/siparislerim`,
      footer: "Sipariş veya teslimat hakkında sorularınız için info@bedirkahvecistyling.com adresine yazabilirsiniz.",
    }),
  })

  if ((result as any)?.error) {
    console.error("Order mail error:", (result as any).error)
    throw new Error((result as any).error.message || "Mail gönderilemedi")
  }

  return result
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