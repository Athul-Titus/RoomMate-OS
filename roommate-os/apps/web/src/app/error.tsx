'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log unexpected client error to monitoring without exposing stack to user
    console.error('App client error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md bg-white border border-[#E2E8F0] rounded-lg p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#0F172A] mb-2">Something went wrong</h1>
        <p className="text-sm text-[#475569] mb-6">
          An unexpected error occurred while rendering this page.
        </p>
        <Button onClick={() => reset()} variant="primary" size="md">
          Try again
        </Button>
      </div>
    </div>
  )
}

