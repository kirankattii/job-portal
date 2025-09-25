import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import apiClient from '@/services/apiClient'
import { API_ENDPOINTS, PAGINATION } from '@/constants'

const useJobsStore = create(
  devtools(persist(
    (set, get) => ({
      // State
      jobs: [],
      total: 0,
      page: 1,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      query: '',
      filters: {},
      selectedJob: null,
      isLoading: false,
      error: null,

      // Actions
      setQuery: (query) => set({ query }),
      setFilters: (filters) => set({ filters }),
      setPagination: (page, pageSize) => set({ page, pageSize }),
      clearError: () => set({ error: null }),
      selectJob: (job) => set({ selectedJob: job }),

      fetchJobs: async (params = {}) => {
        set({ isLoading: true, error: null })
        try {
          const { page, pageSize, query, filters } = get()
          const response = await apiClient.get(API_ENDPOINTS.JOBS.LIST, {
            params: {
              page,
              pageSize,
              q: query,
              ...filters,
              ...params,
            },
            cache: true,
            cacheTTL: 30_000,
            retry: 2,
            retryDelay: 800,
          })
          const { items = [], total = 0 } = response.data?.data || response.data || {}
          set({ jobs: items, total, isLoading: false })
          return { success: true, items, total }
        } catch (error) {
          set({ isLoading: false, error: error?.message || 'Failed to load jobs' })
          return { success: false, error }
        }
      },

      searchJobs: async (q) => {
        set({ query: q, page: 1 })
        return get().fetchJobs()
      },

      applyToJob: async ({ jobId, payload }) => {
        try {
          const res = await apiClient.post(`${API_ENDPOINTS.JOBS.APPLY}/${jobId}/apply`, payload)
          return { success: true, data: res.data?.data || res.data }
        } catch (error) {
          return { success: false, error: error?.response?.data?.message || 'Failed to apply' }
        }
      },

      saveJob: async (jobId) => {
        try {
          const res = await apiClient.post(`${API_ENDPOINTS.JOBS.SAVE}/${jobId}/save`)
          return { success: true, data: res.data?.data || res.data }
        } catch (error) {
          return { success: false, error: error?.response?.data?.message || 'Failed to save job' }
        }
      },
    }),
    {
      name: 'jobs-storage',
      partialize: (state) => ({
        page: state.page,
        pageSize: state.pageSize,
        query: state.query,
        filters: state.filters,
      }),
    }
  ))
)

export default useJobsStore


