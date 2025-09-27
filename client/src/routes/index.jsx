/**
 * Modern Routing Configuration
 * Centralized routing setup with role-based access control
 */

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleBasedRoute from '@/components/auth/RoleBasedRoute'

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'))
const Login = lazy(() => import('@/pages/auth/Login'))
const Register = lazy(() => import('@/pages/auth/Register'))
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'))

// User routes
const UserDashboard = lazy(() => import('@/pages/user/Dashboard'))
const UserProfile = lazy(() => import('@/pages/user/Profile'))
const UserJobs = lazy(() => import('@/pages/user/Jobs'))
const UserApplications = lazy(() => import('@/pages/user/Applications'))
const ApplicationDetails = lazy(() => import('@/pages/user/ApplicationDetails'))
const UserSavedJobs = lazy(() => import('@/pages/user/SavedJobs'))
const UserSettings = lazy(() => import('@/pages/user/Settings'))

// Recruiter routes
const RecruiterDashboard = lazy(() => import('@/pages/recruiter/Dashboard'))
const RecruiterJobs = lazy(() => import('@/pages/recruiter/Jobs'))
const RecruiterCreateJob = lazy(() => import('@/pages/recruiter/CreateJob'))
const RecruiterEditJob = lazy(() => import('@/pages/recruiter/EditJob'))
const RecruiterApplications = lazy(() => import('@/pages/recruiter/Applications'))
const RecruiterCandidates = lazy(() => import('@/pages/recruiter/Candidates'))
const RecruiterAnalytics = lazy(() => import('@/pages/recruiter/Analytics'))
const RecruiterSettings = lazy(() => import('@/pages/recruiter/Settings'))

// Admin routes
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminRecruiters = lazy(() => import('@/pages/admin/Recruiters'))
const AdminJobs = lazy(() => import('@/pages/admin/Jobs'))
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'))
const AdminReports = lazy(() => import('@/pages/admin/Reports'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))

// Public job routes
const JobListings = lazy(() => import('@/pages/JobListings'))
const JobDetails = lazy(() => import('@/pages/JobDetails'))
const ApplicationConfirmation = lazy(() => import('@/pages/ApplicationConfirmation'))
const About = lazy(() => import('@/pages/About'))

// Error pages
const NotFound = lazy(() => import('@/pages/NotFound'))
const Unauthorized = lazy(() => import('@/pages/Unauthorized'))

// Profile update page (public, token-based)
const ProfileUpdate = lazy(() => import('@/pages/ProfileUpdate'))

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
)

// Route configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public routes
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'jobs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <JobListings />
          </Suspense>
        ),
      },
      {
        path: 'jobs/:jobId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <JobDetails />
          </Suspense>
        ),
      },
      {
        path: 'jobs/:jobId/apply/confirmation',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ApplicationConfirmation />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        ),
      },
      {
        path: 'profile/update/:token',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfileUpdate />
          </Suspense>
        ),
      },
      
      // Auth routes
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            ),
          },
          {
            path: 'register',
            element: (
              <Suspense fallback={<PageLoader />}>
                <Register />
              </Suspense>
            ),
          },
          {
            path: 'forgot-password',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ForgotPassword />
              </Suspense>
            ),
          },
          {
            path: 'reset-password',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ResetPassword />
              </Suspense>
            ),
          },
        ],
      },
      
      // Protected user routes
      {
        path: 'user',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['user']}>
              <Outlet />
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/user/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserDashboard />
              </Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserProfile />
              </Suspense>
            ),
          },
          {
            path: 'jobs',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserJobs />
              </Suspense>
            ),
          },
          {
            path: 'applications',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserApplications />
              </Suspense>
            ),
          },
          {
            path: 'applications/:applicationId',
            element: (
              <Suspense fallback={<PageLoader />}>
                <ApplicationDetails />
              </Suspense>
            ),
          },
          {
            path: 'saved-jobs',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserSavedJobs />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserSettings />
              </Suspense>
            ),
          },
        ],
      },
      
      // Protected recruiter routes
      {
        path: 'recruiter',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['recruiter']}>
              <Outlet />
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/recruiter/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterDashboard />
              </Suspense>
            ),
          },
          {
            path: 'jobs',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterJobs />
              </Suspense>
            ),
          },
          {
            path: 'jobs/create',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterCreateJob />
              </Suspense>
            ),
          },
          {
            path: 'jobs/:id/edit',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterEditJob />
              </Suspense>
            ),
          },
          {
            path: 'applications',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterApplications />
              </Suspense>
            ),
          },
          {
            path: 'candidates',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterCandidates />
              </Suspense>
            ),
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterAnalytics />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <RecruiterSettings />
              </Suspense>
            ),
          },
        ],
      },
      
      // Protected admin routes
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={['admin']}>
              <Outlet />
            </RoleBasedRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboard />
              </Suspense>
            ),
          },
          {
            path: 'users',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminUsers />
              </Suspense>
            ),
          },
          {
            path: 'recruiters',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminRecruiters />
              </Suspense>
            ),
          },
          {
            path: 'jobs',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminJobs />
              </Suspense>
            ),
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminAnalytics />
              </Suspense>
            ),
          },
          {
            path: 'reports',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminReports />
              </Suspense>
            ),
          },
          {
            path: 'settings',
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminSettings />
              </Suspense>
            ),
          },
        ],
      },
      
      // Error routes
      {
        path: 'unauthorized',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Unauthorized />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
])

export default router
