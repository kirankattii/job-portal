import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  Grid, 
  List, 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Users,
  CheckSquare,
  Square
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import JobCard from '@/components/jobs/JobCard'
import { savedJobsService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'
import { USER_ROLES } from '@/constants'
import { useNavigate } from 'react-router-dom'

const SavedJobs = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [savedJobs, setSavedJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState(new Set())
  const [loading, setLoading] = useState(true)

  // Check if user is recruiter or admin - redirect if so
  useEffect(() => {
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      navigate('/unauthorized')
      return
    }
  }, [user, navigate])
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobs, setSelectedJobs] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('savedAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Load saved jobs
  const loadSavedJobs = useCallback(async () => {
    if (!isAuthenticated) return
    
    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder
      }

      const response = await savedJobsService.getSavedJobs(params)
      setSavedJobs(response.data.savedJobs || [])
      setPagination(response.data.pagination || {})
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, currentPage, pageSize, sortBy, sortOrder])

  // Load applied jobs
  const loadAppliedJobs = useCallback(async () => {
    if (!isAuthenticated) return
    
    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      return
    }
    
    try {
      const response = await applicationService.getApplications({ limit: 1000 })
      const applications = response?.data?.applications || []
      const appliedJobIds = new Set(applications.map(app => app.job?._id || app.jobId))
      setAppliedJobs(appliedJobIds)
    } catch (err) {
      console.error('Failed to load applied jobs:', err)
    }
  }, [isAuthenticated])

  // Initial load
  useEffect(() => {
    loadSavedJobs()
  }, [loadSavedJobs])

  useEffect(() => {
    loadAppliedJobs()
  }, [loadAppliedJobs])

  // Filter jobs based on search query
  const filteredJobs = savedJobs.filter(savedJob => {
    const job = savedJob.job
    const searchLower = searchQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.description.toLowerCase().includes(searchLower) ||
      job.location.toLowerCase().includes(searchLower) ||
      (job.recruiter?.company?.name || '').toLowerCase().includes(searchLower) ||
      job.requiredSkills.some(skill => skill.toLowerCase().includes(searchLower))
    )
  })

  // Handle remove saved job
  const handleRemoveSavedJob = async (jobId) => {
    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      toast.error('This action is not available for your role')
      return
    }

    try {
      await savedJobsService.removeSavedJob(jobId)
      setSavedJobs(prev => prev.filter(item => item.job._id !== jobId))
      toast.success('Job removed from saved list')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove saved job')
    }
  }

  // Handle bulk remove
  const handleBulkRemove = async () => {
    if (selectedJobs.size === 0) return

    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      toast.error('This action is not available for your role')
      return
    }

    try {
      const jobIds = Array.from(selectedJobs)
      const results = await savedJobsService.removeMultipleSavedJobs(jobIds)
      
      // Check results
      const successCount = results.filter(result => result.status === 'fulfilled').length
      const failCount = results.length - successCount

      if (successCount > 0) {
        setSavedJobs(prev => prev.filter(item => !selectedJobs.has(item.job._id)))
        setSelectedJobs(new Set())
        setShowBulkActions(false)
        toast.success(`${successCount} job(s) removed from saved list`)
      }

      if (failCount > 0) {
        toast.error(`Failed to remove ${failCount} job(s)`)
      }
    } catch (error) {
      toast.error('Failed to remove selected jobs')
    }
  }

  // Handle select job
  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set())
    } else {
      setSelectedJobs(new Set(filteredJobs.map(item => item.job._id)))
    }
  }

  // Handle save toggle (for JobCard compatibility)
  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      handleRemoveSavedJob(jobId)
    }
  }

  // Handle apply (for JobCard compatibility)
  const handleApply = (jobId) => {
    // Add job to applied jobs set
    setAppliedJobs(prev => new Set([...prev, jobId]))
    // Navigate to job details page
    window.open(`/jobs/${jobId}`, '_blank')
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const sortOptions = [
    { value: 'savedAt', label: 'Date Saved' },
    { value: 'job.createdAt', label: 'Date Posted' },
    { value: 'job.salaryRange.max', label: 'Salary' },
    { value: 'job.title', label: 'Job Title' }
  ]

  const pageSizeOptions = [10, 20, 50]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please login to view your saved jobs</p>
          <Link to="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Saved Jobs</h1>
          <p className="text-gray-600 dark:text-gray-300">Your bookmarked job opportunities</p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-l-lg',
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-r-lg',
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredJobs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All ({selectedJobs.size} selected)
                  </span>
                </label>

                {selectedJobs.size > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBulkRemove}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Selected ({selectedJobs.size})
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {filteredJobs.length} of {savedJobs.length} jobs
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSavedJobs}>Try Again</Button>
          </div>
        )}

        {/* Jobs Grid/List */}
        {!loading && !error && (
          <>
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <p className="text-gray-600 mb-4">No saved jobs found matching your search</p>
                    <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
                  </>
                ) : (
                  <>
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No saved jobs yet</p>
                    <Link to="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              )}>
                {filteredJobs.map((savedJob) => {
                  const job = savedJob.job
                  const isSelected = selectedJobs.has(job._id)
                  
                  return (
                    <div key={savedJob._id} className="relative">
                      {/* Selection Checkbox */}
                      <div className="absolute top-4 left-4 z-10">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectJob(job._id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </label>
                      </div>

                      {/* Job Card */}
                      <JobCard
                        job={job}
                        isSaved={true}
                        isApplied={appliedJobs.has(job._id)}
                        onSaveToggle={handleSaveToggle}
                        onApply={handleApply}
                        showApplyButton={true}
                        className={cn(
                          viewMode === 'list' ? 'flex' : '',
                          isSelected ? 'ring-2 ring-blue-500' : ''
                        )}
                      />

                      {/* Quick Actions */}
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSavedJob(job._id)}
                          className="bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/jobs/${job._id}`, '_blank')}
                          className="bg-white/90 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalSavedJobs)} of {pagination.totalSavedJobs} results
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            'px-3 py-2 text-sm rounded-md',
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SavedJobs