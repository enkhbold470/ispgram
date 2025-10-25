export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.ZOHO_API_KEY) {
    console.warn('ZOHO_API_KEY not set, skipping email')
    return
  }

  const response = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      Authorization: `Zoho-enczapikey ${process.env.ZOHO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        address: process.env.ZOHO_FROM_EMAIL || 'noreply@deanza.edu',
      },
      to: [{ email_address: { address: to } }],
      subject,
      htmlbody: html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Email failed: ${response.statusText}`)
  }

  return response.json()
}

export async function sendWinnerNotification(winner: {
  name: string
  email: string
  voteCount: number
}) {
  return sendEmail({
    to: winner.email,
    subject: '🎃 Congratulations! You won the ISP Halloween Costume Contest!',
    html: `
      <h1>🎉 Congratulations ${winner.name}!</h1>
      <p>You won the De Anza ISP Halloween Costume Contest with <strong>${winner.voteCount} votes</strong>!</p>
      <p>Thank you for participating in ISPGram!</p>
    `,
  })
}
