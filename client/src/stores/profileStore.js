import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import apiClient from '@/services/apiClient'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants'

const useProfileStore = create(
  devtools(persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      error: null,

      fetchProfile: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.get(API_ENDPOINTS.USER.PROFILE, { cache: true, cacheTTL: 60_000 })
          const profile = res.data?.data || res.data
          set({ profile, isLoading: false })
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile))
          return { success: true, profile }
        } catch (error) {
          set({ isLoading: false, error: error?.message || 'Failed to load profile' })
          return { success: false, error }
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, updates)
          const profile = res.data?.data || res.data
          set({ profile, isLoading: false })
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(profile))
          return { success: true, profile }
        } catch (error) {
          set({ isLoading: false, error: error?.response?.data?.message || 'Failed to update profile' })
          return { success: false, error }
        }
      },
    }),
    { name: 'profile-storage', partialize: (s) => ({ profile: s.profile }) }
  ))
)

export default useProfileStore


