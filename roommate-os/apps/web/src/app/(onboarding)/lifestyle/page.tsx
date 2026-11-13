'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Skeleton } from '@/components/ui/Skeleton'

interface QuestionOption {
  value: string
  label: string
}

interface Question {
  id: string
  question_key: string
  dimension: string
  question_text: string
  options_json: QuestionOption[]
  order_num: number
}

interface AnswerState {
  [questionId: string]: string
}

export default function LifestyleAssessmentPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<AnswerState>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    async function loadQuestionsAndAnswers() {
      try {
        setLoading(true)
        setError(null)
        // Fetch active questions
        const qList = await apiFetch<Question[]>('/lifestyle/questions')
        setQuestions(qList)

        // Fetch user's existing answers if any
        try {
          const myAnswers = await apiFetch<Array<{ question_id: string; answer_value: string }>>('/lifestyle/my-answers')
          const initialMap: AnswerState = {}
          myAnswers.forEach((a) => {
            initialMap[a.question_id] = a.answer_value
          })
          setAnswers(initialMap)
        } catch {
          // No prior answers, default empty
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load lifestyle questions'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    loadQuestionsAndAnswers()
  }, [])

  function handleSelect(questionId: string, value: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Verify all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id])
    if (unanswered.length > 0) {
      setError(`Please answer all questions before proceeding (${unanswered.length} remaining).`)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const payload = {
        answers: questions.map((q) => ({
          question_id: q.id,
          answer_value: answers[q.id],
        })),
      }
      await apiFetch('/lifestyle/answers', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setSavedSuccess(true)
      setTimeout(() => {
        router.push('/discover')
      }, 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save lifestyle answers'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/onboarding/preferences"
          className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#0F172A] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Preferences</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
          <Sparkles className="w-4 h-4" />
          <span>Step 3 of 3: Compatibility Engine</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] mt-1">
          Lifestyle & Living Habits
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Answer these 3 core questions to compute weighted roommate compatibility scores for Kochi tech professionals.
        </p>
      </div>

      {error && <ErrorMessage message={error} className="mb-6" />}
      {savedSuccess && (
        <div className="mb-6 p-4 rounded-md bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Assessment saved! Redirecting to Roommate Discovery...</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, index) => {
            const currentSelected = answers[q.id]
            return (
              <Card key={q.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                      Question {index + 1} • {q.dimension.replace('_', ' ')}
                    </span>
                    <h2 className="text-base font-semibold text-[#0F172A] mt-1">
                      {q.question_text}
                    </h2>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  {q.options_json.map((opt) => {
                    const isSelected = currentSelected === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(q.id, opt.value)}
                        className={`w-full text-left p-3.5 rounded-md border text-sm transition-all duration-150 flex items-center justify-between ${
                          isSelected
                            ? 'border-[#4338CA] bg-[#EEF2FF] text-[#1E1B4B] font-medium'
                            : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#334155]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-[#4338CA] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            )
          })}

          <div className="pt-4 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Skip for now
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5"
            >
              {submitting ? 'Saving...' : 'Save & View Matches'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
