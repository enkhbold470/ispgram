import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

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

    // Get or create student record
    let student = await prisma.student.findUnique({
      where: { clerkId: userId },
    })

    // If student doesn't exist, create a basic record for voting
    if (!student) {
      const user = await currentUser()
      const email = user?.emailAddresses[0]?.emailAddress || ''
      const name = user?.fullName || user?.firstName || 'Anonymous'
      
      student = await prisma.student.create({
        data: {
          clerkId: userId,
          studentId: null,
          name,
          email,
        },
      })
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
