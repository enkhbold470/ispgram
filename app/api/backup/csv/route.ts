import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/admin'

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  const stringValue = String(value)
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

function arrayToCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

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

    // Fetch all data
    const [students, entries, votes] = await Promise.all([
      prisma.student.findMany({
        include: {
          entry: {
            include: {
              votes: {
                include: {
                  student: {
                    select: {
                      email: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.entry.findMany({
        include: {
          student: {
            select: {
              email: true,
              name: true,
              studentId: true,
            },
          },
          votes: {
            include: {
              student: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.vote.findMany({
        include: {
          student: {
            select: {
              email: true,
              name: true,
            },
          },
          entry: {
            include: {
              student: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ])

    // Generate CSV files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)

    // Students CSV
    const studentsCsv = arrayToCsv([
      ['ID', 'Clerk ID', 'Student ID', 'Name', 'Email', 'Email Subscribed', 'Created At', 'Has Entry', 'Entry ID'],
      ...students.map((student) => [
        student.id,
        student.clerkId,
        student.studentId || '',
        student.name,
        student.email,
        student.emailSubscribed ? 'Yes' : 'No',
        student.createdAt.toISOString(),
        student.entry ? 'Yes' : 'No',
        student.entry?.id || '',
      ]),
    ])

    // Entries CSV
    const entriesCsv = arrayToCsv([
      [
        'ID',
        'Student ID',
        'Student Name',
        'Student Email',
        'Student Student ID',
        'Description',
        'Photo URL',
        'Created At',
        'Updated At',
        'Vote Count',
      ],
      ...entries.map((entry) => [
        entry.id,
        entry.studentId,
        entry.student.name,
        entry.student.email,
        entry.student.studentId || '',
        entry.description || '',
        entry.photoUrl,
        entry.createdAt.toISOString(),
        entry.updatedAt.toISOString(),
        entry.votes.length.toString(),
      ]),
    ])

    // Votes CSV
    const votesCsv = arrayToCsv([
      [
        'ID',
        'Voter Student ID',
        'Voter Name',
        'Voter Email',
        'Entry ID',
        'Entry Student Name',
        'Entry Student Email',
        'Created At',
      ],
      ...votes.map((vote) => [
        vote.id,
        vote.studentId,
        vote.student.name,
        vote.student.email,
        vote.entryId,
        vote.entry.student.name,
        vote.entry.student.email,
        vote.createdAt.toISOString(),
      ]),
    ])

    // Combine all CSVs into a single response
    const combinedCsv = `=== STUDENTS ===\n${studentsCsv}\n\n=== ENTRIES ===\n${entriesCsv}\n\n=== VOTES ===\n${votesCsv}`

    return new NextResponse(combinedCsv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ispgram-backup-${timestamp}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error generating CSV backup:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV backup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

