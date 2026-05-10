import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderEmail({
  to,
  name,
  orderNumber,
  total,
}: {
  to: string
  name: string
  orderNumber: string
  total: number
}) {
  const result = await resend.emails.send({
    from: "E-Ticaret <info@bedirkahvecistyling.com>",
    to,
    subject: "Siparişiniz alındı 🎉",
    html: `
      <h2>Teşekkürler ${name}</h2>
      <p>Siparişiniz başarıyla oluşturuldu.</p>
      <p><strong>Sipariş No:</strong> ${orderNumber}</p>
      <p><strong>Tutar:</strong> ₺${total}</p>
      <br/>
      <p>En kısa sürede kargoya verilecektir.</p>
    `,
  })

  console.log("Resend sonucu:", result)

  return result
}