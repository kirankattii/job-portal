/**
 * Role-Based Route Component
 * Controls access based on user roles
 */

import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import Unauthorized from '@/pages/Unauthorized'

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore()

  // If not authenticated, let ProtectedRoute handle redirect
  if (!isAuthenticated) {
    return children
  }

  // If no roles specified, allow access
  if (allowedRoles.length === 0) {
    return children
  }

  // Check if user has required role
  const hasRequiredRole = user?.role && allowedRoles.includes(user.role)

  if (!hasRequiredRole) {
    return <Unauthorized />
  }

  return children
}

export default RoleBasedRoute
