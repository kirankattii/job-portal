import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { adminService } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminReports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'summary',
    format: 'json',
    startDate: '',
    endDate: '',
    recruiterId: '',
    jobId: ''
  })

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', description: 'Overall platform statistics' },
    { value: 'users', label: 'Users Report', description: 'Detailed user analytics and demographics' },
    { value: 'recruiters', label: 'Recruiters Report', description: 'Recruiter performance and verification status' },
    { value: 'jobs', label: 'Jobs Report', description: 'Job posting analytics and performance' },
    { value: 'applications', label: 'Applications Report', description: 'Application trends and conversion rates' },
    { value: 'performance', label: 'Performance Report', description: 'Top performers and conversion metrics' }
  ]

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = {
        type: filters.type,
        format: filters.format,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.recruiterId && { recruiterId: filters.recruiterId }),
        ...(filters.jobId && { jobId: filters.jobId })
      }
      
      const res = await adminService.getReports(params)
      setReports(res.data)
      toast.success('Report generated successfully')
    } catch (error) {
      toast.error('Failed to generate report')
      console.error('Report generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = (format = 'csv') => {
    if (!reports) return
    
    let content = ''
    let filename = `report_${filters.type}_${new Date().toISOString().split('T')[0]}.${format}`
    
    if (format === 'csv') {
      content = convertToCSV(reports, filters.type)
    } else if (format === 'json') {
      content = JSON.stringify(reports, null, 2)
      filename = filename.replace('.csv', '.json')
    }
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data, type) => {
    const headers = []
    const rows = []
    
    switch (type) {
      case 'summary':
        headers.push('Metric', 'Value')
        if (data.summary) {
          Object.entries(data.summary).forEach(([key, value]) => {
            rows.push([key, value])
          })
        }
        if (data.periodStats) {
          Object.entries(data.periodStats).forEach(([key, value]) => {
            rows.push([`Period ${key}`, value])
          })
        }
        break
        
      case 'users':
        if (data.users && data.users.length > 0) {
          headers.push('Name', 'Email', 'Role', 'Active', 'Created At', 'Last Login')
          data.users.forEach(user => {
            rows.push([
              `${user.firstName} ${user.lastName}`,
              user.email,
              user.role,
              user.isActive ? 'Yes' : 'No',
              new Date(user.createdAt).toLocaleDateString(),
              user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
            ])
          })
        }
        break
        
      case 'recruiters':
        if (data.recruiters && data.recruiters.length > 0) {
          headers.push('Name', 'Email', 'Company', 'Verified', 'Jobs Posted', 'Total Applications', 'Created At')
          data.recruiters.forEach(recruiter => {
            rows.push([
              `${recruiter.firstName} ${recruiter.lastName}`,
              recruiter.email,
              recruiter.company?.name || 'N/A',
              recruiter.isVerified ? 'Yes' : 'No',
              recruiter.statistics?.jobsPosted || 0,
              recruiter.statistics?.totalApplications || 0,
              new Date(recruiter.createdAt).toLocaleDateString()
            ])
          })
        }
        break
        
      case 'jobs':
        if (data.jobs && data.jobs.length > 0) {
          headers.push('Title', 'Recruiter', 'Location', 'Status', 'Applications', 'Created At', 'Salary Range')
          data.jobs.forEach(job => {
            rows.push([
              job.title,
              `${job.recruiter?.firstName} ${job.recruiter?.lastName}`,
              job.location || 'N/A',
              job.status,
              job.applicationsCount || 0,
              new Date(job.createdAt).toLocaleDateString(),
              job.salaryRange ? `${job.salaryRange.min}-${job.salaryRange.max}` : 'N/A'
            ])
          })
        }
        break
        
      case 'applications':
        if (data.applications && data.applications.length > 0) {
          headers.push('Applicant', 'Job Title', 'Status', 'Match Score', 'Applied At', 'Recruiter')
          data.applications.forEach(app => {
            rows.push([
              `${app.user?.firstName} ${app.user?.lastName}`,
              app.job?.title || 'N/A',
              app.status,
              app.matchScore || 'N/A',
              new Date(app.appliedAt).toLocaleDateString(),
              `${app.job?.recruiter?.firstName} ${app.job?.recruiter?.lastName}` || 'N/A'
            ])
          })
        }
        break
        
      case 'performance':
        if (data.topJobs && data.topJobs.length > 0) {
          headers.push('Job Title', 'Recruiter', 'Applications', 'Company')
          data.topJobs.forEach(job => {
            rows.push([
              job.title,
              `${job.recruiter?.firstName} ${job.recruiter?.lastName}`,
              job.applicationCount || 0,
              job.recruiter?.company?.name || 'N/A'
            ])
          })
        }
        break
    }
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const renderReportData = () => {
    if (!reports) return null

    switch (filters.type) {
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.summary && Object.entries(reports.summary).map(([key, value]) => (
                <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                  <p className="text-2xl font-bold text-blue-600">{value}</p>
                </div>
              ))}
            </div>
            {reports.periodStats && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Period Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(reports.periodStats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'users':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Users ({reports.totalCount})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.users?.map(user => (
                    <tr key={user._id}>
                      <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'recruiters':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Recruiters ({reports.totalCount})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Jobs Posted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Applications</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Verified</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.recruiters?.map(recruiter => (
                    <tr key={recruiter._id}>
                      <td className="px-4 py-3">{recruiter.firstName} {recruiter.lastName}</td>
                      <td className="px-4 py-3">{recruiter.company?.name || 'N/A'}</td>
                      <td className="px-4 py-3">{recruiter.statistics?.jobsPosted || 0}</td>
                      <td className="px-4 py-3">{recruiter.statistics?.totalApplications || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${recruiter.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {recruiter.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'jobs':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Jobs ({reports.totalCount})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recruiter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Applications</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.jobs?.map(job => (
                    <tr key={job._id}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{job.description}</div>
                      </td>
                      <td className="px-4 py-3">{job.recruiter?.firstName} {job.recruiter?.lastName}</td>
                      <td className="px-4 py-3">{job.location || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{job.applicationsCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'applications':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Applications ({reports.totalCount})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Applicant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Job Title</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Match Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Applied At</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.applications?.map(application => (
                    <tr key={application._id}>
                      <td className="px-4 py-3">{application.user?.firstName} {application.user?.lastName}</td>
                      <td className="px-4 py-3">{application.job?.title || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          application.status === 'hired' ? 'bg-green-100 text-green-700' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{application.matchScore ? `${application.matchScore}%` : 'N/A'}</td>
                      <td className="px-4 py-3">{new Date(application.appliedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Overall Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Applications</p>
                  <p className="text-2xl font-bold">{reports.totalApplications}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{reports.overallConversionRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Hired Count</p>
                  <p className="text-2xl font-bold">{reports.conversionRates?.find(r => r._id === 'hired')?.count || 0}</p>
                </div>
              </div>
            </div>
            
            {reports.topJobs && reports.topJobs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold">Top Performing Jobs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Job Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recruiter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Applications</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reports.topJobs.map((job, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">{job.title}</td>
                          <td className="px-4 py-3">{job.recruiter?.firstName} {job.recruiter?.lastName}</td>
                          <td className="px-4 py-3">{job.applicationCount}</td>
                          <td className="px-4 py-3">{job.recruiter?.company?.name || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div className="text-center text-gray-500">No data available</div>
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('csv')}
            disabled={!reports}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportReport('json')}
            disabled={!reports}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {reportTypes.find(t => t.value === filters.type)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recruiter ID (Optional)
            </label>
            <input
              type="text"
              value={filters.recruiterId}
              onChange={(e) => setFilters({ ...filters, recruiterId: e.target.value })}
              placeholder="Enter recruiter ID"
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job ID (Optional)
            </label>
            <input
              type="text"
              value={filters.jobId}
              onChange={(e) => setFilters({ ...filters, jobId: e.target.value })}
              placeholder="Enter job ID"
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {reports && (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Report Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Generated:</span>
                <p>{new Date(reports.metadata?.generatedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="capitalize">{reports.metadata?.reportType}</p>
              </div>
              <div>
                <span className="text-gray-500">Period:</span>
                <p>
                  {reports.metadata?.dateRange?.start ? new Date(reports.metadata.dateRange.start).toLocaleDateString() : 'N/A'} - 
                  {reports.metadata?.dateRange?.end ? new Date(reports.metadata.dateRange.end).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Filters:</span>
                <p>
                  {reports.metadata?.filters?.recruiterId ? `Recruiter: ${reports.metadata.filters.recruiterId}` : ''}
                  {reports.metadata?.filters?.jobId ? `Job: ${reports.metadata.filters.jobId}` : ''}
                  {!reports.metadata?.filters?.recruiterId && !reports.metadata?.filters?.jobId ? 'None' : ''}
                </p>
              </div>
            </div>
          </div>

          {renderReportData()}
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
