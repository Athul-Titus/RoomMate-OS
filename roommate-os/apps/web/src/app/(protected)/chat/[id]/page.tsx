'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  ShieldAlert,
  MoreVertical,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
} from 'lucide-react'
import { apiFetch, getAuthToken } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Skeleton } from '@/components/ui/Skeleton'

interface MessageItem {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

interface ConversationInfo {
  id: string
  partner_id: string
  partner_name: string
  last_message: MessageItem | null
  unread_count: number
  updated_at: string
}

export default function ChatConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const conversationId = params?.id as string

  const [messages, setMessages] = useState<MessageItem[]>([])
  const [partnerName, setPartnerName] = useState<string>('Match')
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [inputContent, setInputContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wsConnected, setWsConnected] = useState(false)

  // Safety menu & modals
  const [showMenu, setShowMenu] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('harassment')
  const [reportDesc, setReportDesc] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 1. Load conversation metadata & message history
  useEffect(() => {
    if (!conversationId) return

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Try to find partner from conversations list
        try {
          const convList = await apiFetch<ConversationInfo[]>('/conversations')
          const current = convList.find((c) => c.id === conversationId)
          if (current) {
            setPartnerName(current.partner_name)
            setPartnerId(current.partner_id)
          }
        } catch {
          // Fallback if list fails
        }

        // Fetch messages
        const msgList = await apiFetch<MessageItem[]>(`/conversations/${conversationId}/messages`)
        setMessages(msgList)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load conversation'
        setError(msg)
      } finally {
        setLoading(false)
        setTimeout(scrollToBottom, 100)
      }
    }

    loadData()
  }, [conversationId])

  // 2. Setup WebSocket real-time listener
  useEffect(() => {
    if (!conversationId) return
    const token = getAuthToken()
    if (!token) return

    const wsUrl = `ws://localhost:8000/api/v1/ws/conversations/${conversationId}?token=${token}`
    let socket: WebSocket

    try {
      socket = new WebSocket(wsUrl)
      wsRef.current = socket

      socket.onopen = () => {
        setWsConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_message' && data.message) {
            const incoming: MessageItem = data.message
            setMessages((prev) => {
              if (prev.some((m) => m.id === incoming.id)) return prev
              return [...prev, incoming]
            })
            setTimeout(scrollToBottom, 50)
          }
        } catch {
          // Ignored
        }
      }

      socket.onclose = () => {
        setWsConnected(false)
      }

      socket.onerror = () => {
        setWsConnected(false)
      }
    } catch {
      setWsConnected(false)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [conversationId])

  // 3. Send message handler
  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = inputContent.trim()
    if (!content || sending) return

    try {
      setSending(true)
      const res = await apiFetch<MessageItem>(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      })

      // Add to local state if not already pushed by WS
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.id)) return prev
        return [...prev, res]
      })
      setInputContent('')
      setTimeout(scrollToBottom, 50)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // 4. Moderation actions
  async function handleBlockUser() {
    if (!partnerId) return
    if (!confirm(`Are you sure you want to block ${partnerName}? This conversation will be removed.`)) {
      return
    }
    try {
      await apiFetch(`/users/${partnerId}/block`, { method: 'POST' })
      alert(`${partnerName} has been blocked.`)
      router.push('/matches')
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to block user')
    }
  }

  async function handleReportUser(e: React.FormEvent) {
    e.preventDefault()
    if (!partnerId) return
    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reported_user_id: partnerId,
          reason: reportReason,
          description: reportDesc,
        }),
      })
      setReportSuccess(true)
      setTimeout(() => {
        setShowReportModal(false)
        setReportSuccess(false)
        setReportDesc('')
      }, 1500)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit report')
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Conversation Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-[#E2E8F0] rounded-t-md">
        <div className="flex items-center gap-3">
          <Link
            href="/matches"
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded transition-colors"
            title="Back to matches"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="w-9 h-9 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
            {partnerName.charAt(0)}
          </div>

          <div>
            <h1 className="text-sm font-semibold text-[#0F172A]">
              {partnerName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span>Mutual Match</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'}`} />
                <span>{wsConnected ? 'Active now' : 'Connected'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Safety Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-[#64748B] hover:text-[#0F172A] rounded hover:bg-[#F1F5F9] transition-colors"
            title="Conversation Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E2E8F0] rounded-md shadow-lg z-20 py-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  setShowReportModal(true)
                }}
                className="w-full text-left px-3 py-2 text-[#EF4444] hover:bg-[#FEF2F2] flex items-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report User</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false)
                  handleBlockUser()
                }}
                className="w-full text-left px-3 py-2 text-[#475569] hover:bg-[#F1F5F9] flex items-center gap-2 border-t border-[#F1F5F9]"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] border-x border-[#E2E8F0] space-y-3">
        {error && <ErrorMessage message={error} />}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-12 w-64 ml-auto" />
            <Skeleton className="h-12 w-52" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748B]">
            <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center mb-3">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-[#0F172A]">Double opt-in verified</p>
            <p className="text-xs max-w-xs mt-1">
              You both expressed interest. Say hi and discuss flats, moving timelines, or location preferences around Kakkanad!
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = user?.id ? m.sender_id === user.id : false
            const timeStr = new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-md text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[#4338CA] text-white rounded-br-xs'
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] mt-1 px-1">
                  <span>{timeStr}</span>
                  {isMe && (
                    <span>
                      {m.is_read ? (
                        <CheckCheck className="w-3 h-3 text-[#4338CA]" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 p-3 bg-white border border-[#E2E8F0] rounded-b-md"
      >
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder={`Message ${partnerName}... (Press Enter to send)`}
          className="flex-1 text-sm bg-transparent border-0 focus:outline-none px-2 py-1 text-[#0F172A] placeholder:text-[#94A3B8]"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!inputContent.trim() || sending}
          className="px-4 py-2 text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5 mr-1" />
          <span>Send</span>
        </Button>
      </form>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                <span>Report {partnerName}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded bg-[#ECFDF5] text-[#065F46] text-sm">
                Report submitted for moderation review. Thank you for keeping ROOMMATE OS safe.
              </div>
            ) : (
              <form onSubmit={handleReportUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-sm border border-[#E2E8F0] rounded-md px-3 py-2 bg-white"
                  >
                    <option value="harassment">Harassment / Inappropriate Messages</option>
                    <option value="scam_deposit">Asking for unauthorized deposit / bank transfer</option>
                    <option value="spam">Spam / Unsolicited Promotion</option>
                    <option value="fake_identity">Fake Identity or Profile</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Describe what occurred in this chat..."
                    className="w-full text-sm border border-[#E2E8F0] rounded-md p-2.5"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
                  >
                    Cancel
                  </button>
                  <Button type="submit" size="sm" variant="danger">
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
