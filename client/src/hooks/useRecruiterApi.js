import { useState, useCallback } from 'react'
import { recruiterService } from '@/services/recruiterService'
import toast from 'react-hot-toast'

/**
 * Custom hook for recruiter API calls with loading states and error handling
 */
export const useRecruiterApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleApiCall = useCallback(async (apiCall, successMessage = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiCall()
      
      if (successMessage) {
        toast.success(successMessage)
      }
      
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Dashboard
  const getDashboard = useCallback(() => 
    handleApiCall(() => recruiterService.getDashboard()), [handleApiCall]
  )

  // Jobs
  const getJobs = useCallback((params = {}) => 
    handleApiCall(() => recruiterService.getJobs(params)), [handleApiCall]
  )

  const createJob = useCallback((jobData) => 
    handleApiCall(() => recruiterService.createJob(jobData), 'Job created successfully'), [handleApiCall]
  )

  const updateJob = useCallback((jobId, jobData) => 
    handleApiCall(() => recruiterService.updateJob(jobId, jobData), 'Job updated successfully'), [handleApiCall]
  )

  const deleteJob = useCallback((jobId) => 
    handleApiCall(() => recruiterService.deleteJob(jobId), 'Job deleted successfully'), [handleApiCall]
  )

  const bulkUpdateJobs = useCallback(async (jobIds, updates) => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await recruiterService.bulkUpdateJobs(jobIds, updates)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.length - successCount
      
      if (successCount > 0) {
        toast.success(`${successCount} jobs updated successfully`)
      }
      if (failCount > 0) {
        toast.error(`${failCount} jobs failed to update`)
      }
      
      return results
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Bulk update failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkDeleteJobs = useCallback(async (jobIds) => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await recruiterService.bulkDeleteJobs(jobIds)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.length - successCount
      
      if (successCount > 0) {
        toast.success(`${successCount} jobs deleted successfully`)
      }
      if (failCount > 0) {
        toast.error(`${failCount} jobs failed to delete`)
      }
      
      return results
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Bulk delete failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Applications
  const getJobApplications = useCallback((jobId, params = {}) => 
    handleApiCall(() => recruiterService.getJobApplications(jobId, params)), [handleApiCall]
  )

  const updateApplicationStatus = useCallback((applicationId, status, notes = '') => 
    handleApiCall(() => recruiterService.updateApplicationStatus(applicationId, status, notes), 'Application status updated'), [handleApiCall]
  )

  const bulkUpdateApplications = useCallback(async (applicationIds, updates) => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await recruiterService.bulkUpdateApplications(applicationIds, updates)
      const successCount = results.filter(r => r.status === 'fulfilled').length
      const failCount = results.length - successCount
      
      if (successCount > 0) {
        toast.success(`${successCount} applications updated successfully`)
      }
      if (failCount > 0) {
        toast.error(`${failCount} applications failed to update`)
      }
      
      return results
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Bulk update failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Candidates
  const searchCandidates = useCallback((params = {}) => 
    handleApiCall(() => recruiterService.searchCandidates(params)), [handleApiCall]
  )

  const getCandidateProfile = useCallback((candidateId) => 
    handleApiCall(() => recruiterService.getCandidateProfile(candidateId)), [handleApiCall]
  )

  const getSkillsSuggestions = useCallback((query) => 
    handleApiCall(() => recruiterService.getSkillsSuggestions(query)), [handleApiCall]
  )

  const getLocationSuggestions = useCallback((query) => 
    handleApiCall(() => recruiterService.getLocationSuggestions(query)), [handleApiCall]
  )

  // Analytics
  const getAnalytics = useCallback(() => 
    handleApiCall(() => recruiterService.getAnalytics()), [handleApiCall]
  )

  const getJobAnalytics = useCallback((jobId) => 
    handleApiCall(() => recruiterService.getJobAnalytics(jobId)), [handleApiCall]
  )

  // Export
  const exportJobs = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await recruiterService.exportJobs(filters)
      
      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `jobs-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Jobs exported successfully')
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Export failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // AI/Matching
  const matchJobForAllUsers = useCallback((jobId, topN = 20) => 
    handleApiCall(() => recruiterService.matchJobForAllUsers(jobId, topN), 'Job matching completed'), [handleApiCall]
  )

  return {
    loading,
    error,
    setError,
    
    // Dashboard
    getDashboard,
    
    // Jobs
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    bulkUpdateJobs,
    bulkDeleteJobs,
    exportJobs,
    
    // Applications
    getJobApplications,
    updateApplicationStatus,
    bulkUpdateApplications,
    
    // Candidates
    searchCandidates,
    getCandidateProfile,
    getSkillsSuggestions,
    getLocationSuggestions,
    
    // Analytics
    getAnalytics,
    getJobAnalytics,
    
    // AI/Matching
    matchJobForAllUsers,
  }
}

export default useRecruiterApi



