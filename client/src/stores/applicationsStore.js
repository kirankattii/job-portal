import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants'

const useApplicationsStore = create(
  devtools(persist(
    (set, get) => ({
      applications: [],
      isLoading: false,
      error: null,

      fetchApplications: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.get(API_ENDPOINTS.USER.APPLICATIONS, { cache: true, cacheTTL: 20_000 })
          const apps = res.data?.data || res.data || []
          set({ applications: apps, isLoading: false })
          return { success: true, applications: apps }
        } catch (error) {
          set({ isLoading: false, error: error?.message || 'Failed to load applications' })
          return { success: false, error }
        }
      },

      withdrawApplication: async (applicationId) => {
        try {
          await apiClient.post(`${API_ENDPOINTS.USER.APPLICATIONS}/${applicationId}/withdraw`)
          set({ applications: get().applications.filter((a) => a.id !== applicationId) })
          return { success: true }
        } catch (error) {
          return { success: false, error: error?.response?.data?.message || 'Failed to withdraw application' }
        }
      },
    }),
    { name: 'applications-storage' }
  ))
)

export default useApplicationsStore


