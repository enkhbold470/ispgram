import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStudentsForEmailList } from '@/lib/db'
import { isAdminEmail } from '@/lib/admin'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin access
    const user = await currentUser()
    const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress
    if (!isAdminEmail(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') || 'all') as 'all' | 'with-entry' | 'without-entry' | 'top-likes'
    const subscribedOnly = searchParams.get('subscribedOnly') !== 'false' // Default to true

    if (!['all', 'with-entry', 'without-entry', 'top-likes'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const students = await getStudentsForEmailList(type, subscribedOnly)

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching email list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
