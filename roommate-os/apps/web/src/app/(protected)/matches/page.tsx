'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Calendar,
  Check,
  ShieldAlert,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Skeleton } from '@/components/ui/Skeleton'

interface PartnerInfo {
  user_id: string
  display_name: string
  bio: string | null
  occupation_category: string | null
  work_mode: string | null
  min_budget: number | null
  max_budget: number | null
  compatibility_score: number
  alignments: string[]
}

interface MutualMatchItem {
  id: string
  partner: PartnerInfo
  compatibility_score: number
  matched_at: string
  conversation_id: string | null
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MutualMatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch<MutualMatchItem[]>('/matches')
        setMatches(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load mutual matches'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Mutual Matches
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Flatmates where both of you expressed interest. Double opt-in chat unlocked.
          </p>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md transition-colors"
        >
          <span>Discover more</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : matches.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#4338CA] flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            No mutual matches yet
          </h2>
          <p className="text-sm text-[#64748B] max-w-sm mx-auto mt-1 mb-6">
            When you and another candidate in Kakkanad both express interest, your match will appear here with an open chat channel.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-md transition-colors"
          >
            <span>Explore Discovery Feed</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((m) => {
            const p = m.partner
            return (
              <Card key={m.id} className="p-5 hover:border-[#CBD5E1] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-bold text-lg shrink-0">
                      {p.display_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-[#0F172A]">
                          {p.display_name}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                          <Sparkles className="w-3 h-3 text-[#059669]" />
                          <span>{m.compatibility_score}% Match</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {p.occupation_category?.replace('_', ' ') || 'Working Professional'} • Kakkanad IT Corridor
                      </p>
                      {p.alignments && p.alignments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {p.alignments.slice(0, 2).map((a, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[11px] text-[#065F46] bg-[#F0FDF4] px-2 py-0.5 rounded">
                              <Check className="w-3 h-3 text-[#16A34A]" />
                              <span>{a}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 sm:self-center">
                    {m.conversation_id ? (
                      <Link
                        href={`/chat/${m.conversation_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat Now</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">
                        Conversation initializing...
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
