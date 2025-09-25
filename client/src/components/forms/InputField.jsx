import React from 'react'
import { cn } from '@/utils/cn'

const InputField = ({
  label,
  name,
  type = 'text',
  register,
  error,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={cn(
          'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
          'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...(register ? register(name) : {})}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600">{error.message || String(error)}</p>
      )}
    </div>
  )
}

export default InputField


