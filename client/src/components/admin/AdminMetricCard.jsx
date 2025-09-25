import React from 'react'
import { cn } from '@/utils/cn'

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300',
}

export default function AdminMetricCard({ title, value, change, changeHint = 'vs previous period', icon, color = 'blue' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={cn(
                'text-sm font-medium',
                Number(change) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {Number(change) >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{changeHint}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  )
}


