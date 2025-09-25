/**
 * Application Service
 * Handles all application-related API calls
 */

import { api } from './apiClient'
import { API_ENDPOINTS } from '@/constants'
import useAuthStore from '@/stores/authStore'
import { USER_ROLES } from '@/constants'

export const applicationService = {
  /**
   * Get user applications with optional filtering
   */
  getApplications: async (params = {}) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const { status, limit = 100, page = 1 } = params
    
    const response = await api.get(API_ENDPOINTS.USER.APPLICATIONS, {
      params: {
        status: status !== 'all' ? status : undefined,
        limit,
        page
      }
    })
    
    return response.data
  },

  /**
   * Get single application details
   */
  getApplicationDetails: async (applicationId) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const response = await api.get(`${API_ENDPOINTS.USER.APPLICATIONS}/${applicationId}`)
    return response.data
  },

  /**
   * Export applications as CSV
   */
  exportApplications: async (format = 'csv') => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const response = await api.download(`${API_ENDPOINTS.USER.APPLICATIONS}/export`, {
      params: { format }
    })
    return response
  },

  /**
   * Apply to a job
   */
  applyToJob: async (jobId, applicationData) => {
    const response = await api.post(`${API_ENDPOINTS.JOBS.APPLY}/${jobId}`, applicationData)
    return response.data
  },

  /**
   * Save application draft
   */
  saveApplicationDraft: async (jobId, draftData) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    const response = await api.post(`${API_ENDPOINTS.USER.APPLICATIONS}/${jobId}/draft`, draftData)
    return response.data
  },

  /**
   * Withdraw application (if endpoint exists)
   */
  withdrawApplication: async (applicationId) => {
    // Check if user is recruiter or admin - these APIs should not be called for these roles
    const { user } = useAuthStore.getState()
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      throw new Error('This API is not available for recruiter and admin users')
    }

    // Note: This endpoint might need to be implemented in the backend
    const response = await api.delete(`${API_ENDPOINTS.USER.APPLICATIONS}/${applicationId}`)
    return response.data
  }
}

export default applicationService
