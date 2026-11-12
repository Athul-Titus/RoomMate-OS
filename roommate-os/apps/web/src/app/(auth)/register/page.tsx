'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

const registerSchema = z
  .object({
    display_name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be 50 characters or less')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    agree_terms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
    agree_privacy: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Privacy Policy' }),
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: authRegister } = useAuth()
  const [apiError, setApiError] = useState<{ message: string; requestId?: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null)
    try {
      await authRegister({
        email: values.email,
        password: values.password,
        display_name: values.display_name,
      })
      router.push('/onboarding/profile')
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError({ message: err.message, requestId: err.requestId })
      } else {
        setApiError({ message: 'An unexpected error occurred. Please try again.' })
      }
    }
  }

  return (
    <>
      <h1 className="text-xl font-semibold text-[#0F172A] mb-6">
        Create your account
      </h1>

      {apiError && (
        <div className="mb-4">
          <ErrorMessage message={apiError.message} requestId={apiError.requestId} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Display name"
          type="text"
          autoComplete="name"
          placeholder="How you appear to other members"
          error={errors.display_name?.message}
          {...register('display_name')}
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <p className="mt-1 text-xs text-[#94A3B8]">
            Must be at least 8 characters with at least one letter and one number.
          </p>
        </div>

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />

        {/* Consent checkboxes */}
        <fieldset className="space-y-3 pt-1">
          <legend className="sr-only">Required agreements</legend>

          <div className="flex items-start gap-3">
            <input
              id="agree_terms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[#E2E8F0] text-[#4338CA] focus:ring-[#4338CA] accent-[#4338CA]"
              aria-describedby={errors.agree_terms ? 'agree_terms-error' : undefined}
              aria-invalid={errors.agree_terms ? 'true' : undefined}
              {...register('agree_terms')}
            />
            <label htmlFor="agree_terms" className="text-sm text-[#475569] leading-snug">
              I have read and agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4338CA] hover:text-[#3730A3] underline underline-offset-2"
              >
                Terms of Service
              </Link>
            </label>
          </div>
          {errors.agree_terms && (
            <p id="agree_terms-error" className="text-xs text-[#DC2626] ml-7" role="alert">
              {errors.agree_terms.message}
            </p>
          )}

          <div className="flex items-start gap-3">
            <input
              id="agree_privacy"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-[#E2E8F0] text-[#4338CA] focus:ring-[#4338CA] accent-[#4338CA]"
              aria-describedby={errors.agree_privacy ? 'agree_privacy-error' : undefined}
              aria-invalid={errors.agree_privacy ? 'true' : undefined}
              {...register('agree_privacy')}
            />
            <label htmlFor="agree_privacy" className="text-sm text-[#475569] leading-snug">
              I have read and agree to the{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4338CA] hover:text-[#3730A3] underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agree_privacy && (
            <p id="agree_privacy-error" className="text-xs text-[#DC2626] ml-7" role="alert">
              {errors.agree_privacy.message}
            </p>
          )}
        </fieldset>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Create account
        </Button>
      </form>

      <p className="mt-5 text-sm text-center text-[#475569]">
        Already have an account?{' '}
        <Link
          href="/sign-in"
          className="text-[#4338CA] hover:text-[#3730A3] font-medium underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </>
  )
}
