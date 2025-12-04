import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminEmail } from '@/lib/admin'
import JSZip from 'jszip'

function isVercelBlobUrl(url: string): boolean {
  return url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com')
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

    // Fetch all entries with images
    const entries = await prisma.entry.findMany({
      include: {
        student: {
          select: {
            email: true,
            name: true,
            studentId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const zip = new JSZip()
    let downloadedCount = 0
    let skippedCount = 0
    const errors: string[] = []

    // Download each image
    for (const entry of entries) {
      try {
        if (!entry.photoUrl || !isVercelBlobUrl(entry.photoUrl)) {
          skippedCount++
          continue
        }

        // Download image
        const response = await fetch(entry.photoUrl)
        if (!response.ok) {
          errors.push(`Failed to download ${entry.id}: ${response.statusText}`)
          continue
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Determine file extension from URL or content type
        const url = new URL(entry.photoUrl)
        const pathname = url.pathname
        const extension = pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || '.jpg'

        // Create filename: entry-id_student-name_student-id.jpg
        const safeName = entry.student.name.replace(/[^a-zA-Z0-9]/g, '_')
        const studentId = entry.student.studentId || 'no-id'
        const filename = `${entry.id}_${safeName}_${studentId}${extension}`

        // Add to zip
        zip.file(filename, buffer)
        downloadedCount++
      } catch (error) {
        errors.push(`Error processing ${entry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Add metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      totalEntries: entries.length,
      downloaded: downloadedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
      entries: entries.map((entry) => ({
        id: entry.id,
        studentName: entry.student.name,
        studentEmail: entry.student.email,
        studentId: entry.student.studentId,
        photoUrl: entry.photoUrl,
        createdAt: entry.createdAt.toISOString(),
      })),
    }
    zip.file('metadata.json', JSON.stringify(metadata, null, 2))

    // Generate zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="ispgram-images-backup-${timestamp}.zip"`,
      },
    })
  } catch (error) {
    console.error('Error generating image backup:', error)
    return NextResponse.json(
      { error: 'Failed to generate image backup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

