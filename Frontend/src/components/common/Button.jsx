import React from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:   'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
  secondary: 'bg-surface-muted text-ink hover:bg-brand-50 hover:text-brand-600',
  outline:   'border border-gray-200 text-ink hover:border-brand-400 hover:text-brand-600',
  ghost:     'text-ink-muted hover:bg-surface-muted hover:text-ink',
  danger:    'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  success:   'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
}

const sizes = {
  xs:  'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  sm:  'px-4 py-2 text-sm rounded-xl gap-2',
  md:  'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg:  'px-6 py-3 text-base rounded-xl gap-2.5',
  xl:  'px-8 py-4 text-base rounded-2xl gap-3',
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 active:scale-95
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-60 cursor-not-allowed active:scale-100' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin flex-shrink-0" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  )
}

export default Button
