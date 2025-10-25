import { NextResponse } from 'next/server'
import { sendWinnerNotification } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Optional: Add admin authentication here
    // For now, anyone can trigger this endpoint

    // Find the entry with the most votes
    const entries = await prisma.entry.findMany({
      include: {
        student: true,
        votes: true,
      },
    })

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No entries found' }, { status: 404 })
    }

    // Sort by vote count
    const sorted = entries.sort((a, b) => b.votes.length - a.votes.length)
    const winner = sorted[0]

    if (winner.votes.length === 0) {
      return NextResponse.json({ error: 'No votes cast yet' }, { status: 400 })
    }

    // Send notification email
    await sendWinnerNotification({
      name: winner.student.name,
      email: winner.student.email,
      voteCount: winner.votes.length,
    })

    return NextResponse.json({
      success: true,
      winner: {
        name: winner.student.name,
        voteCount: winner.votes.length,
      },
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

