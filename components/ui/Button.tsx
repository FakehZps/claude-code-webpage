import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', loading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'flex items-center justify-center gap-2 border px-4 py-2 font-space-mono text-xs tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          variant === 'primary'
            ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20'
            : variant === 'danger'
              ? 'border-neon-pink/40 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20'
              : 'border-gray-600 bg-transparent text-gray-400 hover:border-gray-400 hover:text-gray-200',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
