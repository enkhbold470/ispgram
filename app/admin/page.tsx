'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { isAdminEmail } from '@/lib/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Send, Users, Heart, CheckSquare, Square, Bell, MailCheck, Terminal, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
interface Student {
  email: string
  name: string
  hasEntry: boolean
  voteCount?: number
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'log' | 'info' | 'warn' | 'error' | 'debug'
  message: string
  context?: string
  data?: unknown
}

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [filterType, setFilterType] = useState<'all' | 'with-entry' | 'without-entry' | 'top-likes'>('all')
  const [subscribedOnly, setSubscribedOnly] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendingDaily, setSendingDaily] = useState(false)
  const [subject, setSubject] = useState('Update from ISPgram')
  const [body, setBody] = useState('Hello! This is an update from ISPgram.')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsOpen, setLogsOpen] = useState(false)
  const [logsLoading, setLogsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
      return
    }

    if (isLoaded && isSignedIn && user) {
      const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress
      if (!isAdminEmail(userEmail)) {
        router.push('/')
        return
      }
    }
  }, [isLoaded, isSignedIn, user, router])

  const fetchEmailList = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/emails/list?type=${filterType}&subscribedOnly=${subscribedOnly}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch email list')
      }

      setStudents(data.students || [])
      setSelectedEmails(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch email list')
    } finally {
      setLoading(false)
    }
  }, [filterType, subscribedOnly])

  const toggleSelectAll = () => {
    if (selectedEmails.size === students.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(students.map((s) => s.email)))
    }
  }

  const toggleEmail = (email: string) => {
    const newSelected = new Set(selectedEmails)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedEmails(newSelected)
  }

  const sendEmails = async () => {
    if (selectedEmails.size === 0) {
      toast.error('Please select at least one email')
      return
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }

    if (!body.trim()) {
      toast.error('Please enter email body')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: Array.from(selectedEmails),
          subject: subject.trim(),
          body: body.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      toast.success(`Successfully sent ${data.sent} emails`)
      setSelectedEmails(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  const sendDailyNotifications = async () => {
    if (selectedEmails.size === 0) {
      toast.error('Please select at least one email')
      return
    }

    setSendingDaily(true)
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyNotification: true,
          emails: Array.from(selectedEmails),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send daily notifications')
      }

      toast.success(`Successfully sent ${data.sent} daily notification emails`)
      setSelectedEmails(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send daily notifications')
    } finally {
      setSendingDaily(false)
    }
  }

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const response = await fetch('/api/logs')
      const data = await response.json()
      if (response.ok) {
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }, [])

  const clearLogs = async () => {
    try {
      const response = await fetch('/api/logs', { method: 'DELETE' })
      if (response.ok) {
        setLogs([])
        toast.success('Logs cleared')
      }
    } catch (error) {
      toast.error('Failed to clear logs')
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEmailList()
      if (logsOpen) {
        fetchLogs()
      }
    }
  }, [fetchEmailList, isLoaded, isSignedIn, logsOpen])

  // Auto-refresh logs when open
  useEffect(() => {
    if (!logsOpen || !autoRefresh) return

    const interval = setInterval(() => {
      fetchLogs()
    }, 2000) // Refresh every 2 seconds

    return () => clearInterval(interval)
  }, [logsOpen, autoRefresh, fetchLogs])

  const allSelected = students.length > 0 && selectedEmails.size === students.length

  if (!isLoaded) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress
  if (!isAdminEmail(userEmail)) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Email Management</h1>
        <p className="text-gray-600">Select users and send emails</p>
      </div>

      {/* Debug Logs Drawer */}
      <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="h-5 w-5 text-theme-primary" />
                  <CardTitle>Debug Logs</CardTitle>
                  <Badge variant="outline">{logs.length} entries</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {logsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              <CardDescription>
                View all console logs, email processes, and system events
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                    id="auto-refresh"
                  />
                  <Label htmlFor="auto-refresh" className="cursor-pointer">
                    Auto-refresh (2s)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLogs}
                    disabled={logsLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearLogs}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg bg-gray-50 max-h-[600px] overflow-y-auto">
                {logsLoading && logs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Loading logs...</div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No logs available</div>
                ) : (
                  <div className="divide-y">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 hover:bg-white transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Badge
                            variant="outline"
                            className={`${getLogLevelColor(log.level)} text-xs shrink-0`}
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {formatTimestamp(log.timestamp)}
                              </span>
                              {log.context && (
                                <Badge variant="outline" className="text-xs">
                                  {log.context}
                                </Badge>
                              )}
                            </div>
                            <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                              {log.message}
                            </pre>
                            {log.data && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                  View data
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Daily Notification Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={sendDailyNotifications}
            disabled={sendingDaily || selectedEmails.size === 0}
            className="w-full"
            size="lg"
            variant="default"
          >
            {sendingDaily ? (
              <>
                <Bell className="h-4 w-4 mr-2 animate-spin" />
                Sending Daily Notifications...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Send Daily Notifications ({selectedEmails.size} {selectedEmails.size === 1 ? 'recipient' : 'recipients'})
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Sends personalized emails with like counts and links to selected users
          </p>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button
          onClick={() => setFilterType('all')}
          variant={filterType === 'all' ? 'default' : 'outline'}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          All Users
        </Button>
        <Button
          onClick={() => setFilterType('with-entry')}
          variant={filterType === 'with-entry' ? 'default' : 'outline'}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          With Entry
        </Button>
        <Button
          onClick={() => setFilterType('without-entry')}
          variant={filterType === 'without-entry' ? 'default' : 'outline'}
          className="w-full"
        >
          <Users className="h-4 w-4 mr-2" />
          Without Entry
        </Button>
        <Button
          onClick={() => setFilterType('top-likes')}
          variant={filterType === 'top-likes' ? 'default' : 'outline'}
          className="w-full"
        >
          <Heart className="h-4 w-4 mr-2" />
          Top Liked
        </Button>
      </div>

      {/* Subscription Filter Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MailCheck className="h-5 w-5 text-theme-primary" />
              <div>
                <Label htmlFor="subscribed-only" className="text-base font-medium cursor-pointer">
                  Subscribed Users Only
                </Label>
                <p className="text-sm text-gray-500">
                  {subscribedOnly
                    ? 'Showing only users who are subscribed to email notifications'
                    : 'Showing all users including unsubscribed'}
                </p>
              </div>
            </div>
            <Switch
              id="subscribed-only"
              checked={subscribedOnly}
              onCheckedChange={setSubscribedOnly}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email List ({students.length})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="flex items-center gap-2"
              >
                {allSelected ? (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4" />
                    Select All
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              {selectedEmails.size > 0 && `${selectedEmails.size} selected`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.email}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedEmails.has(student.email)}
                      onCheckedChange={() => toggleEmail(student.email)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{student.name}</div>
                      <div className="text-sm text-gray-500 truncate">{student.email}</div>
                      {student.hasEntry && student.voteCount !== undefined && (
                        <div className="text-xs text-gray-400">
                          {student.voteCount} {student.voteCount === 1 ? 'like' : 'likes'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Composition */}
        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
            <CardDescription>Write your email subject and body</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Email body (plain text)"
                rows={12}
                className="resize-none"
              />
            </div>
            <Button
              onClick={sendEmails}
              disabled={sending || selectedEmails.size === 0}
              className="w-full"
              size="lg"
            >
              {sending ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send to {selectedEmails.size} {selectedEmails.size === 1 ? 'Recipient' : 'Recipients'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
