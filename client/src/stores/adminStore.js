import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants'

const useAdminStore = create(
  devtools(persist(
    (set, get) => ({
      dashboard: null,
      users: [],
      recruiters: [],
      jobs: [],
      isLoading: false,
      error: null,

      fetchDashboard: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD, { cache: true, cacheTTL: 30_000 })
          set({ dashboard: res.data?.data || res.data, isLoading: false })
          return { success: true }
        } catch (error) {
          set({ isLoading: false, error: error?.message || 'Failed to load admin dashboard' })
          return { success: false, error }
        }
      },
    }),
    { name: 'admin-storage', partialize: (s) => ({ dashboard: s.dashboard }) }
  ))
)

export default useAdminStore


