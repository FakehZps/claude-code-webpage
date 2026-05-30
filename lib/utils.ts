import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateStr))
}

export function getRatingStars(rating: number | null): string {
  if (rating === null) return '—'
  const out = Math.round(rating / 2)
  const filled = '★'.repeat(Math.max(0, Math.min(5, out)))
  const empty = '☆'.repeat(5 - filled.length)
  return filled + empty
}
