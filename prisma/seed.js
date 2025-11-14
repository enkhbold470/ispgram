// Seed script for Prisma using placekeanu.com/500 images
// Run with: pnpm prisma db seed (after configuring package.json prisma.seed)

import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data (order matters due to FKs)
  // await prisma.vote.deleteMany()
  // await prisma.entry.deleteMany()
  // await prisma.student.deleteMany()

  // Create students
  const studentCount = 1
  const students = []
  for (let i = 1; i <= studentCount; i++) {
    const email = `student${randomUUID().slice(0, 8)}@example.com`
    const data = {
      clerkId: `clerk_${randomUUID()}`,
      studentId: `DA${randomUUID().slice(0, 8).toUpperCase()}`,
      name: `Amanda Baasanjargal`,
      email,
    }
    const student = await prisma.student.create({ data })
    students.push(student)
  }

  // Create entries (one per student for a subset)
  const entries = []
  const entryOwners = students.slice(0, 8) // first 8 students submit entries
  for (let i = 0; i < entryOwners.length; i++) {
    const owner = entryOwners[i]
    const entry = await prisma.entry.create({
      data: {
        studentId: owner.id, // relation uses Student.id
        description: `SF ${i + 1}`,
        // placekeanu.com/500 with a cache-busting param to vary images
        photoUrl: `https://www.shutterstock.com/image-photo/confident-smiling-middle-aged-business-260nw-2451544833.jpg`,
      },
    })
    entries.push(entry)
  }

  // Create votes: each student votes on first 3 entries (not own)
  for (const voter of students) {
    let votesMade = 0
    for (const entry of entries) {
      if (entry.studentId === voter.id) continue // skip voting own entry
      try {
        await prisma.vote.create({
          data: {
            studentId: voter.id,
            entryId: entry.id,
          },
        })
        votesMade++
        if (votesMade >= 3) break
      } catch (e) {
        // ignore unique constraint errors if any
      }
    }
  }

  console.log(`Seeded: ${students.length} students, ${entries.length} entries.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

