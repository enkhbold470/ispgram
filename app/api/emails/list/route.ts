import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getStudentsForEmailList } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') || 'all') as 'all' | 'with-entry' | 'without-entry' | 'top-likes'

    if (!['all', 'with-entry', 'without-entry', 'top-likes'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const students = await getStudentsForEmailList(type)

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching email list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
