import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecruiterApi } from '@/hooks/useRecruiterApi'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import JobFilters from '@/components/recruiter/jobs/JobFilters'
import JobList from '@/components/recruiter/jobs/JobList'
import JobBulkActions from '@/components/recruiter/jobs/JobBulkActions'
import { cn } from '@/utils/cn'

export default function RecruiterJobs() {
  const navigate = useNavigate()
  const { 
    loading, 
    error, 
    getJobs, 
    updateJob, 
    deleteJob, 
    bulkUpdateJobs, 
    bulkDeleteJobs, 
    exportJobs 
  } = useRecruiterApi()
  
  const [jobs, setJobs] = useState([])
  const [selectedJobs, setSelectedJobs] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    loadJobs()
  }, [filters])

  const loadJobs = async () => {
    try {
      const response = await getJobs(filters)
      setJobs(response.data.data.jobs)
      setPagination(response.data.data.pagination)
    } catch (err) {
      console.error('Failed to load jobs:', err)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleJobSelect = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(jobs.map(job => job._id))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedJobs.length === 0) return

    try {
      switch (action) {
        case 'close':
          await bulkUpdateJobs(selectedJobs, { status: 'closed' })
          break
        case 'open':
          await bulkUpdateJobs(selectedJobs, { status: 'open' })
          break
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedJobs.length} jobs?`)) {
            await bulkDeleteJobs(selectedJobs)
          }
          break
        case 'export':
          await exportJobs(filters)
          break
      }
      
      setSelectedJobs([])
      loadJobs()
    } catch (err) {
      console.error('Bulk action failed:', err)
    }
  }

  const handleJobUpdate = async (jobId, updates) => {
    try {
      await updateJob(jobId, updates)
      loadJobs()
    } catch (err) {
      console.error('Failed to update job:', err)
    }
  }

  const handleJobDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId)
        loadJobs()
      } catch (err) {
        console.error('Failed to delete job:', err)
      }
    }
  }

  const handleDuplicateJob = async (jobId) => {
    try {
      // Find the job to duplicate
      const jobToDuplicate = jobs.find(job => job._id === jobId)
      if (jobToDuplicate) {
        const { _id, createdAt, updatedAt, __v, ...jobData } = jobToDuplicate
        await createJob({ ...jobData, title: `${jobData.title} (Copy)` })
        loadJobs()
      }
    } catch (err) {
      console.error('Failed to duplicate job:', err)
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
                Job Management
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your job postings and track applications
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => navigate('/recruiter/jobs/create')}
                className="px-6"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post New Job
              </Button>
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
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Bulk Actions */}
          {selectedJobs.length > 0 && (
            <div className="mb-6">
              <JobBulkActions
                selectedCount={selectedJobs.length}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedJobs([])}
              />
            </div>
          )}

          {/* Jobs List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No jobs found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new job posting.
                </p>
                <div className="mt-6">
                  <Button onClick={() => navigate('/recruiter/jobs/create')}>
                    Post New Job
                  </Button>
                </div>
              </div>
            ) : (
              <JobList
                jobs={jobs}
                selectedJobs={selectedJobs}
                onJobSelect={handleJobSelect}
                onSelectAll={handleSelectAll}
                onJobUpdate={handleJobUpdate}
                onJobDelete={handleJobDelete}
                onDuplicateJob={handleDuplicateJob}
                pagination={pagination}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


