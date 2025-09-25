import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function BulkActions({ selectedCount, onBulkAction, onClearSelection }) {
  const [showActions, setShowActions] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [actionData, setActionData] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  const bulkActions = [
    {
      id: 'status_update',
      label: 'Update Status',
      icon: '📝',
      color: 'blue',
      requiresInput: true,
      inputType: 'select',
      inputOptions: [
        { value: 'applied', label: 'Applied' },
        { value: 'reviewing', label: 'Under Review' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'hired', label: 'Hired' }
      ]
    },
    {
      id: 'send_email',
      label: 'Send Email',
      icon: '📧',
      color: 'green',
      requiresInput: true,
      inputType: 'template',
      inputOptions: [
        { value: 'interview_invitation', label: 'Interview Invitation' },
        { value: 'rejection', label: 'Rejection Notice' },
        { value: 'follow_up', label: 'Follow-up' },
        { value: 'custom', label: 'Custom Message' }
      ]
    },
    {
      id: 'schedule_interview',
      label: 'Schedule Interview',
      icon: '📅',
      color: 'purple',
      requiresInput: true,
      inputType: 'interview',
      inputOptions: []
    },
    {
      id: 'add_notes',
      label: 'Add Notes',
      icon: '📝',
      color: 'yellow',
      requiresInput: true,
      inputType: 'textarea',
      inputOptions: []
    },
    {
      id: 'export',
      label: 'Export',
      icon: '📊',
      color: 'gray',
      requiresInput: true,
      inputType: 'export',
      inputOptions: [
        { value: 'csv', label: 'CSV' },
        { value: 'excel', label: 'Excel' },
        { value: 'pdf', label: 'PDF' }
      ]
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: '📦',
      color: 'gray',
      requiresInput: false,
      inputType: null,
      inputOptions: []
    }
  ]

  const handleActionSelect = (action) => {
    setSelectedAction(action.id)
    setActionData({})
    setShowActions(true)
  }

  const handleInputChange = (field, value) => {
    setActionData(prev => ({ ...prev, [field]: value }))
  }

  const handleExecuteAction = async () => {
    if (!selectedAction) return

    try {
      setIsProcessing(true)
      await onBulkAction(selectedAction, actionData)
      setShowActions(false)
      setSelectedAction('')
      setActionData({})
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getActionColor = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      case 'green':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800'
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'gray':
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
    }
  }

  const selectedActionConfig = bulkActions.find(action => action.id === selectedAction)

  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              {selectedCount} application{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={onClearSelection}
            variant="outline"
            size="sm"
          >
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {bulkActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionSelect(action)}
              className={cn(
                "inline-flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors hover:shadow-sm",
                getActionColor(action.color)
              )}
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Modal */}
      {showActions && selectedActionConfig && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {selectedActionConfig.label} - {selectedCount} Applications
          </h3>

          <div className="space-y-4">
            {/* Status Update */}
            {selectedActionConfig.inputType === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status
                </label>
                <select
                  value={actionData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select status...</option>
                  {selectedActionConfig.inputOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email Template */}
            {selectedActionConfig.inputType === 'template' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Template
                </label>
                <select
                  value={actionData.template || ''}
                  onChange={(e) => handleInputChange('template', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select template...</option>
                  {selectedActionConfig.inputOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {actionData.template === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Message
                    </label>
                    <textarea
                      value={actionData.message || ''}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={4}
                      placeholder="Enter your custom message..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Interview Scheduling */}
            {selectedActionConfig.inputType === 'interview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={actionData.date || ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Time
                  </label>
                  <input
                    type="time"
                    value={actionData.time || ''}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interview Type
                  </label>
                  <select
                    value={actionData.type || ''}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select type...</option>
                    <option value="phone">Phone</option>
                    <option value="video">Video Call</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interviewer
                  </label>
                  <input
                    type="text"
                    value={actionData.interviewer || ''}
                    onChange={(e) => handleInputChange('interviewer', e.target.value)}
                    placeholder="Enter interviewer name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedActionConfig.inputType === 'textarea' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={actionData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Enter notes to add to all selected applications..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {/* Export Format */}
            {selectedActionConfig.inputType === 'export' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <select
                  value={actionData.format || ''}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select format...</option>
                  {selectedActionConfig.inputOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              onClick={() => setShowActions(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteAction}
              disabled={isProcessing || !actionData.status && selectedActionConfig.requiresInput}
            >
              {isProcessing ? 'Processing...' : `Execute ${selectedActionConfig.label}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
