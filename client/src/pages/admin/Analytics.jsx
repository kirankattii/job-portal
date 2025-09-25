import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { adminService } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminLineChart from '@/components/admin/AdminLineChart'
import AdminDonutChart from '@/components/admin/AdminDonutChart'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    adminService.getAnalytics({ period })
      .then((res) => { if (mounted) setAnalytics(res.data) })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [period])

  const trendSeries = useMemo(() => {
    if (!analytics) return { registrations: [], jobs: [], applications: [] }
    const format = (d) => `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`
    return {
      registrations: analytics.trends.dailyRegistrations.map(d => ({ date: format(d), count: d.count })),
      jobs: analytics.trends.dailyJobPostings.map(d => ({ date: format(d), count: d.count })),
      applications: analytics.trends.dailyApplications.map(d => ({ date: format(d), count: d.count })),
    }
  }, [analytics])

  const distributions = useMemo(() => {
    if (!analytics) return { jobStatus: [], applicationStatus: [], userRoles: [], recruiterVerification: [] }
    const mapDist = (arr, nameMap = (x) => String(x)) => arr.map(i => ({ name: nameMap(i._id), value: i.count }))
    return {
      jobStatus: mapDist(analytics.distributions.jobStatus),
      applicationStatus: mapDist(analytics.distributions.applicationStatus),
      userRoles: mapDist(analytics.distributions.userRoles),
      recruiterVerification: mapDist(analytics.distributions.recruiterVerification, (v) => v ? 'Verified' : 'Unverified'),
    }
  }, [analytics])

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900 text-sm">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 1 year</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
      )}

      {!loading && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AdminLineChart title="Registrations" data={trendSeries.registrations} />
            <AdminLineChart title="Job Postings" data={trendSeries.jobs} color="#10b981" />
            <AdminLineChart title="Applications" data={trendSeries.applications} color="#8b5cf6" />
          </div>
          <div className="space-y-6">
            <AdminDonutChart title="User Roles" data={distributions.userRoles} />
            <AdminDonutChart title="Job Status" data={distributions.jobStatus} />
            <AdminDonutChart title="Application Status" data={distributions.applicationStatus} />
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}


