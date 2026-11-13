'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Search, Users, Building2, User, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/matches', label: 'Matches', icon: Users },
  { href: '/onboarding/lifestyle', label: 'Habits Quiz', icon: Sparkles },
  { href: '/onboarding/profile', label: 'Profile', icon: User },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <nav
      className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-[#0F172A] text-base tracking-tight hover:opacity-80 transition-opacity"
            aria-label="ROOMMATE OS - go to dashboard"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-[#0F172A] text-white text-xs font-bold">
              R
            </span>
            <span className="hidden sm:inline">ROOMMATE OS</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-[#EEF2FF] text-[#4338CA]'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right side: user + logout */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <span className="text-sm text-[#475569]">{user.display_name}</span>
            )}
            <button
              onClick={logout}
              className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors px-3 py-2 rounded-md hover:bg-[#F1F5F9]"
              type="button"
            >
              Sign out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[#E2E8F0] bg-white"
        >
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-[#EEF2FF] text-[#4338CA]'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
            <div className="pt-2 border-t border-[#E2E8F0]">
              {user && (
                <p className="px-3 py-1 text-xs text-[#94A3B8]">{user.email}</p>
              )}
              <button
                onClick={() => {
                  setMobileOpen(false)
                  logout()
                }}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                type="button"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
