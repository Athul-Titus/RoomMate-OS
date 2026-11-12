import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ROOMMATE OS',
  description: 'Find compatible flatmates and suitable homes in Bengaluru.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-[#F8FAFC] text-[#0F172A]">
        <QueryProvider>
          <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            {children}
          </main>
        </QueryProvider>
      </body>
    </html>
  )
}
