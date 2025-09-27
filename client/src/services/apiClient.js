/**
 * Modern API Client
 * Centralized HTTP client with interceptors, error handling, and retry logic
 */

import axios from 'axios'
import toast from 'react-hot-toast'
import useAuthStore from '@/stores/authStore'
import { APP_CONFIG, STORAGE_KEYS, API_ENDPOINTS } from '@/constants'

// Create axios instance
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Simple in-memory cache for GET responses
const responseCache = new Map()

const buildCacheKey = (config) => {
  const { url, method, params, headers } = config
  return JSON.stringify({ url, method, params, headers })
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp
    config.metadata = { startTime: new Date() }

    // Cache: return cached response for GET if valid
    if (config.method === 'get' && config.cache) {
      const cacheKey = buildCacheKey(config)
      const cached = responseCache.get(cacheKey)
      if (cached && (Date.now() - cached.timestamp) < (config.cacheTTL || 60_000)) {
        return Promise.reject({
          __fromCache: true,
          config,
          cachedResponse: {
            data: cached.data,
            status: 200,
            statusText: 'OK (cache)',
            headers: {},
            config,
          },
        })
      }
    }


    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime

    // Store in cache for GET
    if (response.config.method === 'get' && response.config.cache) {
      const cacheKey = buildCacheKey(response.config)
      responseCache.set(cacheKey, { data: response.data, timestamp: Date.now() })
    }
    return response
  },
  async (error) => {
    // Serve from cache short-circuit
    if (error.__fromCache) {
      return Promise.resolve(error.cachedResponse)
    }

    const { response, config } = error

    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
        status: response?.status,
        data: response?.data,
        error: error.message,
      })
    }

    // Handle token refresh on 401
    if (response?.status === 401 && !config._retry) {
      config._retry = true
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          const refreshResp = await axios.post(`${APP_CONFIG.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, { refreshToken })
          const { accessToken } = refreshResp.data || refreshResp.data?.data || {}
          if (accessToken) {
            useAuthStore.getState().setTokens(accessToken, refreshToken)
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
            config.headers.Authorization = `Bearer ${accessToken}`
            return apiClient(config)
          }
        }
      } catch (_) {
        // fall through to logout below
      }
    }

    // Handle different error types
    if (response) {
      const { status, data } = response

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          useAuthStore.getState().logout()
          toast.error('Session expired. Please login again.')
          window.location.href = '/auth/login'
          break

        case 403:
          // Forbidden
          toast.error(data?.message || 'Access denied')
          break

        case 404:
          // Not found
          toast.error(data?.message || 'Resource not found')
          break

        case 422:
          // Validation error
          if (data?.errors) {
            Object.values(data.errors).forEach((error) => {
              toast.error(error[0])
            })
          } else {
            toast.error(data?.message || 'Validation failed')
          }
          break

        case 429:
          // Rate limited
          toast.error('Too many requests. Please try again later.')
          break

        case 500:
          // Server error
          toast.error('Server error. Please try again later.')
          break

        default:
          toast.error(data?.message || 'An error occurred')
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      toast.error('Request timeout. Please try again.')
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other errors
      toast.error('An unexpected error occurred')
    }

    // Apply retry logic if configured
    if (config.retry && config.retryCount < config.retry) {
      return retryRequest(error)
    }

    return Promise.reject(error)
  }
)

// Retry logic for failed requests
const retryRequest = async (error) => {
  const { config } = error

  if (!config || !config.retry) {
    return Promise.reject(error)
  }

  config.retryCount = config.retryCount || 0

  if (config.retryCount >= config.retry) {
    return Promise.reject(error)
  }

  config.retryCount++

  // Wait before retrying
  await new Promise((resolve) => setTimeout(resolve, config.retryDelay || 1000))

  return apiClient(config)
}

// Retry logic is already handled in the main response interceptor above

// API methods
export const api = {
  // Generic methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),

  // File upload
  upload: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    })
  },

  // Download file
  download: (url, config = {}) => {
    return apiClient.get(url, {
      ...config,
      responseType: 'blob',
    })
  },

  // Batch requests
  batch: async (requests) => {
    try {
      const responses = await Promise.allSettled(requests)
      return responses.map((response) => {
        if (response.status === 'fulfilled') {
          return { success: true, data: response.value.data }
        } else {
          return { success: false, error: response.reason }
        }
      })
    } catch (error) {
      console.error('Batch request error:', error)
      throw error
    }
  },
}

// Request configuration helpers
export const createRequestConfig = (options = {}) => ({
  retry: 3,
  retryDelay: 1000,
  timeout: 10000,
  ...options,
})

// Error handling helpers
export const handleApiError = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || 'An error occurred',
      errors: error.response.data?.errors || {},
    }
  } else if (error.request) {
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: {},
    }
  } else {
    return {
      status: -1,
      message: error.message || 'An unexpected error occurred',
      errors: {},
    }
  }
}

export default apiClient
