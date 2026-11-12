import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  requestId?: string
  className?: string
}

export function ErrorMessage({ message, requestId, className }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`flex gap-3 items-start rounded-md border-l-4 border-[#DC2626] bg-[#FEF2F2] px-4 py-3 ${className ?? ''}`}
    >
      <AlertCircle
        className="h-5 w-5 text-[#DC2626] flex-shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm text-[#991B1B] font-medium">{message}</p>
        {requestId && (
          <p className="text-xs text-[#94A3B8] font-mono">
            Request ID: {requestId}
          </p>
        )}
      </div>
    </div>
  )
}
