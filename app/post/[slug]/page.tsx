'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Heart, Share2, ArrowLeft, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { useStudent } from '@/hooks/use-student'
import { cn } from '@/lib/utils'

interface PostEntry {
  id: string
  studentId: string
  description: string | null
  photoUrl: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    studentId: string
    clerkId?: string | null // optional, used for fetching profile image
  }
  votes: Array<{
    id: string
    studentId: string
  }>
  voteCount: number
}


export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn, isLoaded: userLoaded } = useUser()
  const { student } = useStudent()
  const [entry, setEntry] = useState<PostEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const slug = params.slug as string



  useEffect(() => {
    async function fetchEntry() {
      try {
        setLoading(true)
        const response = await fetch(`/api/entries/${slug}`)
        if (!response.ok) {
          throw new Error('Entry not found')
        }
        const data = await response.json()
        setEntry(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entry')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchEntry()
    }
  }, [slug])

  const hasVoted = entry && student
    ? entry.votes.some((vote) => vote.studentId === student.id)
    : false

  const handleVote = async () => {
    if (!isSignedIn) {
      return
    }

    if (!student) {
      alert('Please submit an entry first to vote')
      return
    }

    if (!entry || voting) return

    setVoting(true)
    const previousVoteCount = entry.voteCount
    const previousVotes = [...entry.votes]
    const wasVoted = hasVoted

    // Optimistic update
    setEntry({
      ...entry,
      voteCount: wasVoted ? entry.voteCount - 1 : entry.voteCount + 1,
      votes: wasVoted
        ? entry.votes.filter((v) => v.studentId !== student.id)
        : [...entry.votes, { id: 'temp', studentId: student.id }],
    })

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      const data = await response.json()

      // Update with actual vote count from server
      setEntry((prev) =>
        prev
          ? {
              ...prev,
              voteCount: data.voteCount,
            }
          : null
      )
    } catch {
      // Revert on error
      setEntry({
        ...entry,
        voteCount: previousVoteCount,
        votes: previousVotes,
      })
      alert('Failed to vote. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Check out ${entry?.student.name}'s Education Week entry!`

    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: `${entry?.student.name}'s Entry`,
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 3000)
      }
    } catch {
      // User cancelled share or error occurred
      console.log('Share cancelled or failed')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-theme-primary" />
        <p className="text-muted-foreground">Loading entry...</p>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center gap-4 rounded-lg bg-error-light p-8 text-center">
          <AlertCircle className="h-12 w-12 text-error" />
          <h3 className="text-xl font-semibold text-card-foreground">Entry Not Found</h3>
          <p className="text-muted-foreground">
            {error || "The entry you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push('/results')}
            className="mt-4 flex items-center gap-2 rounded-full bg-theme-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-theme-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </button>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-start justify-between w-full">
            {/* Student name and date, with Clerk avatar */}
            
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-card-foreground truncate">{entry.student.name}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </p>
              </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={entry.photoUrl || 'https://placekeanu.com/500'}
            alt={`${entry.student.name}'s Education Week highlight`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
          />
        </div>

        {/* Description & Actions */}
        <div className="p-6">
          {entry.description && (
            <div className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h2>
              <p className="text-lg text-foreground">{entry.description}</p>
            </div>
          )}

          {/* Vote Section */}
          <div className="flex items-center justify-between border-t pt-6">
            <div className="flex items-center gap-3">
              <Heart
                className={cn(
                  'h-6 w-6',
                  entry.voteCount > 0 ? 'text-destructive fill-destructive' : 'text-muted-foreground'
                )}
                strokeWidth={entry.voteCount > 0 ? 2.4 : 1.5}
                aria-hidden="true"
              />
              <span className="text-2xl font-semibold text-foreground tabular-nums">
                {entry.voteCount}
              </span>
              <span className="ml-1 text-base text-muted-foreground">
                {entry.voteCount === 1 ? 'like' : 'likes'}
              </span>
            </div>
            {userLoaded && (
              <div>
                {isSignedIn ? (
                  <button
                    onClick={handleVote}
                    disabled={voting}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all',
                      'hover:scale-105 active:scale-95',
                      hasVoted
                        ? 'bg-vote-active text-white shadow-[0_10px_15px_-3px_var(--color-vote-active-shadow),0_4px_6px_-4px_var(--color-vote-active-shadow)]'
                        : 'bg-vote-inactive text-muted-foreground hover:bg-vote-inactive-hover',
                      voting && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <Heart className={cn('h-5 w-5', hasVoted && 'fill-current')} />
                    <span>{hasVoted ? 'Liked' : 'Like'}</span>
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-2 rounded-full bg-theme-primary px-6 py-3 font-semibold text-theme-primary-foreground transition-all hover:scale-105 hover:bg-theme-primary-hover active:scale-95">
                      <Heart className="h-5 w-5" />
                      <span>Sign in to Like</span>
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Success Toast */}
      {shareSuccess && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 rounded-lg bg-success px-6 py-3 text-success-light shadow-lg">
          <p className="font-medium">Link copied to clipboard!</p>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-6 rounded-lg border bg-info-light p-4 text-sm text-info">
        <p>
          💡 <strong>Share this page</strong> to let friends and family support{' '}
          {entry?.student.name}&apos;s Education Week entry!
        </p>
      </div>
    </div>
  )
}

