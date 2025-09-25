import React, { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

// Simple chart component using CSS and SVG (no external dependencies)
const SimpleChart = ({ data, type = 'bar', title, className = '' }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  if (type === 'bar') {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="flex items-end justify-between h-48 space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative h-40 flex items-end">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-500 ease-out"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                <div className="font-medium">{item.value}</div>
                <div className="truncate max-w-16">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const startAngle = cumulativePercentage * 3.6
                const endAngle = (cumulativePercentage + percentage) * 3.6
                cumulativePercentage += percentage

                const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                const color = colors[index % colors.length]

                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
                const largeArcFlag = percentage > 50 ? 1 : 0

                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={color}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                )
              })}
            </svg>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            const color = colors[index % colors.length]
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}

const LineChart = ({ data, title, className = '' }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400
              const y = 200 - ((item.value - minValue) / range) * 180 - 10
              return `${x},${y}`
            }).join(' ')}
            className="transition-all duration-500 ease-out"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400
            const y = 200 - ((item.value - minValue) / range) * 180 - 10
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="transition-all duration-300 hover:r-6"
              />
            )
          })}
        </svg>
      </div>
      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <div>{item.label}</div>
            <div className="font-medium text-gray-900 dark:text-white">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardCharts({ applicationsData, recentData }) {
  // Applications by status data
  const applicationsByStatus = applicationsData?.byStatus ? [
    { label: 'Applied', value: applicationsData.byStatus.applied || 0 },
    { label: 'Reviewing', value: applicationsData.byStatus.reviewing || 0 },
    { label: 'Rejected', value: applicationsData.byStatus.rejected || 0 },
    { label: 'Hired', value: applicationsData.byStatus.hired || 0 },
  ] : []

  // Applications by match score data
  const applicationsByMatchScore = applicationsData?.byMatchScore ? [
    { label: 'High (80%+)', value: applicationsData.byMatchScore.high || 0 },
    { label: 'Medium (50-79%)', value: applicationsData.byMatchScore.medium || 0 },
    { label: 'Low (<50%)', value: applicationsData.byMatchScore.low || 0 },
  ] : []

  // Mock data for applications over time (last 7 days)
  const applicationsOverTime = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 18 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 28 },
    { label: 'Sat', value: 8 },
    { label: 'Sun', value: 5 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Applications by Status */}
      <SimpleChart
        data={applicationsByStatus}
        type="pie"
        title="Applications by Status"
      />

      {/* Applications by Match Score */}
      <SimpleChart
        data={applicationsByMatchScore}
        type="bar"
        title="Applications by Match Score"
      />

      {/* Applications Over Time */}
      <div className="lg:col-span-2">
        <LineChart
          data={applicationsOverTime}
          title="Applications Over Time (Last 7 Days)"
        />
      </div>
    </div>
  )
}
