import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded bg-[#0F172A] text-white text-base font-bold mb-4">
        R
      </span>
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Page Not Found</h1>
      <p className="text-sm text-[#475569] max-w-md mb-6">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium text-white bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] rounded-md transition-colors"
      >
        Return to Home
      </Link>
    </div>
  )
}

