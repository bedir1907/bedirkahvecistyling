import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCustomerVerificationEmail(params: {
  to: string
  name: string
  verificationUrl: string
}) {
  const { to, name, verificationUrl } = params

  const result = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: "yildirim.safa96@gmail.com",
    subject: "E-posta adresinizi doğrulayın",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 12px;">Merhaba ${name},</h2>
        <p style="color: #444; line-height: 1.6;">
          Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın.
        </p>
        <div style="margin: 24px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 10px;">
            E-postamı Doğrula
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Bu link 24 saat geçerlidir.
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Buton çalışmazsa bu linki tarayıcıya yapıştırın:
        </p>
        <p style="word-break: break-all; color: #111; font-size: 14px;">
          ${verificationUrl}
        </p>
      </div>
    `,
  })

  console.log("Verification mail result:", result)

  if ((result as any)?.error) {
    console.error("Verification mail error:", (result as any).error)
    throw new Error((result as any).error.message || "Mail gönderilemedi")
  }

  return result
}
export async function sendCustomerResetPasswordEmail(params: {
  to: string
  name: string
  resetUrl: string
}) {
  const { to, name, resetUrl } = params

  const result = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to,
    subject: "Şifre sıfırlama bağlantınız",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 12px;">Merhaba ${name},</h2>
        <p style="color: #444; line-height: 1.6;">
          Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
        </p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 10px;">
            Şifremi Sıfırla
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Bu link 1 saat geçerlidir.
        </p>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          Buton çalışmazsa bu linki tarayıcıya yapıştırın:
        </p>
        <p style="word-break: break-all; color: #111; font-size: 14px;">
          ${resetUrl}
        </p>
      </div>
    `,
  })

  console.log("Reset password mail result:", result)

  if ((result as any)?.error) {
    console.error("Reset password mail error:", (result as any).error)
    throw new Error((result as any).error.message || "Mail gönderilemedi")
  }

  return result
}