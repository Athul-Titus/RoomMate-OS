import Link from 'next/link'
import { Users, Home, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-base tracking-tight">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#0F172A] text-white text-xs font-bold">
              R
            </span>
            <span>ROOMMATE OS</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-3.5 py-1.5 text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-md transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] rounded-md transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EEF2FF] text-[#4338CA] text-xs font-medium mb-6">
            Pilot launch in Kochi (Kakkanad & Infopark)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] leading-tight mb-4">
            Shared-rental platform for working professionals
          </h1>
          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto mb-8 leading-relaxed">
            Connect with verified roommates based on genuine lifestyle compatibility. Form a group, discover suitable flats in Kakkanad and Infopark, and coordinate rental decisions together.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] rounded-md transition-colors"
            >
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-md transition-colors"
            >
              Sign in to your account
            </Link>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="border-t border-[#E2E8F0] pt-12">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-8 text-center">
              How ROOMMATE OS works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4338CA] mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] mb-2">
                  1. Lifestyle compatibility
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Evaluate real living habits: sleep schedules, cleanliness standards, work arrangements, guest expectations, and budget alignment before matching.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4338CA] mb-4">
                  <Home className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] mb-2">
                  2. Joint group search
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Form search groups with colleagues or compatible matches. Shortlist listings, vote on properties, and make collaborative rental decisions.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm">
                <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4338CA] mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#0F172A] mb-2">
                  3. Transparent records
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Maintain clear tenancy records, move-in condition documentation, split expense records, and replace flatmates without restarting from zero.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Operating Standards */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              Platform principles
            </h2>
            <ul className="space-y-3 text-sm text-[#475569]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Exact residential addresses remain private until authorized access is granted.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>No platform custody of user deposits or rent funds. All payments occur directly between parties.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Verifiable verification badges: phone confirmed, email confirmed, or manager reviewed. No vague labels.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span>Governed in compliance with the Digital Personal Data Protection Act (DPDP), India.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F172A]">ROOMMATE OS</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#475569] underline underline-offset-2 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#475569] underline underline-offset-2 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

