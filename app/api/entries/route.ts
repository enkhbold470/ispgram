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

    const entries = await prisma.entry.findMany({
      take: limit + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
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

    const hasMore = entries.length > limit
    let data = entries.slice(0, limit).map((entry) => ({
      ...entry,
      voteCount: entry.votes.length,
    }))

    // Sort by votes if requested (after fetching since Prisma doesn't support count sorting easily)
    if (sortBy === 'votes') {
      data = data.sort((a, b) => b.voteCount - a.voteCount)
    }

    return NextResponse.json({
      entries: data,
      nextCursor: hasMore ? entries[limit - 1].id : null,
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching entries:', error)
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
