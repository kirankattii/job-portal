import React, { useState, useEffect } from 'react'
import { useRecruiterApi } from '@/hooks/useRecruiterApi'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import ApplicationFilters from '@/components/recruiter/applications/ApplicationFilters'
import ApplicationList from '@/components/recruiter/applications/ApplicationList'
import ApplicationBulkActions from '@/components/recruiter/applications/ApplicationBulkActions'
import ApplicationDetailsModal from '@/components/recruiter/applications/ApplicationDetailsModal'
import CandidateDetailsModal from '@/components/recruiter/applications/CandidateDetailsModal'
import toast from 'react-hot-toast'

export default function Applications() {
  const { 
    loading, 
    error, 
    getJobApplications, 
    getJobs, 
    updateApplicationStatus, 
    bulkUpdateApplications 
  } = useRecruiterApi()
  
  const [applications, setApplications] = useState([])
  const [selectedApplications, setSelectedApplications] = useState([])
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    jobId: '',
    matchScore: '',
    sortBy: 'appliedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    loadApplications()
    loadJobs()
  }, [filters])

  const loadApplications = async () => {
    try {
      if (filters.jobId) {
        const response = await getJobApplications(filters.jobId, filters)
        setApplications(response.data?.data?.applicants || [])
        setPagination({
          currentPage: response.data?.data?.page || 1,
          totalPages: response.data?.data?.totalPages || 1,
          total: response.data?.data?.total || 0,
          hasNextPage: response.data?.data?.hasNextPage || false,
          hasPrevPage: response.data?.data?.hasPrevPage || false
        })
      } else {
        // If no job selected, get applications from all jobs
        const jobsResponse = await getJobs({ limit: 100 })
        const allJobs = jobsResponse.data.data.jobs
        if (allJobs.length > 0) {
          const firstJobId = allJobs[0]._id
          const response = await getJobApplications(firstJobId, filters)
          setApplications(response.data?.data?.applicants || [])
          setPagination({
            currentPage: response.data?.data?.page || 1,
            totalPages: response.data?.data?.totalPages || 1,
            total: response.data?.data?.total || 0,
            hasNextPage: response.data?.data?.hasNextPage || false,
            hasPrevPage: response.data?.data?.hasPrevPage || false
          })
        } else {
          setApplications([])
          setPagination({})
        }
      }
    } catch (err) {
      console.error('Failed to load applications:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load applications'
      toast.error(errorMessage)
    }
  }

  const loadJobs = async () => {
    try {
      const response = await getJobs({ limit: 100 })
      setJobs(response.data.data.jobs)
    } catch (err) {
      console.error('Failed to load jobs:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load jobs'
      toast.error(errorMessage)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleApplicationSelect = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(applications.map(app => app._id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedApplications.length === 0) return

    try {
      switch (action) {
        case 'reviewing':
        case 'rejected':
        case 'hired':
          await bulkUpdateApplications(selectedApplications, { status: action })
          break
        case 'export':
          // Export functionality would go here
          break
      }
      
      setSelectedApplications([])
      loadApplications()
    } catch (err) {
      console.error('Bulk action failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Bulk action failed'
      toast.error(errorMessage)
    }
  }

  const handleApplicationUpdate = async (applicationId, updates) => {
    try {
      await updateApplicationStatus(applicationId, updates.status, updates.notes)
      loadApplications()
    } catch (err) {
      console.error('Failed to update application:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update application'
      toast.error(errorMessage)
    }
  }

  const handleViewDetails = (application) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const handleViewFullProfile = (application) => {
    setSelectedApplication(application)
    setShowCandidateModal(true)
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Applications
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Review and manage job applications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6">
            <ApplicationFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              jobs={jobs}
            />
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className="mb-6">
              <ApplicationBulkActions
                selectedCount={selectedApplications.length}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedApplications([])}
              />
            </div>
          )}

          {/* Applications List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Applications will appear here when candidates apply to your jobs.
                </p>
              </div>
            ) : (
              <ApplicationList
                applications={applications}
                selectedApplications={selectedApplications}
                onApplicationSelect={handleApplicationSelect}
                onSelectAll={handleSelectAll}
                onApplicationUpdate={handleApplicationUpdate}
                onViewDetails={handleViewDetails}
                onViewFullProfile={handleViewFullProfile}
                pagination={pagination}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={handleApplicationUpdate}
        />
      )}

      {/* Candidate Details Modal */}
      {showCandidateModal && selectedApplication && (
        <CandidateDetailsModal
          application={selectedApplication}
          onClose={() => setShowCandidateModal(false)}
        />
      )}
    </div>
  )
}