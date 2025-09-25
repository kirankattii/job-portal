import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { recruiterService } from '@/services/recruiterService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import AdvancedApplicationReview from '@/components/recruiter/applications/AdvancedApplicationReview'
import ApplicationAnalytics from '@/components/recruiter/analytics/ApplicationAnalytics'
import TeamCollaboration from '@/components/recruiter/collaboration/TeamCollaboration'

export default function EnhancedApplications() {
  const { jobId } = useParams()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    jobId: jobId || '',
    matchScore: '',
    sortBy: 'appliedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({})
  const [jobs, setJobs] = useState([])
  const [viewMode, setViewMode] = useState('review') // 'review', 'analytics', 'collaboration'
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    loadApplications()
    loadJobs()
  }, [filters])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Build query parameters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const response = await recruiterService.getApplications(queryParams.toString())
      const apps = response.data?.data?.applications || response.data?.applications || []
      const pag = response.data?.data?.pagination || response.data?.pagination || {}
      setApplications(apps)
      setPagination(pag)
    } catch (err) {
      console.error('Failed to load applications:', err)
      setError(err.response?.data?.message || 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  const loadJobs = async () => {
    try {
      const response = await recruiterService.getJobs({ limit: 100 })
      setJobs(response.data.data.jobs || [])
    } catch (err) {
      console.error('Failed to load jobs:', err)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleApplicationUpdate = async (applicationId, updates) => {
    try {
      await recruiterService.updateApplicationStatus(applicationId, updates.status, updates.notes)
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app._id === applicationId 
            ? { ...app, ...updates }
            : app
        )
      )
      
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, ...updates }))
      }
    } catch (err) {
      console.error('Failed to update application:', err)
      throw err
    }
  }

  const handleBulkAction = async (action, data) => {
    try {
      switch (action) {
        case 'status_update':
          await recruiterService.bulkUpdateApplications(data.applicationIds, { status: data.status })
          break
        case 'send_email':
          // Implement email sending
          break
        case 'schedule_interview':
          // Implement interview scheduling
          break
        case 'add_notes':
          // Implement bulk notes
          break
        case 'export':
          // Implement export
          break
        case 'archive':
          // Implement archiving
          break
        default:
          // Unknown bulk action
      }
      
      // Reload applications after bulk action
      loadApplications()
    } catch (err) {
      console.error('Bulk action failed:', err)
      throw err
    }
  }

  const handleApplicationSelect = (application) => {
    setSelectedApplication(application)
  }

  const getViewContent = () => {
    switch (viewMode) {
      case 'analytics':
        return (
          <ApplicationAnalytics 
            applications={applications}
            dateRange="30d"
          />
        )
      case 'collaboration':
        return selectedApplication ? (
          <TeamCollaboration 
            application={selectedApplication}
            onUpdate={handleApplicationUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Select an application to view collaboration
              </h3>
            </div>
          </div>
        )
      case 'review':
      default:
        return (
          <AdvancedApplicationReview
            jobId={jobId}
            applications={applications}
            onApplicationUpdate={handleApplicationUpdate}
            onBulkAction={handleBulkAction}
            onFilterChange={handleFilterChange}
            filters={filters}
            pagination={pagination}
            isLoading={isLoading}
            error={error}
          />
        )
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
                Application Management
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Advanced application review and management system
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('review')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'review'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Review
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'analytics'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setViewMode('collaboration')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === 'collaboration'
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Collaboration
                </button>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {applications.length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {applications.filter(app => app.status === 'hired').length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Hired
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {applications.filter(app => app.status === 'reviewing').length}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Reviewing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {getViewContent()}
        </div>
      </div>
    </div>
  )
}
