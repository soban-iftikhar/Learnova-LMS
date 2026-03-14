import React from 'react'

const variants = {
  default:  'bg-gray-100 text-gray-700',
  success:  'bg-brand-50 text-brand-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  info:     'bg-sky-50 text-sky-700',
  purple:   'bg-violet-50 text-violet-700',
  active:   'bg-brand-50 text-brand-700',
  draft:    'bg-gray-100 text-gray-500',
  archived: 'bg-amber-50 text-amber-600',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

const Badge = ({ children, variant = 'default', size = 'md', dot = false, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' || variant === 'active' ? 'bg-brand-500' : variant === 'warning' ? 'bg-amber-500' : variant === 'danger' ? 'bg-red-500' : 'bg-gray-400'}`} />}
    {children}
  </span>
)

export default Badge
