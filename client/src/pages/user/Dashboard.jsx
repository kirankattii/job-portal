import React from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import UserLayout from '@/components/layout/UserLayout'
import Button from '@/components/ui/Button'

const UserDashboard = () => {
  const { user } = useAuthStore()

  const quickActions = [
    {
      title: 'Complete Profile',
      description: 'Finish setting up your profile to get better job matches',
      icon: '👤',
      href: '/user/profile',
      color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
    },
    {
      title: 'Browse Jobs',
      description: 'Discover new job opportunities',
      icon: '💼',
      href: '/user/jobs',
      color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
    },
    {
      title: 'View Applications',
      description: 'Track your job applications',
      icon: '📋',
      href: '/user/applications',
      color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300'
    },
    {
      title: 'Saved Jobs',
      description: 'Review your saved job listings',
      icon: '⭐',
      href: '/user/saved-jobs',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
    }
  ]

  const stats = [
    { label: 'Profile Completion', value: `${user?.profileCompletion || 0}%`, color: 'text-blue-600' },
    { label: 'Applications Sent', value: '0', color: 'text-green-600' },
    { label: 'Jobs Saved', value: '0', color: 'text-purple-600' },
    { label: 'Profile Views', value: '0', color: 'text-orange-600' }
  ]

  return (
    <UserLayout>
      <div className="p-6">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your job search
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="text-2xl opacity-50">
                  {index === 0 && '📊'}
                  {index === 1 && '📤'}
                  {index === 2 && '⭐'}
                  {index === 3 && '👀'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`p-6 rounded-lg border-2 transition-all hover:shadow-md ${action.color}`}
              >
                <div className="text-3xl mb-3">{action.icon}</div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm opacity-75">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📈</div>
            <p>No recent activity yet</p>
            <p className="text-sm">Start by completing your profile or browsing jobs</p>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default UserDashboard


