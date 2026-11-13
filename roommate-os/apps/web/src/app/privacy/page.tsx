import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | ROOMMATE OS',
  description: 'Privacy Policy and data protection terms for ROOMMATE OS platform in India.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#475569] hover:text-[#0F172A]">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
          <span className="font-semibold text-sm">ROOMMATE OS</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Effective Date: November 12, 2026 | Last Updated: November 2026
            </p>
          </div>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">1. Overview and Scope</h2>
            <p>
              ROOMMATE OS (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides shared-rental roommate discovery, group formation, and tenancy coordination services for working professionals in India. This Privacy Policy outlines our practices regarding the collection, storage, processing, and protection of your personal data in compliance with applicable Indian laws, including the Digital Personal Data Protection Act, 2023 (DPDP Act).
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Email address and encrypted password hash. We never store passwords in plaintext.</li>
              <li><strong>Profile Information:</strong> Display name, optional bio, occupation category, work mode (remote/hybrid/office), and accommodation budget range.</li>
              <li><strong>Lifestyle and Compatibility Responses:</strong> Answers provided in questionnaires regarding sleeping schedules, cleanliness expectations, social preferences, and house rules.</li>
              <li><strong>Location Data:</strong> Preferred city and target neighbourhoods in Bengaluru. We do not track continuous background GPS location.</li>
              <li><strong>Communications and Audit Logs:</strong> Timestamped records of user actions, account state transitions, and messages exchanged within the platform.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">3. How We Use Your Information</h2>
            <p>We process your personal information strictly for legitimate operational purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To compute transparent, explainable compatibility scores between prospective flatmates.</li>
              <li>To facilitate group formation, joint property shortlists, and group voting workflows.</li>
              <li>To authenticate sessions and safeguard accounts against brute-force attacks and abuse.</li>
              <li>To comply with regulatory audit requirements and process trust and safety reports.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">4. What We Do NOT Do</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>We never sell your personal data or profile details to third-party advertisers or brokers.</li>
              <li>We do not publicly expose your exact home address or contact details without explicit consent.</li>
              <li>We do not deploy automated decision-making that permanently excludes users based on protected attributes.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">5. Data Security and Storage</h2>
            <p>
              Your data is stored securely in encrypted databases and private object storage with role-based server-side access controls. Authentication utilizes cryptographic tokens with short expiry periods. All sensitive operations maintain an immutable audit trail.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">6. Your Rights Under DPDP Act 2023</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access a summary of the personal data we hold about you.</li>
              <li>Request correction or updating of inaccurate information.</li>
              <li>Request deletion of your account and personal data, subject to lawful retention requirements.</li>
              <li>Nominate a representative in the event of death or incapacity.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">7. Grievance Officer and Inquiries</h2>
            <p>
              In accordance with the DPDP Act 2023, for questions, data subject requests, or grievances regarding data processing, contact our Grievance Officer at:
            </p>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs font-mono">
              Grievance Officer: Legal &amp; Privacy Desk<br />
              Entity: ROOMMATE OS<br />
              Email: privacy@roommateos.com<br />
              Bengaluru, Karnataka, India
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

