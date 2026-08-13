import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full resize-y border bg-black/60 px-3 py-2 font-space-mono text-sm text-gray-200 outline-none transition-colors',
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
Textarea.displayName = 'Textarea'

export default Textarea
