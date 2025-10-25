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
    studentId: string
  }
  votes: {
    id: string
    studentId: string
  }[]
}

export async function getOrCreateStudent(
  clerkId: string,
  studentId: string,
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
      studentId,
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
