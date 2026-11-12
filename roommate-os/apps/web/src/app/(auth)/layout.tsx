import Link from 'next/link'
import { AuthProvider } from '@/lib/auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12">
        {/* Wordmark */}
        <div className="mb-8 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-[#0F172A] text-white text-sm font-bold">
            R
          </span>
          <span className="text-lg font-semibold text-[#0F172A] tracking-tight">
            ROOMMATE OS
          </span>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-xl shadow-sm px-6 py-8">
          {children}
        </div>

        {/* Footer links */}
        <footer className="mt-6 text-xs text-[#94A3B8] flex gap-4">
          <Link
            href="/privacy"
            className="hover:text-[#475569] transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-[#475569] transition-colors underline underline-offset-2"
          >
            Terms of Service
          </Link>
        </footer>
      </div>
    </AuthProvider>
  )
}
