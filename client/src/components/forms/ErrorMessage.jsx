import React from 'react'

const ErrorMessage = ({ message }) => {
  if (!message) return null
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </div>
  )
}

export default ErrorMessage


