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

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [apiError, setApiError] = useState<{ message: string; requestId?: string } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (values: SignInFormValues) => {
    setApiError(null)
    try {
      await login(values)
      router.push('/dashboard')
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
        Sign in to ROOMMATE OS
      </h1>

      {apiError && (
        <div className="mb-4">
          <ErrorMessage message={apiError.message} requestId={apiError.requestId} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-sm text-center text-[#475569]">
        No account yet?{' '}
        <Link
          href="/register"
          className="text-[#4338CA] hover:text-[#3730A3] font-medium underline underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </>
  )
}
