import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | ROOMMATE OS',
  description: 'Terms and conditions governing the use of the ROOMMATE OS platform.',
}

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Effective Date: November 12, 2026 | Last Updated: November 2026
            </p>
          </div>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">1. Nature of the Platform</h2>
            <p>
              ROOMMATE OS is a peer-to-peer technology platform that assists working professionals with roommate discovery, compatibility evaluation, group search coordination, and shared tenancy record keeping. ROOMMATE OS is not a real estate broker, property manager, escrow agent, or landlord.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">2. User Eligibility and Representations</h2>
            <p>By creating an account, you represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are at least 18 years of age.</li>
              <li>You are a working professional, employee, intern, or student seeking bona fide shared accommodation.</li>
              <li>All information provided during registration and profile completion is truthful and accurate.</li>
              <li>You will not impersonate any individual or misrepresent your employment or living habits.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">3. Financial Disclaimer: No Escrow or Rent Custody</h2>
            <p>
              ROOMMATE OS does not hold, manage, or transfer security deposits, monthly rent, or utility payments. Any financial agreements, splits, or transfers are conducted directly between roommates and landlords or property owners. We are not responsible for financial disputes or unpaid obligations between parties.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">4. Property Listings and Due Diligence</h2>
            <p>
              Listings published on the platform are provided by individual flatmates, existing households, or property owners. While we provide verification badges (e.g., phone confirmed, reviewed authority), badges reflect verified verification steps and do not guarantee property condition, legal title, or safety. Users must exercise independent physical inspection and due diligence prior to signing tenancy agreements or transferring funds.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">5. Rental Agreements and Legal Advice</h2>
            <p>
              Any agreement templates, checklists, or move-in condition records generated or stored on ROOMMATE OS are administrative tools only and do not constitute legal advice. We make no warranty regarding their legal enforceability in Indian courts.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">6. Prohibited Conduct</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Posting fraudulent, defamatory, discriminatory, or unlawful content.</li>
              <li>Harassing, stalking, or threatening other members.</li>
              <li>Scraping, reverse engineering, or exploiting platform APIs or security controls.</li>
              <li>Submitting bad-faith reports against other users or listings.</li>
            </ul>
            <p>Violations will result in immediate suspension or termination of access.</p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">7. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#475569] leading-relaxed">
            <h2 className="text-base font-semibold text-[#0F172A]">8. Contact Information</h2>
            <p>
              For legal inquiries or notices regarding these Terms, contact our legal desk at:
            </p>
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs font-mono">
              Legal Operations<br />
              Entity: ROOMMATE OS<br />
              Email: legal@roommateos.com<br />
              Bengaluru, Karnataka, India
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

