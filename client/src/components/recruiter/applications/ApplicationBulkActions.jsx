import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function ApplicationBulkActions({ selectedCount, onBulkAction, onClearSelection }) {
  const [showActions, setShowActions] = useState(false)

  const actions = [
    {
      id: 'reviewing',
      label: 'Mark as Reviewing',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      variant: 'outline'
    },
    {
      id: 'rejected',
      label: 'Reject Applications',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      variant: 'danger'
    },
    {
      id: 'hired',
      label: 'Mark as Hired',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      variant: 'success'
    },
    {
      id: 'export',
      label: 'Export Applications',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      variant: 'outline'
    }
  ]

  const handleAction = (actionId) => {
    onBulkAction(actionId)
    setShowActions(false)
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedCount} application{selectedCount !== 1 ? 's' : ''} selected
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Choose an action to perform on the selected applications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              onClick={() => setShowActions(!showActions)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <span>Actions</span>
              <svg className={cn(
                "w-4 h-4 transition-transform",
                showActions ? "rotate-180" : ""
              )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700",
                      action.variant === 'danger' ? "text-red-600 dark:text-red-400" : 
                      action.variant === 'success' ? "text-green-600 dark:text-green-400" :
                      "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={onClearSelection}
            variant="ghost"
            size="sm"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Quick Actions (Mobile) */}
      <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
        {actions.map((action) => (
          <Button
            key={action.id}
            onClick={() => handleAction(action.id)}
            variant={action.variant}
            size="sm"
            className="flex items-center space-x-1"
          >
            {action.icon}
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
