import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function ApplicationAnalytics({ applications = [], dateRange = '30d' }) {
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [chartData, setChartData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setChartData(generateMockData())
      setIsLoading(false)
    }, 1000)
  }, [dateRange, applications])

  const generateMockData = () => {
    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        applications: Math.floor(Math.random() * 20) + 5,
        interviews: Math.floor(Math.random() * 8) + 2,
        hired: Math.floor(Math.random() * 3) + 1,
        rejected: Math.floor(Math.random() * 15) + 3
      })
    }

    return {
      daily: data,
      summary: {
        totalApplications: applications.length,
        totalInterviews: Math.floor(applications.length * 0.3),
        totalHired: Math.floor(applications.length * 0.1),
        totalRejected: Math.floor(applications.length * 0.4),
        averageTimeToHire: 14,
        conversionRate: 12.5
      },
      byStatus: {
        applied: applications.filter(app => app.status === 'applied').length,
        reviewing: applications.filter(app => app.status === 'reviewing').length,
        rejected: applications.filter(app => app.status === 'rejected').length,
        hired: applications.filter(app => app.status === 'hired').length
      },
      byMatchScore: {
        high: applications.filter(app => app.matchScore >= 80).length,
        medium: applications.filter(app => app.matchScore >= 50 && app.matchScore < 80).length,
        low: applications.filter(app => app.matchScore < 50).length
      }
    }
  }

  const metrics = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'funnel', label: 'Hiring Funnel', icon: '🔄' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'sources', label: 'Sources', icon: '🌐' },
    { id: 'performance', label: 'Performance', icon: '⚡' }
  ]

  const StatCard = ({ title, value, change, icon, color = 'blue' }) => {
    const getColorClasses = (color) => {
      switch (color) {
        case 'green':
          return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
        case 'red':
          return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        case 'yellow':
          return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
        case 'purple':
          return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
        default:
          return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      }
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <p className={cn(
                "text-sm",
                change > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {change > 0 ? '+' : ''}{change}% from last period
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-full",
            getColorClasses(color)
          )}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    )
  }

  const SimpleChart = ({ data, type = 'line' }) => {
    if (!data || data.length === 0) return null

    const maxValue = Math.max(...data.map(d => d.applications))
    const minValue = Math.min(...data.map(d => d.applications))

    return (
      <div className="h-64 w-full">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {type === 'line' ? (
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points={data.map((d, i) => {
                const x = (i / (data.length - 1)) * 380 + 10
                const y = 190 - ((d.applications - minValue) / (maxValue - minValue)) * 160
                return `${x},${y}`
              }).join(' ')}
              className="text-blue-500"
            />
          ) : (
            data.map((d, i) => {
              const x = (i / data.length) * 380 + 10
              const width = 380 / data.length - 2
              const height = ((d.applications - minValue) / (maxValue - minValue)) * 160
              return (
                <rect
                  key={i}
                  x={x}
                  y={190 - height}
                  width={width}
                  height={height}
                  className="fill-blue-500"
                />
              )
            })
          )}
        </svg>
      </div>
    )
  }

  const FunnelChart = ({ data }) => {
    const stages = [
      { name: 'Applications', value: data.totalApplications, color: 'bg-blue-500' },
      { name: 'Screening', value: Math.floor(data.totalApplications * 0.7), color: 'bg-yellow-500' },
      { name: 'Interviews', value: data.totalInterviews, color: 'bg-orange-500' },
      { name: 'Final Review', value: Math.floor(data.totalInterviews * 0.6), color: 'bg-purple-500' },
      { name: 'Hired', value: data.totalHired, color: 'bg-green-500' }
    ]

    return (
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center space-x-4">
            <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
              {stage.name}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
              <div
                className={cn(
                  "h-8 rounded-full flex items-center justify-end pr-4 text-white text-sm font-medium transition-all duration-500",
                  stage.color
                )}
                style={{ width: `${(stage.value / data.totalApplications) * 100}%` }}
              >
                {stage.value}
              </div>
            </div>
            <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
              {Math.round((stage.value / data.totalApplications) * 100)}%
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMetricContent = () => {
    switch (selectedMetric) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Applications"
                value={chartData.summary?.totalApplications || 0}
                change={12.5}
                icon="📄"
                color="blue"
              />
              <StatCard
                title="Interviews Scheduled"
                value={chartData.summary?.totalInterviews || 0}
                change={8.3}
                icon="🎯"
                color="yellow"
              />
              <StatCard
                title="Hired"
                value={chartData.summary?.totalHired || 0}
                change={-2.1}
                icon="✅"
                color="green"
              />
              <StatCard
                title="Conversion Rate"
                value={`${chartData.summary?.conversionRate || 0}%`}
                change={5.2}
                icon="📈"
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Applications by Status
                </h3>
                <div className="space-y-3">
                  {Object.entries(chartData.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / chartData.summary?.totalApplications) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Match Score Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(chartData.byMatchScore || {}).map(([range, count]) => (
                    <div key={range} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {range} Match
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              range === 'high' ? "bg-green-500" :
                              range === 'medium' ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${(count / chartData.summary?.totalApplications) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'funnel':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Hiring Funnel
            </h3>
            <FunnelChart data={chartData.summary} />
          </div>
        )

      case 'timeline':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Applications Timeline
            </h3>
            <SimpleChart data={chartData.daily} type="line" />
          </div>
        )

      case 'sources':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Application Sources
            </h3>
            <div className="space-y-4">
              {[
                { source: 'Job Board', count: 45, percentage: 60 },
                { source: 'Company Website', count: 20, percentage: 27 },
                { source: 'Referral', count: 8, percentage: 11 },
                { source: 'Social Media', count: 2, percentage: 2 }
              ].map((item) => (
                <div key={item.source} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.source}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Avg. Time to Hire"
                value={`${chartData.summary?.averageTimeToHire || 0} days`}
                change={-5.2}
                icon="⏱️"
                color="blue"
              />
              <StatCard
                title="Interview Success Rate"
                value="68%"
                change={12.3}
                icon="🎯"
                color="green"
              />
              <StatCard
                title="Cost per Hire"
                value="$2,400"
                change={-8.1}
                icon="💰"
                color="purple"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Trends
              </h3>
              <SimpleChart data={chartData.daily} type="bar" />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metric Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                selectedMetric === metric.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <span>{metric.icon}</span>
              <span>{metric.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Metric Content */}
      {renderMetricContent()}

      {/* Export Options */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Export Report</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Download analytics data in various formats
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              Export Excel
            </Button>
            <Button variant="outline" size="sm">
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
