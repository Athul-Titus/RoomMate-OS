'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  MapPin,
  Briefcase,
  Calendar,
  Check,
  AlertTriangle,
  X,
  Heart,
  Bookmark,
  MessageSquare,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Skeleton } from '@/components/ui/Skeleton'

interface DiscoveryCandidate {
  user_id: string
  display_name: string
  bio: string | null
  occupation_category: string | null
  work_mode: string | null
  min_budget: number | null
  max_budget: number | null
  move_in_from: string | null
  preferred_stay_months: number | null
  compatibility_score: number
  alignments: string[]
  potential_frictions: string[]
  my_action: string | null
}

interface ActionResponse {
  user_id: string
  target_user_id: string
  action: string
  is_mutual_match: boolean
  conversation_id: string | null
}

export default function DiscoverPage() {
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mutual Match Modal State
  const [matchModal, setMatchModal] = useState<{
    isOpen: boolean
    candidateName: string
    conversationId: string
  }>({
    isOpen: false,
    candidateName: '',
    conversationId: '',
  })

  // Moderation state
  const [reportTarget, setReportTarget] = useState<DiscoveryCandidate | null>(null)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDescription, setReportDescription] = useState('')
  const [reportSuccess, setReportSuccess] = useState(false)

  async function loadCandidates() {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<DiscoveryCandidate[]>('/discovery/people')
      setCandidates(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load discovery candidates'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCandidates()
  }, [])

  async function handleAction(candidate: DiscoveryCandidate, action: 'pass' | 'save' | 'express_interest') {
    try {
      setActionLoading(candidate.user_id)
      const res = await apiFetch<ActionResponse>('/discovery/actions', {
        method: 'POST',
        body: JSON.stringify({
          target_user_id: candidate.user_id,
          action,
        }),
      })

      if (action === 'pass') {
        // Remove from feed
        setCandidates((prev) => prev.filter((c) => c.user_id !== candidate.user_id))
      } else {
        // Update action in-place
        setCandidates((prev) =>
          prev.map((c) => (c.user_id === candidate.user_id ? { ...c, my_action: action } : c))
        )
      }

      if (res.is_mutual_match && res.conversation_id) {
        setMatchModal({
          isOpen: true,
          candidateName: candidate.display_name,
          conversationId: res.conversation_id,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed. Please try again.'
      setError(msg)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleBlock(targetId: string) {
    if (!confirm('Are you sure you want to block this user? You will no longer see each other.')) {
      return
    }
    try {
      await apiFetch(`/users/${targetId}/block`, { method: 'POST' })
      setCandidates((prev) => prev.filter((c) => c.user_id !== targetId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to block user')
    }
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault()
    if (!reportTarget) return
    try {
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reported_user_id: reportTarget.user_id,
          reason: reportReason,
          description: reportDescription,
        }),
      })
      setReportSuccess(true)
      setTimeout(() => {
        setReportTarget(null)
        setReportSuccess(false)
        setReportDescription('')
      }, 1500)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to submit report')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Discover Flatmates
          </h1>
          <p className="text-sm text-[#475569] mt-0.5 flex items-center gap-2">
            <span>Kochi, Kerala (Kakkanad & Infopark Corridor)</span>
            <span className="text-[#CBD5E1]">•</span>
            <span>Double opt-in verification</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/onboarding/preferences"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-md transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Search Filters</span>
          </Link>
          <Link
            href="/onboarding/lifestyle"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#4338CA] bg-[#EEF2FF] border border-[#C7D2FE] hover:bg-[#E0E7FF] rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Habits Quiz</span>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : candidates.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#F1F5F9] text-[#64748B] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-[#0F172A]">
            You've seen all compatible flatmates for now
          </h2>
          <p className="text-sm text-[#64748B] max-w-md mx-auto mt-1 mb-6">
            New professionals relocate to Kakkanad and Infopark weekly. Update your lifestyle assessment or search budget to see more profiles.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/onboarding/preferences"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md transition-colors"
            >
              <span>Broaden preferences</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {candidates.map((c) => {
            const isProcessing = actionLoading === c.user_id
            const hasExpressedInterest = c.my_action === 'express_interest'
            const hasSaved = c.my_action === 'save'

            return (
              <Card key={c.user_id} className="p-6 flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
                <div>
                  {/* Top Bar: Name, Role & Compatibility Badge */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[#0F172A] text-white flex items-center justify-center font-bold text-base shrink-0">
                        {c.display_name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[#0F172A]">
                          {c.display_name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                          {c.occupation_category && (
                            <span className="capitalize">{c.occupation_category.replace('_', ' ')}</span>
                          )}
                          {c.work_mode && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{c.work_mode}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                        <Sparkles className="w-3 h-3 text-[#059669]" />
                        <span>{c.compatibility_score}% Match</span>
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {c.bio && (
                    <p className="text-sm text-[#334155] leading-relaxed mb-4">
                      {c.bio}
                    </p>
                  )}

                  {/* Budget & Tenancy Info Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-[#475569]">
                    {(c.min_budget || c.max_budget) && (
                      <span className="px-2.5 py-1 rounded bg-[#F1F5F9] border border-[#E2E8F0] font-medium text-[#0F172A]">
                        ₹{Number(c.min_budget || 0).toLocaleString('en-IN')} – ₹{Number(c.max_budget || 0).toLocaleString('en-IN')}/mo
                      </span>
                    )}
                    {c.preferred_stay_months && (
                      <span className="px-2.5 py-1 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#64748B]" />
                        <span>{c.preferred_stay_months} months</span>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded bg-[#F1F5F9] border border-[#E2E8F0] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#64748B]" />
                      <span>Kakkanad / Infopark</span>
                    </span>
                  </div>

                  {/* Alignments Breakdown */}
                  {c.alignments.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-[#F1F5F9]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] mb-1.5 block">
                        Lifestyle Alignments
                      </span>
                      <ul className="space-y-1">
                        {c.alignments.map((align, i) => (
                          <li key={i} className="text-xs text-[#334155] flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                            <span>{align}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Frictions */}
                  {c.potential_frictions.length > 0 && (
                    <div className="mb-4 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#D97706] mb-1.5 block">
                        Noted Differences
                      </span>
                      <ul className="space-y-1">
                        {c.potential_frictions.map((fric, i) => (
                          <li key={i} className="text-xs text-[#64748B] flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                            <span>{fric}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(c, 'pass')}
                      className="px-3 py-1.5 rounded-md border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                      title="Pass"
                    >
                      <X className="w-3.5 h-3.5 inline mr-1" />
                      <span>Pass</span>
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction(c, 'save')}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        hasSaved
                          ? 'border-[#0F172A] bg-[#0F172A] text-white'
                          : 'border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                      }`}
                      title="Save candidate"
                    >
                      <Bookmark className="w-3.5 h-3.5 inline mr-1" />
                      <span>{hasSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReportTarget(c)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] rounded transition-colors"
                      title="Report candidate"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleAction(c, 'express_interest')}
                      className={`px-4 text-xs font-semibold ${
                        hasExpressedInterest
                          ? 'bg-[#15803D] hover:bg-[#166534]'
                          : 'bg-[#4338CA] hover:bg-[#3730A3]'
                      }`}
                    >
                      {hasExpressedInterest ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          <span>Interest Sent</span>
                        </>
                      ) : (
                        <>
                          <Heart className="w-3.5 h-3.5 mr-1 fill-current" />
                          <span>Connect</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Mutual Match Modal */}
      {matchModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6 text-center animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center mx-auto mb-4 border border-[#A7F3D0]">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">
              It's a Mutual Match!
            </h2>
            <p className="text-sm text-[#475569] mt-2 leading-relaxed">
              You and <strong className="text-[#0F172A]">{matchModal.candidateName}</strong> both expressed interest in rooming together in Kochi. Your direct conversation is now unlocked.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/chat/${matchModal.conversationId}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Start Conversation</span>
              </Link>
              <button
                type="button"
                onClick={() => setMatchModal({ isOpen: false, candidateName: '', conversationId: '' })}
                className="px-4 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Keep Browsing
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                <span>Report {reportTarget.display_name}</span>
              </h2>
              <button
                type="button"
                onClick={() => setReportTarget(null)}
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
              <form onSubmit={submitReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full text-sm border border-[#E2E8F0] rounded-md px-3 py-2 bg-white"
                  >
                    <option value="spam">Spam / Unsolicited Promotion</option>
                    <option value="harassment">Harassment or Inappropriate Behavior</option>
                    <option value="fake_profile">Misleading or Fake Information</option>
                    <option value="scam_deposit">Asking for unauthorized deposit / advance</option>
                    <option value="other">Other Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide context for the Trust & Safety team..."
                    className="w-full text-sm border border-[#E2E8F0] rounded-md p-2.5"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = reportTarget.user_id
                      setReportTarget(null)
                      handleBlock(id)
                    }}
                    className="text-xs text-[#EF4444] hover:underline"
                  >
                    Block user instead
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReportTarget(null)}
                      className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
                    >
                      Cancel
                    </button>
                    <Button type="submit" size="sm" variant="danger">
                      Submit Report
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
