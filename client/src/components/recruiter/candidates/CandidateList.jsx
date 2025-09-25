import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const CandidateCard = ({ 
  candidate, 
  onViewDetails, 
  onSaveCandidate, 
  onContactCandidate 
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isContacting, setIsContacting] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSaveCandidate(candidate._id)
    } catch (err) {
      console.error('Failed to save candidate:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContact = async () => {
    if (!message.trim()) return

    try {
      setIsContacting(true)
      await onContactCandidate(candidate._id, message)
      setMessage('')
      setShowContactForm(false)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsContacting(false)
    }
  }

  const getProfileCompletionColor = (completion) => {
    if (completion >= 80) return 'text-green-600 dark:text-green-400'
    if (completion >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified'
    return `$${salary.toLocaleString()}`
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
            </span>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 truncate">
                {candidate.currentPosition} at {candidate.currentCompany}
              </p>
              
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {candidate.currentLocation}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  {formatSalary(candidate.expectedSalary)}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {candidate.experienceYears || 0} years exp
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {candidate.skills.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        +{candidate.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {candidate.bio && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {candidate.bio}
                  </p>
                </div>
              )}

              {/* Profile Completion */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                  <span className={cn(
                    "font-medium",
                    getProfileCompletionColor(candidate.profileCompletion || 0)
                  )}>
                    {candidate.profileCompletion || 0}%
                  </span>
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${candidate.profileCompletion || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center space-x-2 ml-4">
              <Button
                onClick={() => onViewDetails(candidate)}
                variant="outline"
                size="sm"
              >
                View Profile
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                size="sm"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={() => setShowContactForm(!showContactForm)}
                variant="primary"
                size="sm"
              >
                Contact
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          {showContactForm && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message to the candidate..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => setShowContactForm(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleContact}
                    disabled={!message.trim() || isContacting}
                    size="sm"
                  >
                    {isContacting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null

  const pages = []
  const currentPage = pagination.currentPage
  const totalPages = pagination.totalPages

  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...')
    }
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalCandidates)} of {pagination.totalCandidates} candidates
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <div className="flex space-x-1">
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={cn(
                "px-3 py-1 text-sm rounded",
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : page === '...'
                  ? "text-gray-400 cursor-default"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {page}
            </button>
          ))}
        </div>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default function CandidateList({
  candidates,
  onViewDetails,
  onSaveCandidate,
  onContactCandidate,
  pagination,
  onPageChange
}) {
  return (
    <>
      {/* Candidates List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate._id}
            candidate={candidate}
            onViewDetails={onViewDetails}
            onSaveCandidate={onSaveCandidate}
            onContactCandidate={onContactCandidate}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </>
  )
}
