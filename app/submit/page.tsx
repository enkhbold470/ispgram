'use client'

import Link from 'next/link'
import { Trophy, Heart, AlertCircle } from 'lucide-react'

// Contest has ended - show message instead of upload form
export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg border bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <AlertCircle className="h-16 w-16 text-theme-accent" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Contest Has Ended
          </h2>
          <p className="mb-6 text-gray-600">
            The ISPGram Photo Contest ended on November 28, 2025. 
            Thank you to everyone who participated!
          </p>
          <p className="mb-6 text-gray-600">
            You can still browse the gallery and see the final results.
          </p>
          <div className="flex gap-4">
            <Link
              href="/vote"
              className="group flex items-center gap-2 rounded-full bg-linear-to-r from-theme-primary to-theme-secondary px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
            >
              <Heart className="h-4 w-4" />
              View Gallery
            </Link>
            <Link
              href="/results"
              className="group flex items-center gap-2 rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Trophy className="h-4 w-4" />
              See Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
