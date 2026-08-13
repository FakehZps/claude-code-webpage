import { ReactNode } from 'react'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

export default function FormField({
  label,
  htmlFor,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-space-mono text-xs tracking-widest text-gray-500"
      >
        [&nbsp;{label}&nbsp;]
      </label>
      {children}
      {error && (
        <p className="mt-1 font-space-mono text-xs text-neon-pink">{error}</p>
      )}
    </div>
  )
}
