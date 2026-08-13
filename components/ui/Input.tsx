import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full border bg-black/60 px-3 py-2 font-space-mono text-sm text-gray-200 outline-none transition-colors',
          error
            ? 'border-neon-pink focus:border-neon-pink'
            : 'border-neon-cyan/30 focus:border-neon-cyan',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export default Input
