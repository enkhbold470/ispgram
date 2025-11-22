import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateStudent } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const sortBy = searchParams.get('sortBy') || 'createdAt'

    console.group('🔍 API: Fetching entries')
    console.log('📥 Request params:', { cursor, limit, sortBy })

    // When sorting by votes, fetch ALL entries (no pagination) to ensure accurate ranking
    const shouldFetchAll = sortBy === 'votes' && !cursor

    const entries = await prisma.entry.findMany({
      ...(shouldFetchAll
        ? {} // No limit when fetching all for vote sorting
        : {
            take: limit + 1, // Fetch one extra to check if there are more
            ...(cursor && {
              skip: 1,
              cursor: {
                id: cursor,
              },
            }),
          }),
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        votes: {
          select: {
            id: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('📊 Entries fetched from DB:', entries.length)

    const hasMore = shouldFetchAll ? false : entries.length > limit
    let data = (shouldFetchAll ? entries : entries.slice(0, limit)).map((entry) => ({
      ...entry,
      voteCount: entry.votes.length,
    }))

    console.log('📋 Entries after mapping:', data.length)
    console.log('📊 Vote counts:', data.map(e => ({ id: e.id, name: e.student.name, votes: e.voteCount })))

    // Sort by votes if requested (after fetching since Prisma doesn't support count sorting easily)
    if (sortBy === 'votes') {
      const beforeSort = [...data]
      data = data.sort((a, b) => b.voteCount - a.voteCount)
      console.log('🏆 Top 10 after vote sort:', data.slice(0, 10).map((e, idx) => ({
        rank: idx + 1,
        id: e.id,
        name: e.student.name,
        votes: e.voteCount
      })))
    }

    const response = {
      entries: data,
      nextCursor: hasMore ? entries[limit - 1].id : null,
      hasMore,
    }

    console.log('✅ Response:', {
      entriesCount: response.entries.length,
      hasMore: response.hasMore,
      nextCursor: response.nextCursor
    })
    console.groupEnd()

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error fetching entries:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, name, email, description, photoUrl } = body

    // Validate required fields
    if (!studentId || !name || !email || !photoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, name, email, photoUrl' },
        { status: 400 }
      )
    }

    // Get or create student
    const student = await getOrCreateStudent(userId, studentId, name, email)

    // Check if student already has an entry
    const existingEntry = await prisma.entry.findUnique({
      where: { studentId: student.id },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You have already submitted an entry' },
        { status: 400 }
      )
    }

    // Create entry
    const entry = await prisma.entry.create({
      data: {
        studentId: student.id,
        description,
        photoUrl,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}
