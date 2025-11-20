import { auth } from '@clerk/nextjs/server'
import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { checkNSFW } from '@/lib/nsfw-filter-improved'

export async function POST(request: Request) {
  console.log('📤 [UPLOAD] Upload request initiated')
  
  try {
    const { userId } = await auth()
    console.log('🔐 [AUTH] User ID:', userId ? `✅ ${userId}` : '❌ Not authenticated')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    console.log('📋 [FORM] FormData received')
    
    const file = form.get('file') as File
    console.log('📁 [FILE] File info:', {
      name: file?.name,
      type: file?.type,
      size: file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'unknown',
    })

    if (!file) {
      console.error('❌ [FILE] No file in FormData')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer for NSFW detection
    console.log('🔄 [BUFFER] Converting file to buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('✅ [BUFFER] Buffer created:', {
      size: `${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      length: buffer.length,
    })

    // Check for NSFW content
    console.log('🔍 [NSFW] Starting NSFW detection...')
    try {
      const startTime = Date.now()
      const nsfwResult = await checkNSFW(buffer)
      const detectionTime = Date.now() - startTime
      
      console.log('📊 [NSFW] Detection complete:', {
        time: `${detectionTime}ms`,
        method: nsfwResult.details.method,
        category: nsfwResult.details.category,
        confidence: `${nsfwResult.details.confidence}%`,
        isNSFW: nsfwResult.isNSFW,
      })
      
      if (nsfwResult.details.allScores) {
        console.log('📈 [NSFW] All category scores:', nsfwResult.details.allScores)
      }
      
      if (nsfwResult.isNSFW) {
        console.warn(`⛔ [NSFW] Image BLOCKED for user ${userId}:`, {
          category: nsfwResult.details.category,
          confidence: nsfwResult.details.confidence,
          method: nsfwResult.details.method,
        })
        
        return NextResponse.json(
          { 
            error: 'This image contains inappropriate content and cannot be uploaded. Please choose a different photo that follows our community guidelines.',
            details: {
              category: nsfwResult.details.category,
              confidence: nsfwResult.details.confidence,
            }
          },
          { status: 400 }
        )
      }

      console.log(`✅ [NSFW] Image APPROVED for user ${userId}:`, {
        category: nsfwResult.details.category,
        confidence: nsfwResult.details.confidence,
        method: nsfwResult.details.method,
      })
    } catch (nsfwError) {
      console.error('💥 [NSFW] Detection FAILED:', nsfwError)
      console.error('🔍 [NSFW] Error details:', {
        message: nsfwError instanceof Error ? nsfwError.message : 'Unknown error',
        stack: nsfwError instanceof Error ? nsfwError.stack : undefined,
      })
      // You can decide to block uploads on error or allow them
      // For now, we'll reject to be safe
      return NextResponse.json(
        { error: 'Unable to verify image content. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Upload to Vercel Blob if image is safe
    console.log('☁️  [BLOB] Starting upload to Vercel Blob...')
    const uploadStartTime = Date.now()
    
    // Maximize cache control for optimal performance (1 year = 31,536,000 seconds)
    const blob = await put(`education-week/${userId}-${Date.now()}.jpg`, file, {
      access: 'public',
      cacheControlMaxAge: 31536000, // Cache for 1 year (maximum recommended)
    })
    
    const uploadTime = Date.now() - uploadStartTime
    console.log('✅ [BLOB] Upload successful:', {
      url: blob.url,
      uploadTime: `${uploadTime}ms`,
      blobDetails: blob,
    })

    console.log('🎉 [UPLOAD] Complete! Returning URL to client')
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('💥 [ERROR] Upload failed:', error)
    console.error('🔍 [ERROR] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
    })
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}
