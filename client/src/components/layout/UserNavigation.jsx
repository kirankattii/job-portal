import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const UserNavigation = () => {
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/user/dashboard',
      icon: '🏠',
      description: 'Overview and quick actions'
    },
    {
      name: 'Profile',
      href: '/user/profile',
      icon: '👤',
      description: 'Manage your profile information'
    },
    {
      name: 'Applications',
      href: '/user/applications',
      icon: '📋',
      description: 'Track your job applications'
    },
    {
      name: 'Saved Jobs',
      href: '/user/saved-jobs',
      icon: '⭐',
      description: 'Your saved job listings'
    },
    {
      name: 'Settings',
      href: '/user/settings',
      icon: '⚙️',
      description: 'Account and preferences'
    }
  ]

  const isActive = (href) => {
    if (href === '/user/dashboard') {
      return location.pathname === '/user/dashboard' || location.pathname === '/user'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          User Menu
        </h2>
        
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors group',
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default UserNavigation
