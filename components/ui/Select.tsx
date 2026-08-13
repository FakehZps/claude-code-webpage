import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full border bg-black/60 px-3 py-2 font-space-mono text-sm text-gray-200 outline-none transition-colors',
          error
            ? 'border-neon-pink focus:border-neon-pink'
            : 'border-neon-cyan/30 focus:border-neon-cyan',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'

export default Select
