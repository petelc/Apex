import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const ENQUIRY_LABELS: Record<string, string> = {
  sales: 'Sales enquiry',
  enterprise: 'Enterprise / custom pricing',
  support: 'Technical support',
  partnership: 'Partnership opportunity',
  press: 'Press / media',
  other: 'Other',
}

export async function POST(request: Request) {
  const body = await request.json()
  const { firstName, lastName, email, company, teamSize, type, message } = body

  if (!firstName || !lastName || !email || !type || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const enquiryLabel = ENQUIRY_LABELS[type] ?? type
  const to = process.env.CONTACT_EMAIL ?? 'hello@apex.io'

  try {
    await resend.emails.send({
      from: 'APEX Contact Form <noreply@apex.io>',
      to,
      replyTo: email,
      subject: `[${enquiryLabel}] New enquiry from ${firstName} ${lastName}`,
      text: [
        `Name:         ${firstName} ${lastName}`,
        `Email:        ${email}`,
        `Company:      ${company || 'N/A'}`,
        `Team size:    ${teamSize || 'N/A'}`,
        `Enquiry type: ${enquiryLabel}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact] Failed to send email:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
