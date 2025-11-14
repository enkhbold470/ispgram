'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function EmailSubscriptionToggle() {
  const { user } = useUser()
  const [subscribed, setSubscribed] = useState(true)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!user) {
        setLoading(false)
        return
      }

      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress
      if (!email) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
        const data = await response.json()

        if (response.ok) {
          setSubscribed(data.subscribed ?? true)
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionStatus()
  }, [user])

  const handleToggle = async (newValue: boolean) => {
    if (!user) return

    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress
    if (!email) return

    setUpdating(true)
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
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
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-theme-accent" />
          <div>
            <Label className="text-base font-medium">Email Notifications</Label>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5 flex-1">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-theme-accent" />
          <Label htmlFor="email-subscription" className="text-base font-medium">
            Email Notifications
          </Label>
        </div>
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
  )
}

