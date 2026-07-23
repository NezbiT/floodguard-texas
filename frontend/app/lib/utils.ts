import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function riskColor(level: string | undefined | null): string {
  switch ((level || '').toLowerCase()) {
    case 'extreme':
      return '#b91c1c'
    case 'high':
      return '#ea580c'
    case 'moderate':
      return '#ca8a04'
    case 'low':
      return '#16a34a'
    default:
      return '#64748b'
  }
}

/** Continuous heat color from flood score 0–100 (same palette as risk index). */
export function scoreHeatColor(score: number | undefined | null): string {
  const s = Math.max(0, Math.min(100, Number(score) || 0))
  if (s >= 85) return '#b91c1c'
  if (s >= 65) return '#ea580c'
  if (s >= 40) return '#ca8a04'
  return '#16a34a'
}

export function riskBgClass(level: string | undefined | null): string {
  switch ((level || '').toLowerCase()) {
    case 'extreme':
      return 'bg-red-500/15 border-red-500/40 text-red-100'
    case 'high':
      return 'bg-orange-500/15 border-orange-500/40 text-orange-100'
    case 'moderate':
      return 'bg-amber-500/15 border-amber-500/40 text-amber-100'
    case 'low':
      return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100'
    default:
      return 'bg-slate-500/15 border-slate-500/40 text-slate-200'
  }
}
