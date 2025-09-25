/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useEffect } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, fetchMe } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        fetchMe()
      }
    }
  }, [isAuthenticated, fetchMe])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Redirect to appropriate dashboard based on user role
  if (user?.role && !location.pathname.includes(`/${user.role}`)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  return children
}

export default ProtectedRoute
