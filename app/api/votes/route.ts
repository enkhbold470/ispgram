import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getStudentByClerkId } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { entryId } = body

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 })
    }

    // Get student record
    const student = await getStudentByClerkId(userId)
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found. Please submit an entry first.' },
        { status: 404 }
      )
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        studentId_entryId: {
          studentId: student.id,
          entryId,
        },
      },
    })

    if (existingVote) {
      // Toggle: Remove the vote
      await prisma.vote.delete({
        where: { id: existingVote.id },
      })

      // Get updated vote count
      const voteCount = await prisma.vote.count({
        where: { entryId },
      })

      return NextResponse.json({
        action: 'removed',
        voteCount,
      })
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          studentId: student.id,
          entryId,
        },
      })

      // Get updated vote count
      const voteCount = await prisma.vote.count({
        where: { entryId },
      })

      return NextResponse.json({
        action: 'added',
        voteCount,
      })
    }
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
