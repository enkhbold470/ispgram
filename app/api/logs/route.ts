// Initialize logger early
import '@/lib/logger-init'

import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { isAdminEmail } from '@/lib/admin'

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

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') as 'log' | 'info' | 'warn' | 'error' | 'debug' | null
    const context = searchParams.get('context') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined
    const since = searchParams.get('since') ? new Date(searchParams.get('since')!) : undefined

    const logs = logger.getLogs({
      level: level ? (level.includes(',') ? (level.split(',') as LogEntry['level'][]) : level) : undefined,
      context,
      limit,
      since,
    })

    return NextResponse.json({
      logs,
      total: logger.getLogCount(),
    })
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
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

    logger.clearLogs()

    return NextResponse.json({ success: true, message: 'Logs cleared' })
  } catch (error) {
    console.error('Error clearing logs:', error)
    return NextResponse.json(
      { error: 'Failed to clear logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Import LogEntry type
import type { LogEntry } from '@/lib/logger'

