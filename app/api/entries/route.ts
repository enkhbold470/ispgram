import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getEntriesWithVotes, getOrCreateStudent } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const entries = await getEntriesWithVotes()
    return NextResponse.json(entries)
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
