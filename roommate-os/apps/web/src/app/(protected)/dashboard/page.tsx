'use client'

import Link from 'next/link'
import { Users, Building2, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Dashboard
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Welcome back{user?.display_name ? `, ${user.display_name}` : ''}. Manage your roommate discovery and group activities.
        </p>
      </div>

      {/* Profile Onboarding Card */}
      <Card className="p-6 border-l-4 border-l-[#4338CA]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4338CA]" />
              <span>Complete your living preferences</span>
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              Set your target budget, preferred neighbourhoods in Bengaluru, and habits to view compatible roommate matches.
            </p>
          </div>
          <Link
            href="/onboarding/profile"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] rounded-md transition-colors shrink-0"
          >
            <span>Update profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>

      {/* Primary Action Modules */}
      <div>
        <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
          Core Workflows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4338CA] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] mb-1">
                Discover Flatmates
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">
                Browse profiles filtered by relocation city, move-in window, and lifestyle questionnaire alignment.
              </p>
            </div>
            <Link
              href="/onboarding/preferences"
              className="inline-flex items-center text-sm font-medium text-[#4338CA] hover:text-[#3730A3] gap-1"
            >
              <span>Manage search filters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4338CA] mb-4">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] mb-1">
                Search Groups
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">
                Form a group with prospective flatmates or colleagues to set combined budgets and joint preferences.
              </p>
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">
              Available once matched with flatmates
            </span>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-md bg-[#EEF2FF] flex items-center justify-center text-[#4338CA] mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#0F172A] mb-1">
                Properties &amp; Listings
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">
                Discover available rooms and flats across Bengaluru. Shortlist and vote with your group.
              </p>
            </div>
            <span className="text-xs font-medium text-[#94A3B8]">
              Verified property catalog in Phase 3
            </span>
          </Card>
        </div>
      </div>
    </div>
  )
}

