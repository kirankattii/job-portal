import React from 'react'
import { cn } from '@/utils/cn'

const ProfileCompletion = ({ completion, onRefresh }) => {
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getCompletionMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! Your profile is almost complete.'
    if (percentage >= 70) return 'Great progress! Just a few more details to add.'
    if (percentage >= 50) return 'Good start! Keep adding more information.'
    if (percentage >= 30) return 'Getting there! Add more details to improve your profile.'
    return 'Let\'s get started! Add some basic information to your profile.'
  }

  const getCompletionIcon = (percentage) => {
    if (percentage >= 80) return '🎉'
    if (percentage >= 60) return '👍'
    if (percentage >= 40) return '📈'
    return '🚀'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCompletionIcon(completion)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Completion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getCompletionMessage(completion)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {completion}%
          </div>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
        <div
          className={cn(
            'h-3 rounded-full transition-all duration-500 ease-out',
            getCompletionColor(completion)
          )}
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Missing Fields Indicator */}
      {completion < 100 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Complete more sections to improve your profile visibility to recruiters.
        </div>
      )}

      {/* Completion Tips */}
      {completion < 80 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Quick Tips to Complete Your Profile:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            {completion < 30 && <li>• Add your personal information and bio</li>}
            {completion < 50 && <li>• Upload your resume and add professional details</li>}
            {completion < 70 && <li>• Add your skills and work experience</li>}
            {completion < 80 && <li>• Complete your education information</li>}
            <li>• Add a professional profile picture</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProfileCompletion
