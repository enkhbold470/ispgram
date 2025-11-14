import { prisma } from './prisma'

interface EntryWithRelations {
  id: string
  studentId: string
  description: string | null
  photoUrl: string
  createdAt: Date
  updatedAt: Date
  student: {
    id: string
    name: string
    studentId: string | null
  }
  votes: {
    id: string
    studentId: string
  }[]
}

export async function getOrCreateStudent(
  clerkId: string,
  studentId: string | null,
  name: string,
  email: string
) {
  const existing = await prisma.student.findUnique({
    where: { clerkId },
  })

  if (existing) {
    // Update student ID if it was provided and different
    if (studentId && existing.studentId !== studentId) {
      return prisma.student.update({
        where: { clerkId },
        data: { studentId, name, email },
      })
    }
    return existing
  }

  return prisma.student.create({
    data: {
      clerkId,
      studentId: studentId || 'UNKNOWN',
      name,
      email,
    },
  })
}

export async function getStudentByClerkId(clerkId: string) {
  return prisma.student.findUnique({
    where: { clerkId },
    include: {
      entry: true,
      votes: true,
    },
  })
}

export async function getEntriesWithVotes() {
  const entries = await prisma.entry.findMany({
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

  return entries.map((entry: EntryWithRelations) => ({
    ...entry,
    voteCount: entry.votes.length,
  }))
}

export async function getEntryById(id: string) {
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          studentId: true,
          clerkId: true,
        },
      },
      votes: {
        select: {
          id: true,
          studentId: true,
        },
      },
    },
  })

  if (!entry) return null

  return {
    ...entry,
    voteCount: entry.votes.length,
  }
}

export interface StudentEmailInfo {
  email: string
  name: string
  hasEntry: boolean
  voteCount: number
}

export async function getStudentsForEmailList(
  filter: 'all' | 'with-entry' | 'without-entry' | 'top-likes'
): Promise<StudentEmailInfo[]> {
  const baseSelect = {
    email: true,
    name: true,
    entry: {
      select: {
        votes: {
          select: {
            id: true,
          },
        },
      },
    },
  }

  switch (filter) {
    case 'all': {
      const students = await prisma.student.findMany({
        select: baseSelect,
      })
      return students.map((student) => ({
        email: student.email,
        name: student.name,
        hasEntry: !!student.entry,
        voteCount: student.entry?.votes.length || 0,
      }))
    }

    case 'with-entry': {
      const students = await prisma.student.findMany({
        where: {
          entry: {
            isNot: null,
          },
        },
        select: baseSelect,
      })
      return students.map((student) => ({
        email: student.email,
        name: student.name,
        hasEntry: true,
        voteCount: student.entry?.votes.length || 0,
      }))
    }

    case 'without-entry': {
      const students = await prisma.student.findMany({
        where: {
          entry: null,
        },
        select: {
          email: true,
          name: true,
        },
      })
      return students.map((student) => ({
        email: student.email,
        name: student.name,
        hasEntry: false,
        voteCount: 0,
      }))
    }

    case 'top-likes': {
      const entries = await prisma.entry.findMany({
        select: {
          student: {
            select: {
              email: true,
              name: true,
            },
          },
          votes: {
            select: {
              id: true,
            },
          },
        },
      })

      return entries
        .filter((entry) => entry.votes.length >= 10)
        .map((entry) => ({
          email: entry.student.email,
          name: entry.student.name,
          hasEntry: true,
          voteCount: entry.votes.length,
        }))
    }

    default:
      return []
  }
}

export interface StudentNotificationInfo {
  email: string
  name: string
  entryId: string | null
  voteCount: number
  hasEntry: boolean
}

export async function getStudentsForDailyNotification(): Promise<StudentNotificationInfo[]> {
  const students = await prisma.student.findMany({
    select: {
      email: true,
      name: true,
      entry: {
        select: {
          id: true,
          votes: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  return students.map((student) => ({
    email: student.email,
    name: student.name,
    entryId: student.entry?.id || null,
    voteCount: student.entry?.votes.length || 0,
    hasEntry: !!student.entry,
  }))
}
