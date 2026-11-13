'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { AuthProvider } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

const preferencesSchema = z
  .object({
    min_budget: z.coerce.number().min(3000, 'Minimum budget must be at least ₹3,000'),
    max_budget: z.coerce.number().min(3000, 'Maximum budget must be at least ₹3,000'),
    move_in_date: z.string().min(1, 'Target move-in date is required'),
    preferred_stay_months: z.coerce.number().min(1, 'Please select minimum stay duration'),
  })
  .refine((data) => data.max_budget >= data.min_budget, {
    message: 'Maximum budget must be greater than or equal to minimum budget',
    path: ['max_budget'],
  })

type PreferencesFormValues = z.infer<typeof preferencesSchema>

function PreferencesForm() {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      min_budget: 10000,
      max_budget: 25000,
      move_in_date: new Date().toISOString().split('T')[0],
      preferred_stay_months: 6,
    },
  })

  const onSubmit = async (values: PreferencesFormValues) => {
    setApiError(null)
    try {
      await apiFetch('/profiles/preferences', {
        method: 'PUT',
        body: JSON.stringify(values),
      })
      router.push('/onboarding/lifestyle')
    } catch {
      router.push('/onboarding/lifestyle')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
            Step 2 of 3: Search Preferences
          </span>
          <Link
            href="/dashboard"
            className="text-xs text-[#94A3B8] hover:text-[#475569] underline underline-offset-2"
          >
            Skip for now
          </Link>
        </div>

        <Card className="p-8">
          <h1 className="text-xl font-bold text-[#0F172A] mb-2">
            Accommodation Preferences
          </h1>
          <p className="text-sm text-[#475569] mb-6">
            Help us filter compatible flatmates and properties within your budget range in Kakkanad & Infopark, Kochi.
          </p>

          {apiError && (
            <div className="mb-6">
              <ErrorMessage message={apiError} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Budget (₹ / month)"
                type="number"
                step="500"
                error={errors.min_budget?.message}
                {...register('min_budget')}
              />
              <Input
                label="Maximum Budget (₹ / month)"
                type="number"
                step="500"
                error={errors.max_budget?.message}
                {...register('max_budget')}
              />
            </div>

            <Input
              label="Earliest Move-in Date"
              type="date"
              error={errors.move_in_date?.message}
              {...register('move_in_date')}
            />

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Preferred Minimum Stay
              </label>
              <select
                id="duration"
                {...register('preferred_stay_months')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4338CA] focus:border-[#4338CA]"
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={11}>11 Months (Standard Tenancy)</option>
                <option value={12}>12+ Months</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full mt-4"
            >
              Save Preferences and Continue to Lifestyle Assessment
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function PreferencesOnboardingPage() {
  return (
    <AuthProvider>
      <PreferencesForm />
    </AuthProvider>
  )
}

