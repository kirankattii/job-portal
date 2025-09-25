import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import AdminMetricCard from '@/components/admin/AdminMetricCard'
import AdminLineChart from '@/components/admin/AdminLineChart'
import AdminDonutChart from '@/components/admin/AdminDonutChart'
import AdminBarChart from '@/components/admin/AdminBarChart'
import { adminService } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    adminService.getAnalytics({ period })
      .then((res) => {
        if (!mounted) return
        setAnalytics(res.data)
      })
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

  const topLists = useMemo(() => {
    if (!analytics) return { skills: [], locations: [] }
    const mapTop = (arr, nameMap = (x) => String(x)) => arr.map(i => ({ name: nameMap(i._id), count: i.count }))
    return {
      skills: mapTop(analytics.trends.topSkills),
      locations: mapTop(analytics.trends.topLocations),
    }
  }, [analytics])

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminMetricCard title="Total Users" value={analytics.overview.totalUsers} change={analytics.growthRates.users} color="blue" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <AdminMetricCard title="Total Jobs" value={analytics.overview.totalJobs} change={analytics.growthRates.jobs} color="green" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" /></svg>} />
            <AdminMetricCard title="Total Applications" value={analytics.overview.totalApplications} change={analytics.growthRates.applications} color="purple" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6" /></svg>} />
            <AdminMetricCard title="Active Users" value={analytics.overview.activeUsers} change={undefined} color="orange" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AdminLineChart title="Registrations" data={trendSeries.registrations} />
              <AdminLineChart title="Job Postings" data={trendSeries.jobs} color="#10b981" />
              <AdminLineChart title="Applications" data={trendSeries.applications} color="#8b5cf6" />
              <AdminBarChart title="Top Skills" data={topLists.skills} xKey="name" yKey="count" />
              <AdminBarChart title="Top Locations" data={topLists.locations} xKey="name" yKey="count" color="#10b981" />
            </div>
            <div className="space-y-6">
              <AdminDonutChart title="User Roles" data={distributions.userRoles} />
              <AdminDonutChart title="Job Status" data={distributions.jobStatus} />
              <AdminDonutChart title="Application Status" data={distributions.applicationStatus} />
            </div>
          </div>
        </>
      )}
      </div>
    </AdminLayout>
  )
}


