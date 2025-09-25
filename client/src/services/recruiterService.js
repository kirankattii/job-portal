import { api } from './apiClient'
import { API_ENDPOINTS } from '@/constants'

/**
 * Recruiter Service
 * Complete API integration for recruiter functionality
 */
export const recruiterService = {
  // Dashboard
  getDashboard: () => api.get(API_ENDPOINTS.RECRUITER.DASHBOARD),

  // Jobs Management
  getJobs: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return api.get(`${API_ENDPOINTS.RECRUITER.JOBS}${queryParams ? `?${queryParams}` : ''}`)
  },

  createJob: (jobData) => api.post(API_ENDPOINTS.RECRUITER.JOBS, jobData),

  updateJob: (jobId, jobData) => api.put(`${API_ENDPOINTS.RECRUITER.JOBS}/${jobId}`, jobData),

  deleteJob: (jobId) => api.delete(`${API_ENDPOINTS.RECRUITER.JOBS}/${jobId}`),

  // Bulk operations
  bulkUpdateJobs: async (jobIds, updates) => {
    const results = await Promise.allSettled(
      jobIds.map((id) => recruiterService.updateJob(id, updates))
    )
    return results
  },

  bulkDeleteJobs: async (jobIds) => {
    const results = await Promise.allSettled(
      jobIds.map((id) => recruiterService.deleteJob(id))
    )
    return results
  },

  // Export jobs
  exportJobs: async (filters = {}) => {
    const resp = await recruiterService.getJobs({ ...filters, limit: 1000 })
    const jobs = resp.data?.data?.jobs || []
    const headers = ['title', 'location', 'status', 'createdAt', 'applicantsCount']
    const csvRows = [headers.join(',')]
    
    for (const job of jobs) {
      csvRows.push([
        JSON.stringify(job.title || ''),
        JSON.stringify(job.location || ''),
        JSON.stringify(job.status || ''),
        JSON.stringify(job.createdAt || ''),
        JSON.stringify(job.actualApplicantsCount ?? job.applicantsCount ?? 0),
      ].join(','))
    }
    
    const csv = csvRows.join('\n')
    return { data: new Blob([csv], { type: 'text/csv' }) }
  },

  // Applications Management
  getJobApplications: (jobId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return api.get(`/recruiter/job/${jobId}/applicants${queryParams ? `?${queryParams}` : ''}`)
  },

  updateApplicationStatus: (applicationId, status, notes = '') =>
    api.put(`/recruiter/applications/${applicationId}/status`, { status, notes }),

  // Bulk application operations
  bulkUpdateApplications: async (applicationIds, updates) => {
    const results = await Promise.allSettled(
      applicationIds.map((id) => 
        recruiterService.updateApplicationStatus(id, updates.status, updates.notes || '')
      )
    )
    return results
  },

  // Candidates Search & Management
  searchCandidates: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    return api.get(`/recruiter/candidates${queryParams ? `?${queryParams}` : ''}`)
  },

  getCandidateProfile: (candidateId) => api.get(`/recruiter/candidates/${candidateId}`),

  // Skills suggestions
  getSkillsSuggestions: async (query) => {
    if (!query) return { data: [] }
    const resp = await api.get(`/users/skills/suggestions?q=${encodeURIComponent(query)}`)
    return { data: (resp.data?.data?.suggestions) || [] }
  },

  // AI/Matching endpoints
  matchJobForAllUsers: (jobId, topN = 20) =>
    api.post(`/ai/match-job/${jobId}`, { topN }),

  // Analytics (using dashboard data)
  getAnalytics: () => recruiterService.getDashboard(),

  getJobAnalytics: (jobId) => {
    // Get job-specific analytics by fetching applications
    return recruiterService.getJobApplications(jobId, { limit: 1000 })
  },

  // Location suggestions (mock for now)
  getLocationSuggestions: async (query) => {
    // This would typically call a geocoding service
    const commonLocations = [
      'New York, NY',
      'San Francisco, CA',
      'Los Angeles, CA',
      'Chicago, IL',
      'Boston, MA',
      'Seattle, WA',
      'Austin, TX',
      'Denver, CO',
      'Remote',
      'Hybrid'
    ]
    
    if (!query) return { data: commonLocations }
    
    const filtered = commonLocations.filter(location =>
      location.toLowerCase().includes(query.toLowerCase())
    )
    
    return { data: filtered }
  },

  // Communication (placeholder for future implementation)
  sendMessage: async (candidateId, message) => {
    // This would integrate with a messaging system
    return { data: { success: false, message: 'Messaging not implemented yet' } }
  },

  getCommunicationHistory: async (candidateId) => {
    // This would fetch message history
    return { data: { data: [] } }
  },

  // Saved candidates (placeholder for future implementation)
  saveCandidate: async (candidateId) => {
    return { data: { success: false, message: 'Save candidate not implemented yet' } }
  },

  getSavedCandidates: async () => {
    return { data: { data: { candidates: [] } } }
  }
}

export default recruiterService
