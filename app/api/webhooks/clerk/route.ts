import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getOrCreateStudent } from '@/lib/db'

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Get the webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new NextResponse('Error: CLERK_WEBHOOK_SECRET is not set', {
      status: 500,
    })
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Extract email and name
    const email = email_addresses?.[0]?.email_address || ''
    const name =
      first_name && last_name
        ? `${first_name} ${last_name}`
        : first_name || last_name || 'Anonymous'

    // Create student record in database
    try {
      await getOrCreateStudent(id, null, name, email)
      console.log(`Student created for Clerk user: ${id}`)
    } catch (error) {
      console.error('Error creating student from webhook:', error)
      return new NextResponse('Error creating student', {
        status: 500,
      })
    }
  }

  return new NextResponse('', { status: 200 })
}

