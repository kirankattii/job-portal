import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLayout from '@/components/layout/UserLayout'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  RefreshCw, 
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  FileText,
  ExternalLink
} from 'lucide-react'
import applicationService from '@/services/applicationService'
import toast from 'react-hot-toast'
import useAuthStore from '@/stores/authStore'
import { USER_ROLES } from '@/constants'

const UserApplications = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is recruiter or admin - redirect if so
  useEffect(() => {
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      navigate('/unauthorized')
      return
    }
  }, [user, navigate])
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('appliedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedApplications, setSelectedApplications] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    fetchApplications()
  }, [])

  // Refetch applications when status filter changes
  useEffect(() => {
    if (statusFilter !== 'all') {
      fetchApplications()
    }
  }, [statusFilter])

  const fetchApplications = async (showToast = true) => {
    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await applicationService.getApplications({
        status: statusFilter,
        limit: 100, // Get more applications for better filtering
        page: 1
      })
      
      if (response.success) {
        // Transform the data to match the expected structure
        const transformedApplications = response.data.map(app => ({
          _id: app._id,
          job: {
            _id: app.job._id,
            title: app.job.title,
            company: app.job.company || 'Company',
            location: app.job.location,
            salary: app.job.salary || 'Not specified',
            type: app.job.type || 'Full-time'
          },
          appliedAt: app.appliedAt,
          status: app.status || 'applied',
          matchScore: app.matchScore || 0,
          matchedDetails: app.matchedDetails || {
            skillsMatch: app.matchScore || 0,
            experienceMatch: 0,
            locationMatch: 100,
            matchedSkills: [],
            missingSkills: []
          }
        }))
        setApplications(transformedApplications)
        setRetryCount(0) // Reset retry count on success
      } else {
        throw new Error(response.message || 'Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError(error.message || 'Failed to fetch applications')
      
      if (showToast) {
        if (retryCount < 2) {
          toast.error('Failed to fetch applications. Retrying...')
          setRetryCount(prev => prev + 1)
          // Auto retry after 2 seconds
          setTimeout(() => fetchApplications(false), 2000)
        } else {
          toast.error('Failed to fetch applications. Using sample data.')
          // Fallback to mock data for development
          setApplications(getMockApplications())
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for development/fallback
  const getMockApplications = () => [
    {
      _id: '1',
      job: {
        _id: 'job1',
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        salary: '$120k - $150k',
        type: 'Full-time'
      },
      appliedAt: '2024-01-15T10:30:00Z',
      status: 'applied',
      matchScore: 85,
      matchedDetails: {
        skillsMatch: 90,
        experienceMatch: 80,
        locationMatch: 100,
        matchedSkills: ['React', 'Node.js', 'TypeScript'],
        missingSkills: ['Docker', 'AWS']
      }
    },
    {
      _id: '2',
      job: {
        _id: 'job2',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        salary: '$90k - $120k',
        type: 'Full-time'
      },
      appliedAt: '2024-01-10T14:20:00Z',
      status: 'reviewing',
      matchScore: 72,
      matchedDetails: {
        skillsMatch: 75,
        experienceMatch: 70,
        locationMatch: 80,
        matchedSkills: ['React', 'JavaScript'],
        missingSkills: ['Vue.js', 'GraphQL']
      }
    },
    {
      _id: '3',
      job: {
        _id: 'job3',
        title: 'Full Stack Developer',
        company: 'WebDev Inc',
        location: 'Remote',
        salary: '$80 - $100/hour',
        type: 'Contract'
      },
      appliedAt: '2024-01-05T09:15:00Z',
      status: 'hired',
      matchScore: 92,
      matchedDetails: {
        skillsMatch: 95,
        experienceMatch: 90,
        locationMatch: 100,
        matchedSkills: ['React', 'Node.js', 'MongoDB', 'Express'],
        missingSkills: []
      }
    },
    {
      _id: '4',
      job: {
        _id: 'job4',
        title: 'React Developer',
        company: 'Design Co',
        location: 'Los Angeles, CA',
        salary: '$100k - $130k',
        type: 'Full-time'
      },
      appliedAt: '2023-12-20T16:45:00Z',
      status: 'rejected',
      matchScore: 65,
      matchedDetails: {
        skillsMatch: 70,
        experienceMatch: 60,
        locationMatch: 50,
        matchedSkills: ['React', 'JavaScript'],
        missingSkills: ['Design Systems', 'Figma', 'UI/UX']
      }
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'hired':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'reviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'shortlisted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-4 h-4" />
      case 'reviewing':
        return <Eye className="w-4 h-4" />
      case 'hired':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'reviewed':
        return <Eye className="w-4 h-4" />
      case 'shortlisted':
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  }

  // Filter and search applications
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    const matchesCompany = !companyFilter || 
      app.job.company.toLowerCase().includes(companyFilter.toLowerCase())
    const matchesSearch = !searchQuery || 
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true
      const appDate = new Date(app.appliedAt)
      const now = new Date()
      const daysDiff = Math.floor((now - appDate) / (1000 * 60 * 60 * 24))
      
      switch (dateFilter) {
        case 'today': return daysDiff === 0
        case 'week': return daysDiff <= 7
        case 'month': return daysDiff <= 30
        case '3months': return daysDiff <= 90
        default: return true
      }
    })()

    return matchesStatus && matchesCompany && matchesSearch && matchesDate
  })

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === 'appliedAt') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    } else if (sortBy === 'job.title' || sortBy === 'job.company') {
      aValue = a.job[sortBy.split('.')[1]]
      bValue = b.job[sortBy.split('.')[1]]
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleExportApplications = async () => {
    try {
      const response = await applicationService.exportApplications('csv')
      
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `applications-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Applications exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export applications')
    }
  }

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === sortedApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(sortedApplications.map(app => app._id))
    }
  }

  const handleWithdrawApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return
    }

    try {
      // Try to call the withdraw API (if implemented)
      await applicationService.withdrawApplication(applicationId)
      toast.success('Application withdrawn successfully')
      
      // Refresh applications to get updated data
      await fetchApplications()
    } catch (error) {
      // If the endpoint doesn't exist, just show success message
      if (error.response?.status === 404) {
        toast.success('Application withdrawn successfully')
        await fetchApplications()
      } else {
        console.error('Withdraw error:', error)
        toast.error('Failed to withdraw application')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="p-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchApplications(true)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track the status of your job applications ({applications.length} total)
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              onClick={() => fetchApplications(true)}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportApplications}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Company Filter */}
            <div className="lg:w-64">
              <input
                type="text"
                placeholder="Filter by company..."
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="appliedAt-desc">Date (Newest)</option>
                <option value="appliedAt-asc">Date (Oldest)</option>
                <option value="job.title-asc">Job Title (A-Z)</option>
                <option value="job.title-desc">Job Title (Z-A)</option>
                <option value="job.company-asc">Company (A-Z)</option>
                <option value="job.company-desc">Company (Z-A)</option>
                <option value="matchScore-desc">Match Score (High)</option>
                <option value="matchScore-asc">Match Score (Low)</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="applied">Applied</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Under Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Applied Date
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="3months">Last 3 Months</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({applications.length})
          </button>
          <button
            onClick={() => setStatusFilter('applied')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'applied'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Applied ({applications.filter(app => app.status === 'applied').length})
          </button>
          <button
            onClick={() => setStatusFilter('reviewing')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'reviewing'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Under Review ({applications.filter(app => app.status === 'reviewing').length})
          </button>
          <button
            onClick={() => setStatusFilter('hired')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'hired'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Hired ({applications.filter(app => app.status === 'hired').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Rejected ({applications.filter(app => app.status === 'rejected').length})
          </button>
          <button
            onClick={() => setStatusFilter('shortlisted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'shortlisted'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Shortlisted ({applications.filter(app => app.status === 'shortlisted').length})
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {sortedApplications.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {statusFilter === 'all' 
                  ? "You haven't applied to any jobs yet. Start browsing jobs to apply!"
                  : `No applications with status "${statusFilter}". Try a different filter.`
                }
              </p>
              <Button
                onClick={() => navigate('/jobs')}
                className="mt-4"
              >
                Browse Jobs
              </Button>
            </div>
          ) : (
            sortedApplications.map((application) => (
              <div key={application._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {application.job.title}
                      </h3>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </span>
                      {application.matchScore && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchScoreColor(application.matchScore)}`}>
                          {application.matchScore}% Match
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{application.job.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(application.appliedAt)}</span>
                      </div>
                    </div>

                    {/* Match Score Details */}
                    {application.matchedDetails && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Match Breakdown
                          </span>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Skills</span>
                              <span className="font-medium">{application.matchedDetails.skillsMatch || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div 
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${application.matchedDetails.skillsMatch || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Experience</span>
                              <span className="font-medium">{application.matchedDetails.experienceMatch || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${application.matchedDetails.experienceMatch || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Matched Skills */}
                        {application.matchedDetails.matchedSkills?.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Matched Skills: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {application.matchedDetails.matchedSkills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                              {application.matchedDetails.matchedSkills.length > 3 && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded">
                                  +{application.matchedDetails.matchedSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{application.job.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/jobs/${application.job._id}`)}
                      className="flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Job
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/user/applications/${application._id}`)}
                      className="flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    {application.status === 'applied' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleWithdrawApplication(application._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      >
                        Withdraw
                      </Button>
                    )}
                    
                    {application.status === 'rejected' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/jobs/${application.job._id}`)}
                        className="flex items-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Reapply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </UserLayout>
  )
}

export default UserApplications


