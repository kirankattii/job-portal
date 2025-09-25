import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/forms/InputField'
import { cn } from '@/utils/cn'

export default function JobBasicInfo({ data, updateData, onNext }) {
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!data.title.trim()) {
      newErrors.title = 'Job title is required'
    } else if (data.title.length < 3) {
      newErrors.title = 'Job title must be at least 3 characters'
    }
    
    if (!data.location.trim()) {
      newErrors.location = 'Location is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleInputChange = (field, value) => {
    updateData({ [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Basic Job Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Let's start with the essential details about your job posting.
        </p>
      </div>

      <div className="space-y-6">
        {/* Job Title */}
        <div>
          <InputField
            label="Job Title"
            placeholder="e.g. Senior Software Engineer"
            value={data.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            required
            className="text-lg"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Be specific and descriptive to attract the right candidates
          </p>
        </div>

        {/* Location */}
        <div>
          <InputField
            label="Job Location"
            placeholder="e.g. San Francisco, CA or Remote"
            value={data.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            error={errors.location}
            required
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Include city, state, or specify if the position is remote
          </p>
        </div>

        {/* Remote Work Option */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="remote"
            checked={data.remote}
            onChange={(e) => handleInputChange('remote', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="remote" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            This is a remote position
          </label>
        </div>

        {/* Job Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Job Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleInputChange('jobType', type.toLowerCase())}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                  data.jobType === type.toLowerCase()
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Department */}
        <div>
          <InputField
            label="Department"
            placeholder="e.g. Engineering, Marketing, Sales"
            value={data.department || ''}
            onChange={(e) => handleInputChange('department', e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <Button
          onClick={handleNext}
          disabled={!data.title.trim() || !data.location.trim()}
          className="px-8"
        >
          Next: Job Details
        </Button>
      </div>
    </div>
  )
}
