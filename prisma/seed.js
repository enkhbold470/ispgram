// Seed script for Prisma using placekeanu.com/500 images
// Run with: pnpm prisma db seed (after configuring package.json prisma.seed)

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data (order matters due to FKs)
  await prisma.vote.deleteMany()
  await prisma.entry.deleteMany()
  await prisma.student.deleteMany()

  // Create students
  const studentCount = 12
  const students = []
  for (let i = 1; i <= studentCount; i++) {
    const email = `student${i}@example.com`
    const data = {
      clerkId: `clerk_${i}`,
      studentId: `DA${10000000 + i}`,
      name: `Student ${i}`,
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
        description: `Keanu look ${i + 1}`,
        // placekeanu.com/500 with a cache-busting param to vary images
        photoUrl: `https://placekeanu.com/500?v=${i + 1}`,
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

