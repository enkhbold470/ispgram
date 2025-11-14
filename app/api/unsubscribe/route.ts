import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Generate unsubscribe token
function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-in-production'
  const hash = crypto.createHmac('sha256', secret).update(email).digest('hex')
  return Buffer.from(`${email}:${hash}`).toString('base64')
}

// Verify unsubscribe token
function verifyUnsubscribeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [email, hash] = decoded.split(':')
    if (!email || !hash) return null
    
    const secret = process.env.UNSUBSCRIBE_SECRET || 'default-secret-change-in-production'
    const expectedHash = crypto.createHmac('sha256', secret).update(email).digest('hex')
    
    if (hash === expectedHash) {
      return email
    }
    return null
  } catch {
    return null
  }
}

// GET: Unsubscribe page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token && !email) {
    return NextResponse.json({ error: 'Token or email is required' }, { status: 400 })
  }

  let verifiedEmail: string | null = null

  if (token) {
    verifiedEmail = verifyUnsubscribeToken(token)
  } else if (email) {
    // Direct email unsubscribe (for authenticated users)
    verifiedEmail = email
  }

  if (!verifiedEmail) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Check if student exists
  const student = await prisma.student.findUnique({
    where: { email: verifiedEmail },
  })

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  return NextResponse.json({
    email: verifiedEmail,
    name: student.name,
    subscribed: student.emailSubscribed,
  })
}

// POST: Toggle subscription
export async function POST(request: Request) {
  try {
    const { token, email, subscribe } = await request.json()

    let verifiedEmail: string | null = null

    if (token) {
      verifiedEmail = verifyUnsubscribeToken(token)
    } else if (email) {
      verifiedEmail = email
    }

    if (!verifiedEmail) {
      return NextResponse.json({ error: 'Invalid token or email' }, { status: 400 })
    }

    // Update subscription status
    const student = await prisma.student.update({
      where: { email: verifiedEmail },
      data: {
        emailSubscribed: subscribe !== undefined ? subscribe : false,
      },
    })

    return NextResponse.json({
      success: true,
      email: verifiedEmail,
      subscribed: student.emailSubscribed,
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

