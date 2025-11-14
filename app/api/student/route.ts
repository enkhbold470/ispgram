import { auth, currentUser } from '@clerk/nextjs/server'
import { getStudentByClerkId } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let student = await getStudentByClerkId(userId)

    // Auto-create student record if it doesn't exist (first login)
    if (!student) {
      const user = await currentUser()
      const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress || ''
      const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.firstName || 'Anonymous'
      
      student = await prisma.student.create({
        data: {
          clerkId: userId,
          studentId: null as unknown as string,
          name,
          email,
        },
        include: {
          entry: true,
          votes: true,
        },
      })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

