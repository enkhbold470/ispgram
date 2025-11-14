'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(true)
  const [studentEmail, setStudentEmail] = useState<string | null>(null)
  const [studentName, setStudentName] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!token && !email) {
        setLoading(false)
        return
      }

      try {
        const params = new URLSearchParams()
        if (token) params.set('token', token)
        if (email) params.set('email', email)

        const response = await fetch(`/api/unsubscribe?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch subscription status')
        }

        setStudentEmail(data.email)
        setStudentName(data.name)
        setSubscribed(data.subscribed)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load subscription status')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionStatus()
  }, [token, email])

  const handleToggle = async (newValue: boolean) => {
    if (!studentEmail) return

    setUpdating(true)
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || null,
          email: email || studentEmail,
          subscribe: newValue,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription')
      }

      setSubscribed(data.subscribed)
      toast.success(
        data.subscribed
          ? 'You have been subscribed to email notifications'
          : 'You have been unsubscribed from email notifications'
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-theme-primary" />
              <p className="text-gray-600">Loading subscription status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!studentEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <XCircle className="h-12 w-12 text-red-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invalid Link</h2>
                <p className="mt-2 text-gray-600">
                  This unsubscribe link is invalid or has expired.
                </p>
              </div>
              <Button onClick={() => router.push('/')} variant="outline">
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-theme-primary" />
            <div>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>
                Manage your email notification preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {studentName && (
                <>
                  <span className="font-medium">{studentName}</span>
                  <br />
                </>
              )}
              <span className="text-gray-500">{studentEmail}</span>
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email-subscription" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive updates about your entries, likes, and contest news
              </p>
            </div>
            <Switch
              id="email-subscription"
              checked={subscribed}
              onCheckedChange={handleToggle}
              disabled={updating}
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            {subscribed ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>You are currently subscribed to email notifications</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                <span>You are currently unsubscribed from email notifications</span>
              </>
            )}
          </div>

          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full"
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

