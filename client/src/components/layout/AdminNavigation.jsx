import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const AdminNavigation = () => {
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
      description: 'System overview and metrics'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: '👥',
      description: 'Manage user accounts'
    },
    {
      name: 'Recruiters',
      href: '/admin/recruiters',
      icon: '🏢',
      description: 'Recruiter management'
    },
    {
      name: 'Jobs',
      href: '/admin/jobs',
      icon: '💼',
      description: 'Job moderation'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: '📈',
      description: 'System analytics'
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: '📋',
      description: 'Generate reports'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: '⚙️',
      description: 'System configuration'
    }
  ]

  const isActive = (href) => {
    if (href === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-64 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Admin Panel
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

export default AdminNavigation

