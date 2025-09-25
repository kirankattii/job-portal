/**
 * Modern API Hook
 * Custom hook for API calls with loading states, error handling, and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, handleApiError } from '@/services/apiClient'

const useApi = (url, options = {}) => {
  const {
    immediate = true,
    dependencies = [],
    retry = 0,
    retryDelay = 1000,
    cache = false,
    cacheKey = url,
    onSuccess,
    onError,
    transform,
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const abortControllerRef = useRef(null)
  const cacheRef = useRef(new Map())

  const execute = useCallback(async (requestOptions = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    // Check cache
    if (cache && cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey)
      setData(cachedData)
      setLoading(false)
      return cachedData
    }

    setLoading(true)
    setError(null)

    try {
      const response = await api.get(url, {
        signal: abortControllerRef.current.signal,
        ...requestOptions,
      })

      let result = response.data

      // Transform data if provided
      if (transform) {
        result = transform(result)
      }

      setData(result)
      setRetryCount(0)

      // Cache data if enabled
      if (cache) {
        cacheRef.current.set(cacheKey, result)
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      const apiError = handleApiError(err)

      // Retry logic
      if (retryCount < retry && !err.response?.status) {
        setRetryCount(prev => prev + 1)
        setTimeout(() => {
          execute(requestOptions)
        }, retryDelay)
        return
      }

      setError(apiError)
      setRetryCount(0)

      // Call error callback
      if (onError) {
        onError(apiError)
      }

      throw apiError
    } finally {
      setLoading(false)
    }
  }, [url, retry, retryDelay, cache, cacheKey, onSuccess, onError, transform, retryCount])

  const refetch = useCallback((requestOptions = {}) => {
    return execute(requestOptions)
  }, [execute])

  const clearCache = useCallback(() => {
    if (cache) {
      cacheRef.current.delete(cacheKey)
    }
  }, [cache, cacheKey])

  // Execute on mount and when dependencies change
  useEffect(() => {
    if (immediate) {
      execute()
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [immediate, ...dependencies])

  return {
    data,
    loading,
    error,
    retryCount,
    refetch,
    clearCache,
    execute,
  }
}

export default useApi
