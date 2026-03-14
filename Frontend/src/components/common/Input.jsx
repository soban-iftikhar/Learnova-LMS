import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = React.forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  type = 'text',
  className = '',
  containerClassName = '',
  required,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-ink-muted">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          className={`
            w-full px-4 py-3 bg-surface-muted border rounded-xl text-ink placeholder-gray-400
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
            ${error
              ? 'border-red-300 focus:ring-red-300'
              : 'border-gray-200 focus:ring-brand-400'
            }
            ${leftIcon ? 'pl-10' : ''}
            ${(rightIcon || isPassword) ? 'pr-10' : ''}
            ${className}
          `}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {rightIcon && !isPassword && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
