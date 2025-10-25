'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Upload, Loader2, CheckCircle, AlertCircle, Trash2, Heart } from 'lucide-react'

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
const MAX_FILE_SIZE_MB = 5

export default function SubmitPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [studentId, setStudentId] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingEntry, setExistingEntry] = useState<{
    id: string
    description: string | null
    photoUrl: string
    likeCount?: number
    hasLiked?: boolean
  } | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // State for likes/hearts
  const [likeInfo, setLikeInfo] = useState<{ count: number; hasLiked: boolean }>({ count: 0, hasLiked: false })

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/sign-in')
      return
    }

    // Check if user already has an entry and fetch like info too
    async function checkExistingEntry() {
      try {
        const response = await fetch('/api/student')
        if (response.ok) {
          const student = await response.json()
          if (student.entry) {
            setExistingEntry(student.entry)
            setDescription(student.entry.description || '')
            setPreviewUrl(student.entry.photoUrl)

            // Fetch like info for user's entry
            if (student.entry.id) {
              const likesRes = await fetch(`/api/entries/${student.entry.id}`)
              if (likesRes.ok) {
                const data = await likesRes.json()
                setLikeInfo({
                  count: data.voteCount ?? 0,
                  hasLiked: false,
                })
              }
            }
          }
          if (student.studentId) {
            setStudentId(student.studentId)
          }
        }
      } catch (err) {
        console.error('Error checking entry:', err)
      }
    }

    checkExistingEntry()
  }, [user, isLoaded, router])

  // Accept only 8 digit numbers for studentId
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digit characters and allow only first 8 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 8)
    setStudentId(value)
  }

  // Handler for deleting the photo (remove entry)
  const handleDeletePhoto = async () => {
    if (!existingEntry) return
    if (!window.confirm("Are you sure you want to delete your entry (photo and title)?")) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/entries/${existingEntry.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete entry')
      }
      setExistingEntry(null)
      setPreviewUrl(null)
      setDescription('')
      setSuccess(false)
      setIsEditing(false)
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting')
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate
      if (!existingEntry) {
        if (!studentId.trim()) {
          throw new Error('Please enter your De Anza Student ID')
        }
        if (!/^\d{8}$/.test(studentId.trim())) {
          throw new Error('Student ID must be exactly 8 digits')
        }
        if (!file) {
          throw new Error('Please select a photo of your costume')
        }
      }

      // Validate file type and size before upload (only for new entry)
      if (!existingEntry && file) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          throw new Error(
            'We only accept JPEG, PNG, or JPG images. If you are using .heic, please change your iOS camera setting. Sad for you 😢'
          )
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          throw new Error('Image must be less than 5MB.')
        }
      }

      // Upload photo if a new one is selected (only when creating entry)
      let photoUrl = existingEntry?.photoUrl
      if (!existingEntry && file) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photo')
        }

        const uploadData = await uploadResponse.json()
        photoUrl = uploadData.url
        if (!photoUrl) throw new Error("No photo URL returned from upload")
      }

      // Submit or update entry
      if (existingEntry) {
        // Only edit description/title, not photo
        const response = await fetch(`/api/entries/${existingEntry.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: description.trim() || null,
            // Do NOT allow photoUrl change
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update entry')
        }
      } else {
        // Create new entry (with photo)
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentId.trim(),
            name: user?.fullName || user?.firstName || 'Anonymous',
            email: user?.primaryEmailAddress?.emailAddress || '',
            description: description.trim() || null,
            photoUrl,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to submit entry')
        }
      }

      setSuccess(true)
      setIsEditing(false)
      if (!existingEntry) {
        setFile(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Only allow photo upload on new entries, not on edit
  const showPhotoUpload = !existingEntry

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="mb-4 h-16 w-16 text-green-600" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {existingEntry ? 'Entry Updated!' : 'Submission Successful!'}
            </h2>
            <p className="mb-6 text-gray-600">
              {existingEntry
                ? 'Your costume entry has been updated successfully.'
                : 'Your costume has been submitted to the contest!'}
            </p>
            <div className="flex gap-4">
              <Link
                href="/vote"
                className="rounded-full bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
              >
                Vote for Others
              </Link>
              <Link
                href="/results"
                className="rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                View Results
              </Link>
            </div>
            <button
              onClick={() => {
                setSuccess(false)
                setIsEditing(true)
              }}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Edit Entry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {existingEntry && !isEditing ? 'Your Costume Entry' : 'Submit Your Costume'}
        </h1>
        <p className="text-gray-600">
          {existingEntry && !isEditing
            ? 'You can edit your entry (description or delete photo) anytime before the contest ends'
            : 'Upload a photo of your Halloween costume and enter the contest!'}
        </p>
      </div>

      {existingEntry && !isEditing ? (
        <div className="rounded-lg border bg-white p-6 shadow-lg">
          <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
            <Image
              src={existingEntry.photoUrl}
              alt="Your costume"
              fill
              className="object-cover"
            />
            {/* Heart/likes display below the image */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 rounded-full px-3 py-1 shadow">
              <Heart
                className={`h-6 w-6 ${likeInfo.hasLiked ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`}
                fill={likeInfo.hasLiked ? '#ec4899' : 'none'}
              />
              <span className={`ml-1 text-base font-semibold ${likeInfo.hasLiked ? 'text-pink-600' : 'text-gray-600'}`}>
                {likeInfo.count}
              </span>
              <span className="ml-1 text-xs text-gray-500">
                {likeInfo.count === 1 ? 'Like' : 'Likes'}
              </span>
            </div>
          </div>
          {existingEntry.description && (
            <p className="mb-4 text-gray-700">{existingEntry.description}</p>
          )}
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 rounded-full bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-600"
            >
              Edit Title
            </button>
            <button
              onClick={handleDeletePhoto}
              className="flex-1 rounded-full bg-red-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Trash2 className="h-5 w-5" />
              Delete Photo
            </button>
            <Link
              href="/vote"
              className="flex-1 rounded-full border-2 border-purple-600 px-6 py-3 text-center font-semibold text-purple-600 transition-colors hover:bg-purple-50"
            >
              Vote for Others
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-lg">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {!existingEntry && (
            <div className="mb-6">
              <label htmlFor="studentId" className="mb-2 block font-semibold text-gray-900">
                De Anza Student ID <span className="text-red-600">*</span>
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="e.g., 20123456"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                maxLength={8}
                pattern="\d{8}"
                inputMode="numeric"
                autoComplete="off"
              />
              <div className="mt-1 text-sm text-gray-500">
                Enter exactly 8 numeric digits.
              </div>
            </div>
          )}

          {showPhotoUpload && (
            <div className="mb-6">
              <label className="mb-2 block font-semibold text-gray-900">
                Costume Photo <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png,image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0]
                    if (selectedFile) {
                      if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
                        setError('We only accept JPEG, PNG, or JPG images. If you are using .heic, please change your iOS camera setting. Sad for you 😢')
                        setFile(null)
                        setPreviewUrl(null)
                        return
                      }
                      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                        setError('Image must be less than 5MB.')
                        setFile(null)
                        setPreviewUrl(null)
                        return
                      }
                      setError(null)
                      setFile(selectedFile)
                      const url = URL.createObjectURL(selectedFile)
                      setPreviewUrl(url)
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                  required={!existingEntry}
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:bg-gray-100"
                >
                  {previewUrl ? (
                    <div className="relative h-64 w-full overflow-hidden rounded-lg">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                        <Upload className="h-8 w-8 text-white" />
                        <span className="ml-2 text-white">Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-12 w-12 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        Click to upload your costume photo
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        Only .jpeg, .png, .jpg files are allowed.<br />
                        Sorry, <b>.heic</b> format is NOT supported.<br />
                        If you are using an iPhone, please change your camera settings to save as JPEG instead of HEIC.<br />
                        Max image size: 5MB.
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="description" className="mb-2 block font-semibold text-gray-900">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your costume..."
              maxLength={500}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="mt-1 text-right text-sm text-gray-500">
              {description.length}/500
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-600 to-orange-700 px-6 py-4 font-semibold text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {existingEntry ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                {existingEntry ? 'Update Title' : 'Submit Entry'}
              </>
            )}
          </button>

          {existingEntry && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setPreviewUrl(existingEntry.photoUrl)
                setDescription(existingEntry.description || '')
              }}
              className="mt-3 w-full rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </div>
  )
}
