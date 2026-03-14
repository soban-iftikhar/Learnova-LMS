import React from 'react'
import { Loader2 } from 'lucide-react'

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 16, md: 24, lg: 36, xl: 48 }
  return (
    <Loader2
      size={sizes[size]}
      className={`animate-spin text-brand-500 ${className}`}
    />
  )
}

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" />
      <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
    </div>
  </div>
)

export const SectionLoader = ({ rows = 3 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-gray-100 rounded-2xl h-24" />
    ))}
  </div>
)

export default Spinner
