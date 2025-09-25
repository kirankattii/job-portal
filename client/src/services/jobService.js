import { api } from './apiClient'
import useAuthStore from '@/stores/authStore'
import { USER_ROLES } from '@/constants'

/**
 * Job Search and Management API Service
 * Handles all job-related API calls
 */

// Job Search and Filtering
export const jobService = {
  // Search jobs with filters
  searchJobs: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      location = '',
      skills = [],
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      remote,
      jobType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    })

    // Add search parameters
    if (search) queryParams.append('search', search)
    if (location) queryParams.append('location', location)
    if (skills.length > 0) queryParams.append('skills', skills.join(','))
    if (experienceMin !== undefined) queryParams.append('experienceMin', experienceMin.toString())
    if (experienceMax !== undefined) queryParams.append('experienceMax', experienceMax.toString())
    if (salaryMin !== undefined) queryParams.append('salaryMin', salaryMin.toString())
    if (salaryMax !== undefined) queryParams.append('salaryMax', salaryMax.toString())
    if (remote !== undefined) queryParams.append('remote', remote.toString())
    if (jobType) queryParams.append('jobType', jobType)

    const response = await api.get(`/jobs/search?${queryParams.toString()}`)
    return response.data
  },

  // Get job details
  getJobDetails: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`)
    return response.data
  },

  // Get job categories
  getJobCategories: async () => {
    const response = await api.get('/jobs/categories/list')
    return response.data
  },

  // Get job locations
  getJobLocations: async () => {
    const response = await api.get('/jobs/locations/list')
    return response.data
  },

  // Get popular skills
  getPopularSkills: async () => {
    const response = await api.get('/jobs/skills/popular')
    return response.data
  },

  // Save a job
  saveJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/save`)
    return response.data
  },

  // Remove saved job
  removeSavedJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}/save`)
    return response.data
  },

  // Apply to a job
  applyToJob: async (jobId, applicationData) => {
    const formData = new FormData()
    
    // Add cover letter if provided
    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter)
    }
    
    // Add resume file if provided
    if (applicationData.resumeFile) {
      formData.append('resume', applicationData.resumeFile)
    }
    
    // Add resume URL if provided
    if (applicationData.resumeUrl) {
      formData.append('resumeUrl', applicationData.resumeUrl)
    }

    const response = await api.upload(`/jobs/${jobId}/apply`, formData)
    return response.data
  }
}

// Saved Jobs API Service
export const savedJobsService = {
  // Get user's saved jobs
  getSavedJobs: async (params = {}) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const {
      page = 1,
      limit = 10,
      sortBy = 'savedAt',
      sortOrder = 'desc'
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    })

    const response = await api.get(`/users/saved-jobs?${queryParams.toString()}`)
    return response.data
  },

  // Save a job
  saveJob: async (jobId) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const response = await api.post(`/users/saved-jobs/${jobId}`)
    return response.data
  },

  // Remove saved job
  removeSavedJob: async (jobId) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const response = await api.delete(`/users/saved-jobs/${jobId}`)
    return response.data
  },

  // Bulk remove saved jobs
  removeMultipleSavedJobs: async (jobIds) => {
    const promises = jobIds.map(jobId => removeSavedJob(jobId))
    const results = await Promise.allSettled(promises)
    return results
  }
}

// Applications API Service
export const applicationsService = {
  // Get user's applications
  getApplications: async (params = {}) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'appliedAt',
      sortOrder = 'desc'
    } = params

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    })

    if (status) queryParams.append('status', status)

    const response = await api.get(`/users/applications?${queryParams.toString()}`)
    return response.data
  },

  // Apply to a job via users route
  applyToJob: async (jobId, applicationData) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const formData = new FormData()
    
    // Add cover letter if provided
    if (applicationData.coverLetter) {
      formData.append('coverLetter', applicationData.coverLetter)
    }
    
    // Add resume file if provided
    if (applicationData.resumeFile) {
      formData.append('resume', applicationData.resumeFile)
    }
    
    // Add resume URL if provided
    if (applicationData.resumeUrl) {
      formData.append('resumeUrl', applicationData.resumeUrl)
    }

    const response = await api.upload(`/users/applications/${jobId}`, formData)
    return response.data
  }
}

// Skills API Service
export const skillsService = {
  // Get skill suggestions
  getSkillSuggestions: async (params = {}) => {
    const { q = '', category = '', popular = false, categories = false } = params

    const queryParams = new URLSearchParams()
    if (q) queryParams.append('q', q)
    if (category) queryParams.append('category', category)
    if (popular) queryParams.append('popular', 'true')
    if (categories) queryParams.append('categories', 'true')

    const response = await api.get(`/users/skills/suggestions?${queryParams.toString()}`)
    return response.data
  }
}

export default jobService
