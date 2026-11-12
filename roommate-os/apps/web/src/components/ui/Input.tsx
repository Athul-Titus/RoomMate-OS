import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id: idProp, ...rest }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId
    const errorId = `${id}-error`
    const hintId = `${id}-hint`

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label
          htmlFor={id}
          className="text-sm font-medium text-[#0F172A]"
        >
          {label}
        </label>

        {hint && (
          <p id={hintId} className="text-xs text-[#94A3B8]">
            {hint}
          </p>
        )}

        <input
          ref={ref}
          id={id}
          aria-describedby={
            [error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full px-3 py-2',
            'rounded-md border',
            'bg-[#F1F5F9] text-[#0F172A]',
            'text-sm placeholder:text-[#94A3B8]',
            'transition-colors duration-150',
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]'
              : 'border-[#E2E8F0] focus:border-[#4338CA] focus:ring-[#4338CA]',
            'focus:outline-none focus:ring-1',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            className
          )}
          {...rest}
        />

        {error && (
          <p id={errorId} className="text-xs text-[#DC2626]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
