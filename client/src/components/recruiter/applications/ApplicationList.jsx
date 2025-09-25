import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const ApplicationCard = ({ 
  application, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onViewDetails 
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

  return (
    <div className={cn(
      "border-b border-gray-200 dark:border-gray-700 p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
      isSelected && "bg-blue-50 dark:bg-blue-900/10"
    )}>
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(application._id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
          />
        </div>

        {/* Application Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
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
                    "text-sm font-medium",
                    getMatchScoreColor(application.matchScore)
                  )}>
                    {application.matchScore}% match
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Applied for <span className="font-medium">{application.job?.title}</span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {application.user?.email}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(application.appliedAt)}
                </div>
              </div>

              {/* Cover Letter Preview */}
              {application.coverLetter && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              {/* Skills Match */}
              {application.matchedDetails?.matchedSkills && application.matchedDetails.matchedSkills.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Matched Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {application.matchedDetails.matchedSkills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {application.matchedDetails.matchedSkills.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        +{application.matchedDetails.matchedSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              {/* Status Update */}
              <div className="flex items-center space-x-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                    {isUpdating ? 'Updating...' : 'Update'}
                  </Button>
                )}
              </div>

              <Button
                onClick={() => onViewDetails(application)}
                variant="outline"
                size="sm"
              >
                View Details
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
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
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

export default function ApplicationList({
  applications,
  selectedApplications,
  onApplicationSelect,
  onSelectAll,
  onApplicationUpdate,
  onViewDetails,
  pagination,
  onPageChange
}) {
  const allSelected = applications.length > 0 && selectedApplications.length === applications.length
  const someSelected = selectedApplications.length > 0 && selectedApplications.length < applications.length

  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
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
            onSelect={onApplicationSelect}
            onUpdate={onApplicationUpdate}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </>
  )
}
