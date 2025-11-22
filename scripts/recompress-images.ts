/**
 * Optional Migration Script: Re-compress existing images
 * 
 * This script:
 * 1. Fetches all entries from the database
 * 2. Downloads each image from Vercel Blob
 * 3. Re-compresses it using Sharp
 * 4. Uploads the compressed version back to Vercel Blob
 * 5. Updates the database with the new URL
 * 
 * Usage: 
 *   pnpm recompress:images              # Run migration
 *   pnpm recompress:images --dry-run    # Test without making changes
 * 
 * ⚠️  SAFETY FEATURES:
 *   - Skips external URLs (not from Vercel Blob)
 *   - Preserves PNG transparency
 *   - Verifies new image before updating database
 *   - Keeps old images (doesn't delete them)
 *   - Continues on errors (doesn't stop entire process)
 *   - Dry-run mode available for testing
 * 
 * ⚠️  This script requires BLOB_READ_WRITE_TOKEN environment variable
 */

import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { put } from '@vercel/blob'

const prisma = new PrismaClient()

interface CompressionStats {
  entryId: string
  originalUrl: string
  originalSize: number
  compressedSize: number
  reduction: number
  success: boolean
  error?: string
}

/**
 * Check if URL is from Vercel Blob storage
 */
function isVercelBlobUrl(url: string): boolean {
  return url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com')
}

async function recompressImage(
  entryId: string,
  photoUrl: string,
  blobReadWriteToken: string,
  dryRun: boolean = false
): Promise<CompressionStats> {
  const stats: CompressionStats = {
    entryId,
    originalUrl: photoUrl,
    originalSize: 0,
    compressedSize: 0,
    reduction: 0,
    success: false,
  }

  try {
    console.log(`\n📸 Processing entry ${entryId}...`)
    console.log(`   URL: ${photoUrl}`)

    // Skip external URLs (not from Vercel Blob)
    if (!isVercelBlobUrl(photoUrl)) {
      console.log('   ⏭️  External URL detected, skipping (not from Vercel Blob)')
      stats.success = true
      stats.error = 'External URL - skipped'
      return stats
    }

    // Download the original image
    console.log('   ⬇️  Downloading original image...')
    const response = await fetch(photoUrl)
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    stats.originalSize = buffer.length
    console.log(`   ✅ Downloaded: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`)

    // Check if image is already small (less than 500KB), skip compression
    if (stats.originalSize < 500 * 1024) {
      console.log('   ⏭️  Image already small, skipping compression')
      stats.success = true
      stats.compressedSize = stats.originalSize
      stats.reduction = 0
      return stats
    }

    // Detect image format and metadata
    const imageMetadata = await sharp(buffer).metadata()
    const isPNG = imageMetadata.format === 'png'
    const hasAlpha = imageMetadata.hasAlpha === true

    console.log(`   📋 Image info: ${imageMetadata.format?.toUpperCase()}, ${imageMetadata.width}x${imageMetadata.height}${hasAlpha ? ' (with transparency)' : ''}`)

    // Compress the image - preserve PNG format if it has transparency
    console.log('   🗜️  Compressing image...')
    let compressedBuffer: Buffer
    
    if (isPNG && hasAlpha) {
      // Preserve PNG format for images with transparency
      compressedBuffer = await sharp(buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({
          quality: 90,
          compressionLevel: 9,
        })
        .toBuffer()
    } else {
      // Convert to JPEG for better compression (no transparency loss)
      compressedBuffer = await sharp(buffer)
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer()
    }

    stats.compressedSize = compressedBuffer.length
    stats.reduction = ((1 - stats.compressedSize / stats.originalSize) * 100)
    console.log(`   ✅ Compressed: ${(stats.compressedSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`   📉 Reduction: ${stats.reduction.toFixed(1)}%`)

    // If compression made it larger, skip (shouldn't happen but safety check)
    if (stats.compressedSize >= stats.originalSize) {
      console.log('   ⏭️  Compression didn\'t reduce size, skipping update')
      stats.success = true
      stats.compressedSize = stats.originalSize
      stats.reduction = 0
      return stats
    }

    if (dryRun) {
      console.log('   🔍 DRY RUN: Would upload and update database')
      stats.success = true
      return stats
    }

    // Generate new blob path with timestamp to avoid conflicts
    const urlParts = photoUrl.split('/')
    const oldBlobPath = urlParts.slice(-1)[0]
    const baseName = oldBlobPath.replace(/\.[^/.]+$/, '')
    const extension = isPNG && hasAlpha ? 'png' : 'jpg'
    const newBlobPath = `${baseName}-compressed-${Date.now()}.${extension}`

    // Upload compressed image to Vercel Blob
    console.log('   ☁️  Uploading compressed image...')
    const blob = await put(`education-week/${newBlobPath}`, compressedBuffer, {
      access: 'public',
      cacheControlMaxAge: 31536000,
      token: blobReadWriteToken,
    })

    console.log(`   ✅ Uploaded: ${blob.url}`)

    // Verify the new image is accessible before updating database
    console.log('   🔍 Verifying new image is accessible...')
    const verifyResponse = await fetch(blob.url, { method: 'HEAD' })
    if (!verifyResponse.ok) {
      throw new Error(`New image verification failed: ${verifyResponse.statusText}`)
    }
    console.log('   ✅ New image verified')

    // Update database with new URL (atomic operation)
    await prisma.entry.update({
      where: { id: entryId },
      data: { photoUrl: blob.url },
    })

    console.log('   ✅ Database updated')

    // Old image is kept (not deleted) for safety - can be cleaned up later manually

    stats.success = true
    return stats
  } catch (error) {
    stats.error = error instanceof Error ? error.message : 'Unknown error'
    console.error(`   ❌ Error: ${stats.error}`)
    // On error, original image URL remains in database - no data loss
    return stats
  }
}

async function main() {
  console.log('🚀 Starting image re-compression migration...\n')

  // Check for dry-run flag
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d')
  if (dryRun) {
    console.log('🔍 DRY RUN MODE: No changes will be made\n')
  }

  // Check for required environment variable
  const blobReadWriteToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobReadWriteToken && !dryRun) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is required')
    console.error('   Get it from: https://vercel.com/dashboard/stores')
    process.exit(1)
  }

  try {
    // Fetch all entries
    const entries = await prisma.entry.findMany({
      select: {
        id: true,
        photoUrl: true,
        student: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`📊 Found ${entries.length} entries to process\n`)

    if (entries.length === 0) {
      console.log('✅ No entries to process')
      return
    }

    const results: CompressionStats[] = []
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    let totalOriginalSize = 0
    let totalCompressedSize = 0

    // Process each entry
    for (const entry of entries) {
      const result = await recompressImage(
        entry.id,
        entry.photoUrl,
        blobReadWriteToken || '',
        dryRun
      )

      results.push(result)

      if (result.success) {
        if (result.reduction === 0) {
          skipCount++
        } else {
          successCount++
          totalOriginalSize += result.originalSize
          totalCompressedSize += result.compressedSize
        }
      } else {
        errorCount++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 COMPRESSION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total entries: ${entries.length}`)
    console.log(`✅ Successfully compressed: ${successCount}`)
    console.log(`⏭️  Skipped (already small): ${skipCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log('\n📉 Size Reduction:')
    console.log(
      `   Original total: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`
    )
    console.log(
      `   Compressed total: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`
    )
    if (totalOriginalSize > 0) {
      const totalReduction =
        ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)
      console.log(`   Total reduction: ${totalReduction}%`)
      console.log(
        `   Space saved: ${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)} MB`
      )
    }

    if (errorCount > 0) {
      console.log('\n❌ Failed entries:')
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - Entry ${r.entryId}: ${r.error}`)
        })
    }

    if (dryRun) {
      console.log('\n✅ Dry run complete! Use without --dry-run to apply changes.')
    } else {
      console.log('\n✅ Migration complete!')
    }
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()

