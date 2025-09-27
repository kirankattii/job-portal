import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

const ApplicationCard = ({ 
  application, 
  isSelected, 
  isActive,
  onSelect, 
  onBulkSelect,
  onUpdate, 
  onViewDetails,
  onViewFullProfile,
  compact = false
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState(application.status)

  const handleStatusUpdate = async () => {
    if (newStatus === application.status) return

    try {
      setIsUpdating(true)
      await onUpdate(application._id, { status: newStatus })
    } catch (err) {
      console.error('Failed to update status:', err)
      setNewStatus(application.status) // Revert on error
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      case 'reviewing':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'hired':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
    }
  }

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEvaluationBadge = (evaluation) => {
    if (!evaluation) return null
    
    const { recommendation, overallRating } = evaluation
    if (recommendation === 'hire') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">⭐ Hire</span>
    }
    if (recommendation === 'no-hire') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">❌ No Hire</span>
    }
    if (overallRating >= 4) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">⭐ {overallRating}/5</span>
    }
    return null
  }

  return (
    <div className={cn(
      "border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
      isActive && "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500",
      compact && "p-3"
    )}>
      <div className="flex items-start space-x-3">
        {/* Checkbox for bulk selection */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onBulkSelect(application._id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Application Content */}
        <div className="flex-1 min-w-0" onClick={() => onViewDetails(application)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={cn(
                  "font-semibold text-gray-900 dark:text-white truncate",
                  compact ? "text-sm" : "text-base"
                )}>
                  {application.user?.firstName} {application.user?.lastName}
                </h3>
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(application.status)
                )}>
                  {application.status}
                </span>
                {application.matchScore && (
                  <span className={cn(
                    "text-xs font-medium",
                    getMatchScoreColor(application.matchScore)
                  )}>
                    {application.matchScore}% ATS Score
                  </span>
                )}
                {getEvaluationBadge(application.evaluation)}
              </div>

              <div className={cn(
                "text-gray-600 dark:text-gray-400 mb-1",
                compact ? "text-xs" : "text-sm"
              )}>
                Applied for <span className="font-medium">{application.job?.title}</span>
              </div>

              <div className={cn(
                "flex items-center space-x-3 text-gray-500 dark:text-gray-400",
                compact ? "text-xs" : "text-sm"
              )}>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {application.user?.email}
                </div>
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(application.appliedAt)}
                </div>
              </div>

              {/* Skills Match Preview */}
              {application.matchedDetails?.matchedSkills && application.matchedDetails.matchedSkills.length > 0 && !compact && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Matched Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {application.matchedDetails.matchedSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {application.matchedDetails.matchedSkills.length > 3 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        +{application.matchedDetails.matchedSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Cover Letter Preview */}
              {application.coverLetter && !compact && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {application.coverLetter}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              {/* Status Update */}
              <div className="flex items-center space-x-1">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={cn(
                    "px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                    compact ? "text-xs" : "text-sm"
                  )}
                >
                  <option value="applied">Applied</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
                {newStatus !== application.status && (
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    size="sm"
                    variant="outline"
                  >
                    {isUpdating ? '...' : 'Update'}
                  </Button>
                )}
              </div>

              {/* Download Resume */}
              {application.resumeUrl && (
                <Button
                  onClick={() => window.open(application.resumeUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Resume</span>
                </Button>
              )}

              {/* View Full Profile */}
              <Button
                onClick={() => onViewFullProfile(application)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </div>
          </div>
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
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.totalApplications)} of {pagination.totalApplications} applications
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

export default function EnhancedApplicationList({
  applications,
  selectedApplications,
  selectedApplication,
  onApplicationSelect,
  onBulkSelect,
  onSelectAll,
  onApplicationUpdate,
  onViewDetails,
  onViewFullProfile,
  pagination,
  onPageChange,
  isLoading = false,
  compact = false
}) {
  const allSelected = applications.length > 0 && selectedApplications.length === applications.length
  const someSelected = selectedApplications.length > 0 && selectedApplications.length < applications.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Applications will appear here when candidates apply to your jobs.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected
              }}
              onChange={onSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedApplications.length > 0 ? `${selectedApplications.length} selected` : 'Select all'}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {applications.map((application) => (
          <ApplicationCard
            key={application._id}
            application={application}
            isSelected={selectedApplications.includes(application._id)}
            isActive={selectedApplication?._id === application._id}
            onSelect={onApplicationSelect}
            onBulkSelect={onBulkSelect}
            onUpdate={onApplicationUpdate}
            onViewDetails={onViewDetails}
            onViewFullProfile={onViewFullProfile}
            compact={compact}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </>
  )
}
