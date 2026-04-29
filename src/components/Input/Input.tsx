import { forwardRef, type InputHTMLAttributes } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className = '', label, error, hint, leftIcon, rightIcon, type = 'text', id, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const isPassword = type === 'password'

    const baseStyles =
      'w-full px-4 py-2.5 rounded-lg border bg-white transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0'

    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'

    const paddingStyles = leftIcon ? 'pl-10' : ''
    const paddingRightStyles = isPassword || rightIcon ? 'pr-10' : ''

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={`${baseStyles} ${stateStyles} ${paddingStyles} ${paddingRightStyles} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1.5 mt-1.5 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
