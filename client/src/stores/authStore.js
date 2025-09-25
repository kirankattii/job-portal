import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { USER_ROLES, STORAGE_KEYS, API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'

const useAuthStore = create(
  devtools(persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (token, refreshToken) => set({ 
        token, 
        refreshToken,
        isAuthenticated: !!token 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      login: async (credentials) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
          const { token, user } = response.data?.data || {}
          if (!token || !user) {
            throw new Error('Invalid login response')
          }

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))

          return { success: true, user }
        } catch (error) {
          const message = error?.response?.data?.message || error.message || 'Login failed'
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },
      
      logout: async () => {
        try {
          await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
        } catch (_) {}
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })

        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      },
      
      updateProfile: (updates) => {
        const { user } = get()
        if (user) {
          const updatedUser = { ...user, ...updates }
          set({ user: updatedUser })
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser))
        }
      },
      
      // Getters
      isUser: () => {
        const { user } = get()
        return user?.role === USER_ROLES.USER
      },
      
      isRecruiter: () => {
        const { user } = get()
        return user?.role === USER_ROLES.RECRUITER
      },
      
      isAdmin: () => {
        const { user } = get()
        return user?.role === USER_ROLES.ADMIN
      },
      
      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      // Fetch current user profile (validate session)
      fetchMe: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiClient.get('/auth/me')
          const { user } = response.data?.data || {}
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
            return { success: true, user }
          }
          throw new Error('Invalid session')
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error?.response?.data?.message || 'Session check failed' }
        }
      },

      // Registration flow helpers
      registerRequest: async ({ email, name }) => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { email, name })
          set({ isLoading: false })
          return { success: true, data: res.data?.data }
        } catch (error) {
          const message = error?.response?.data?.message || 'Registration failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      verifyOtp: async ({ email, otp, password, name }) => {
        set({ isLoading: true, error: null })
        try {
          const res = await apiClient.post('/auth/verify-otp', { email, otp, password, name })
          const { token, user } = res.data?.data || {}
          set({ user, token, isAuthenticated: true, isLoading: false })
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
          return { success: true, user }
        } catch (error) {
          const message = error?.response?.data?.message || 'OTP verification failed'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      resendOtp: async ({ email }) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/resend-otp', { email })
          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          const message = error?.response?.data?.message || 'Failed to resend OTP'
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  ))
)

export { useAuthStore }
export default useAuthStore
