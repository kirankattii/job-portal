import React from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

export default function JobPreview({ data, onSubmit, onPrev, isLoading }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified'
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`
  }

  const formatExperience = (min, max) => {
    if (min === max) return `${min} year${min !== 1 ? 's' : ''}`
    return `${min} - ${max} years`
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Job Preview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review your job posting before publishing. Make sure all information is accurate and complete.
        </p>
      </div>

      {/* Job Preview Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {data.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {data.location}
                </div>
                {data.remote && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Remote
                  </div>
                )}
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {formatSalary(data.salaryRange?.min, data.salaryRange?.max)}
                </div>
              </div>
            </div>
            <div className="ml-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                {data.status === 'open' ? 'Open' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Description</h4>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          </div>

          {/* Requirements */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Requirements</h4>
            <div className="space-y-4">
              {/* Skills */}
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Required Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {data.requiredSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Experience</h5>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatExperience(data.experienceMin, data.experienceMax)} of experience required
                </p>
              </div>

              {/* Education */}
              {data.educationLevel && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Education</h5>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {data.educationLevel} degree or equivalent
                  </p>
                </div>
              )}

              {/* Additional Requirements */}
              {data.additionalRequirements && (
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Additional Requirements</h5>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {data.additionalRequirements}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Company Info */}
          {(data.companyOverview || data.benefits) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About the Company</h4>
              <div className="space-y-4">
                {data.companyOverview && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Company Overview</h5>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {data.companyOverview}
                    </p>
                  </div>
                )}
                {data.benefits && (
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Benefits & Perks</h5>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                      {data.benefits}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Instructions */}
          {data.applicationInstructions && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">How to Apply</h4>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {data.applicationInstructions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onPrev}
          variant="outline"
          disabled={isLoading}
        >
          Previous
        </Button>
        <div className="flex space-x-3">
          <Button
            onClick={() => onSubmit()}
            disabled={isLoading}
            className="px-8"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Publishing...
              </>
            ) : (
              'Publish Job'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
