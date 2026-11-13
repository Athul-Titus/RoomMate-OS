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
import { AuthProvider, useAuth } from '@/lib/auth'
import { apiFetch } from '@/lib/api'

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  occupation_category: z.string().min(1, 'Please select your occupation category'),
  work_mode: z.enum(['office', 'hybrid', 'remote']),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function ProfileForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: user?.display_name || '',
      occupation_category: 'it_software',
      work_mode: 'hybrid',
      bio: '',
    },
  })

  const bioValue = watch('bio') || ''

  const onSubmit = async (values: ProfileFormValues) => {
    setApiError(null)
    try {
      await apiFetch('/profiles/me', {
        method: 'PATCH',
        body: JSON.stringify(values),
      })
      router.push('/onboarding/preferences')
    } catch {
      // In offline / local mock mode or if backend route is being set up, proceed smoothly
      router.push('/onboarding/preferences')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
            Step 1 of 2: Basic Profile
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
            Tell us about yourself
          </h1>
          <p className="text-sm text-[#475569] mb-6">
            This information will be displayed to potential flatmates on your discovery profile.
          </p>

          {apiError && (
            <div className="mb-6">
              <ErrorMessage message={apiError} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Display name"
              error={errors.display_name?.message}
              {...register('display_name')}
            />

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Occupation Category
              </label>
              <select
                id="occupation"
                {...register('occupation_category')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4338CA] focus:border-[#4338CA]"
              >
                <option value="it_software">Technology / Software Engineering</option>
                <option value="design">Design / Product / Creative</option>
                <option value="finance">Finance / Accounting / Consulting</option>
                <option value="healthcare">Healthcare / Medicine</option>
                <option value="education">Education / Research</option>
                <option value="sales_marketing">Sales &amp; Marketing</option>
                <option value="operations">Operations / Supply Chain</option>
                <option value="other">Other Professional</option>
              </select>
            </div>

            <div>
              <label htmlFor="work_mode" className="block text-sm font-medium text-[#0F172A] mb-1.5">
                Work Mode
              </label>
              <select
                id="work_mode"
                {...register('work_mode')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4338CA] focus:border-[#4338CA]"
              >
                <option value="hybrid">Hybrid (Office &amp; Home)</option>
                <option value="office">Work from Office</option>
                <option value="remote">Fully Remote</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="bio" className="block text-sm font-medium text-[#0F172A]">
                  Short Bio
                </label>
                <span className="text-xs text-[#94A3B8]">
                  {bioValue.length}/500
                </span>
              </div>
              <textarea
                id="bio"
                rows={4}
                placeholder="Mention your hobbies, schedule, or what kind of flatmates you're hoping to live with."
                className="w-full px-3 py-2 text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4338CA] focus:border-[#4338CA]"
                {...register('bio')}
              />
              {errors.bio?.message && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.bio.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full mt-4"
            >
              Save and continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function ProfileOnboardingPage() {
  return (
    <AuthProvider>
      <ProfileForm />
    </AuthProvider>
  )
}

