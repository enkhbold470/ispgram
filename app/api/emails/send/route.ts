import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'
import { getStudentsForDailyNotification } from '@/lib/db'
import { isAdminEmail } from '@/lib/admin'
import crypto from 'crypto'

// Generate unsubscribe token
function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-in-production'
  const hash = crypto.createHmac('sha256', secret).update(email).digest('hex')
  return Buffer.from(`${email}:${hash}`).toString('base64')
}

// Generate unsubscribe link
function generateUnsubscribeLink(email: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const token = generateUnsubscribeToken(email)
  return `${appUrl}/unsubscribe?token=${encodeURIComponent(token)}`
}

// Create Zoho transporter
const createTransporter = () => {
  if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD) {
    return null
  }

  const port = parseInt(process.env.ZOHO_SMTP_PORT || '587')
  return nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD,
    },
  })
}

export async function POST(request: Request) {
  try {
    console.log('[POST /api/emails/send] Incoming request')
    const { userId } = await auth()
    console.log('[POST /api/emails/send] Authenticated userId:', userId)
    if (!userId) {
      console.log('[POST /api/emails/send] Unauthorized: no userId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const user = await currentUser()
    const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress
    if (!isAdminEmail(userEmail)) {
      console.log('[POST /api/emails/send] Forbidden: not admin email')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { emails, type, subject, body, dailyNotification } = await request.json()
    console.log('[POST /api/emails/send] Request body:', { emails, type, subject, body, dailyNotification })

    // Handle daily notification emails
    if (dailyNotification) {
      let allStudents = await getStudentsForDailyNotification()
      
      // Filter by selected emails if provided
      if (emails && Array.isArray(emails) && emails.length > 0) {
        allStudents = allStudents.filter((student) => emails.includes(student.email))
      }
      
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      if (allStudents.length === 0) {
        return NextResponse.json({ error: 'No students found' }, { status: 400 })
      }

      const transporter = createTransporter()
      if (!transporter) {
        return NextResponse.json({ error: 'Zoho email not configured' }, { status: 500 })
      }

      const fromEmail = process.env.ZOHO_EMAIL || 'noreply@zoho.com'
      let sent = 0
      let failed = 0

      for (const student of allStudents) {
        try {
          // Check if student is subscribed (already filtered in getStudentsForDailyNotification, but double-check)
          const studentRecord = await prisma.student.findUnique({
            where: { email: student.email },
            select: { emailSubscribed: true },
          })

          if (!studentRecord || !studentRecord.emailSubscribed) {
            console.log(`Skipping unsubscribed student: ${student.email}`)
            continue
          }

          let emailBody = ''
          
          if (student.hasEntry && student.voteCount > 0) {
            const entryUrl = `${appUrl}/post/${student.entryId}`
            emailBody = `You got ${student.voteCount} ${student.voteCount === 1 ? 'like' : 'likes'}! Check it out: ${entryUrl}\n\nShare your entry with friends to get more likes!`
          } else if (student.hasEntry) {
            const entryUrl = `${appUrl}/post/${student.entryId}`
            emailBody = `Your entry is live! Share it with friends to get likes: ${entryUrl}\n\nCheck out other entries and vote: ${appUrl}/vote`
          } else {
            emailBody = `Ready to share your adventure? Submit your photo: ${appUrl}/submit\n\nSee what others shared: ${appUrl}/vote`
          }

          const unsubscribeLink = generateUnsubscribeLink(student.email)

          await transporter.sendMail({
            from: `"ISPgram Team" <${fromEmail}>`,
            to: student.email,
            subject: 'Your Daily ISPgram Update',
            html: `
              Hello ${student.name},<br><br>
              ${emailBody.replace(/\n/g, '<br>')}<br><br>
              Best regards,<br>
              ISPgram Team<br><br>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 12px; color: #6b7280;">
                <a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from email notifications</a>
              </p>
            `,
          })
          
          sent++
        } catch (error) {
          console.error(`Failed to send daily notification to ${student.email}:`, error)
          failed++
        }
      }

      return NextResponse.json({
        success: true,
        sent,
        failed,
        total: allStudents.length,
      })
    }

    if (!emails && !type) {
      console.log('[POST /api/emails/send] Missing emails and type')
      return NextResponse.json({ error: 'Either emails array or type is required' }, { status: 400 })
    }

    if (!subject || !body) {
      console.log('[POST /api/emails/send] Missing subject or body')
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 })
    }

    let students: Array<{ email: string; name: string }> = []

    // If emails array is provided, use that directly
    if (emails && Array.isArray(emails) && emails.length > 0) {
      console.log('[POST /api/emails/send] Using provided emails:', emails)
      students = await prisma.student.findMany({
        where: {
          email: {
            in: emails,
          },
          emailSubscribed: true, // Only subscribed users
        },
        select: { email: true, name: true },
      })
      console.log(`[POST /api/emails/send] Found students for emails (${students.length}):`, students)
    } else if (type) {
      // Otherwise use type-based filtering (backward compatibility)
      console.log('[POST /api/emails/send] Using type-based filter:', type)
      switch (type) {
        case 'all':
          students = await prisma.student.findMany({
            where: {
              emailSubscribed: true, // Only subscribed users
            },
            select: { email: true, name: true },
          })
          console.log(`[POST /api/emails/send] "all" students found: ${students.length}`)
          break

        case 'with-entry':
          students = await prisma.student.findMany({
            where: {
              entry: {
                isNot: null,
              },
              emailSubscribed: true, // Only subscribed users
            },
            select: { email: true, name: true },
          })
          console.log(`[POST /api/emails/send] "with-entry" students found: ${students.length}`)
          break

        case 'without-entry':
          students = await prisma.student.findMany({
            where: {
              entry: null,
              emailSubscribed: true, // Only subscribed users
            },
            select: { email: true, name: true },
          })
          console.log(`[POST /api/emails/send] "without-entry" students found: ${students.length}`)
          break

        case 'top-likes':
          const entriesWithVotes = await prisma.entry.findMany({
            include: {
              student: {
                select: { email: true, name: true, emailSubscribed: true },
              },
              votes: true,
            },
          })
          console.log(`[POST /api/emails/send] Entries fetched for "top-likes": ${entriesWithVotes.length}`)

          students = entriesWithVotes
            .filter((entry) => entry.votes.length >= 10 && entry.student?.emailSubscribed)
            .map((entry) => ({
              email: entry.student!.email,
              name: entry.student!.name,
            }))
            .filter((student): student is { email: string; name: string } => student !== null)
          console.log(`[POST /api/emails/send] "top-likes" students filtered: ${students.length}`)
          break

        default:
          console.log('[POST /api/emails/send] Invalid type:', type)
          return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
      }
    }

    if (students.length === 0) {
      console.log('[POST /api/emails/send] No students found with current filter')
      return NextResponse.json({ error: 'No students found' }, { status: 400 })
    }

    const transporter = createTransporter()
    if (!transporter) {
      console.log('[POST /api/emails/send] Zoho email not configured')
      return NextResponse.json({ error: 'Zoho email not configured' }, { status: 500 })
    }

    const emailSubject = subject.trim()
    const emailBody = body.trim()
    const fromEmail = process.env.ZOHO_EMAIL || 'noreply@zoho.com'
    console.log('[POST /api/emails/send] Final email subject and body:', { emailSubject, emailBody, fromEmail })

    let sent = 0
    let failed = 0

    for (const student of students) {
      try {
        console.log(`[POST /api/emails/send] Sending email to: ${student.email} (${student.name})`)
        
        const unsubscribeLink = generateUnsubscribeLink(student.email)
        
        await transporter.sendMail({
          from: `"ISPgram Team" <${fromEmail}>`,
          to: student.email,
          subject: emailSubject,
          html: `
            Hello ${student.name},<br><br>
            ${emailBody.replace(/\n/g, '<br>')}<br><br>
            Best regards,<br>
            ISPgram Team<br><br>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280;">
              <a href="${unsubscribeLink}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from email notifications</a>
            </p>
          `,
        })
        
        sent++
        console.log(`[POST /api/emails/send] Email sent successfully to: ${student.email}`)
      } catch (error) {
        console.error(`[POST /api/emails/send] Failed to send email to ${student.email}:`, error)
        failed++
      }
    }

    console.log('[POST /api/emails/send] Emailing process finished: ', { sent, failed, total: students.length })

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: students.length,
    })
  } catch (error) {
    console.error('[POST /api/emails/send] Error sending emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
