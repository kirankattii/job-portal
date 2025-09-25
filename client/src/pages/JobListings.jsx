import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Grid, List, SortAsc, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import { jobService, savedJobsService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/utils/cn'

const JobListings = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({})
  const [viewMode, setViewMode] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [appliedJobs, setAppliedJobs] = useState(new Set())
  
  // Search and filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    skills: [],
    experienceMin: undefined,
    experienceMax: undefined,
    salaryMin: undefined,
    salaryMax: undefined,
    jobType: '',
    remote: undefined
  })
  
  // Pagination and sorting
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  const { isAuthenticated } = useAuthStore()

  // Load jobs
  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery || filters.search,
        ...filters,
        sortBy,
        sortOrder
      }

      const response = await jobService.searchJobs(params)
      // jobService returns response.data directly (shape: { success, data: { jobs, pagination } })
      setJobs(response?.data?.jobs || [])
      setPagination(response?.data?.pagination || {})
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, filters, sortBy, sortOrder])

  // Load saved jobs for authenticated users
  const loadSavedJobs = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      const response = await savedJobsService.getSavedJobs({ limit: 1000 })
      const list = response?.data?.savedJobs || []
      const savedJobIds = new Set(list.map(item => (item.job?._id) || item.jobId || item._id))
      setSavedJobs(savedJobIds)
    } catch (err) {
      console.error('Failed to load saved jobs:', err)
    }
  }, [isAuthenticated])

  // Load applied jobs for authenticated users
  const loadAppliedJobs = useCallback(async () => {
    if (!isAuthenticated) return
    
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
    loadJobs()
  }, [loadJobs])

  useEffect(() => {
    loadSavedJobs()
  }, [loadSavedJobs])

  useEffect(() => {
    loadAppliedJobs()
  }, [loadAppliedJobs])

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    setFilters(prev => ({ ...prev, search: searchQuery }))
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      skills: [],
      experienceMin: undefined,
      experienceMax: undefined,
      salaryMin: undefined,
      salaryMax: undefined,
      jobType: '',
      remote: undefined
    })
    setSearchQuery('')
    setCurrentPage(1)
  }

  // Handle save toggle
  const handleSaveToggle = (jobId, isSaved) => {
    if (isSaved) {
      setSavedJobs(prev => new Set([...prev, jobId]))
    } else {
      setSavedJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  // Handle apply - this will be called when user applies from job details page
  const handleApply = (jobId) => {
    // Add job to applied jobs set
    setAppliedJobs(prev => new Set([...prev, jobId]))
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

  const sortOptions = [
    { value: 'createdAt', label: 'Date Posted' },
    { value: 'salaryRange.max', label: 'Salary' },
    { value: 'title', label: 'Job Title' },
    { value: 'applicantsCount', label: 'Applicants' }
  ]

  const pageSizeOptions = [10, 20, 50]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Find Your Dream Job</h1>
          <p className="text-gray-600 dark:text-gray-300">Discover opportunities that match your skills and aspirations</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <Button type="submit" className="px-8">
                Search
              </Button>
            </div>
          </form>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <JobFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowMobileFilters(true)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {pagination.totalJobs || 0} jobs found
                </span>
                
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 dark:border-secondary-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2 rounded-l-lg',
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-secondary-800 dark:text-gray-300 dark:hover:bg-secondary-700'
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
                        : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-secondary-800 dark:text-gray-300 dark:hover:bg-secondary-700'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Options */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-100"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-md"
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Page Size */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-100"
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

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={loadJobs}>Try Again</Button>
              </div>
            )}

            {/* Jobs Grid/List */}
            {!loading && !error && (
              <>
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">No jobs found matching your criteria</p>
                    <Button onClick={handleClearFilters}>Clear Filters</Button>
                  </div>
                ) : (
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                      : 'space-y-3'
                  )}>
                    {jobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isSaved={savedJobs.has(job._id)}
                        isApplied={appliedJobs.has(job._id)}
                        onSaveToggle={handleSaveToggle}
                        onApply={handleApply}
                        className={viewMode === 'list' ? 'flex' : ''}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalJobs)} of {pagination.totalJobs} results
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
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
                                'px-3 py-2 text-sm rounded-md transition-colors',
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-secondary-800'
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
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filters */}
        <JobFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          isMobile={true}
          isOpen={showMobileFilters}
          onToggle={() => setShowMobileFilters(false)}
        />
      </div>
    </div>
  )
}

export default JobListings


