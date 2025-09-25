import React from 'react'
import { cn } from '@/utils/cn'

const ActivityItem = ({ type, title, description, time, status, matchScore }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      case 'reviewing': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'rejected': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'hired': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'application':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'job':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {getTypeIcon(type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {title}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {time}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
        <div className="flex items-center space-x-2 mt-2">
          {status && (
            <span className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              getStatusColor(status)
            )}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
          {matchScore && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              {matchScore}% match
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

const ActivitySection = ({ title, items, emptyMessage }) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-2">{emptyMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.slice(0, 5).map((item, index) => (
          <ActivityItem key={index} {...item} />
        ))}
      </div>
      {items.length > 5 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all {items.length} items
          </button>
        </div>
      )}
    </div>
  )
}

export default function RecentActivity({ applications, jobs }) {
  // Format applications data
  const formattedApplications = applications?.map(app => ({
    type: 'application',
    title: `${app.user?.firstName} ${app.user?.lastName} applied`,
    description: `Applied for ${app.job?.title}`,
    time: new Date(app.appliedAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: app.status,
    matchScore: app.matchScore
  })) || []

  // Format jobs data
  const formattedJobs = jobs?.map(job => ({
    type: 'job',
    title: job.title,
    description: `${job.location} • ${job.actualApplicantsCount || 0} applicants`,
    time: new Date(job.createdAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: job.status
  })) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ActivitySection
        title="Recent Applications"
        items={formattedApplications}
        emptyMessage="No recent applications"
      />
      <ActivitySection
        title="Recent Jobs"
        items={formattedJobs}
        emptyMessage="No recent jobs posted"
      />
    </div>
  )
}
