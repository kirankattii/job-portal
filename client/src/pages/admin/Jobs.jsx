import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { adminService } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ page: 1, limit: 10, status: '', search: '', location: '', sortBy: 'createdAt', sortOrder: 'desc' })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await adminService.listJobs({
        page: query.page,
        limit: query.limit,
        status: query.status || undefined,
        search: query.search || undefined,
        location: query.location || undefined,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      })
      setJobs(res.data.jobs)
      setPagination(res.data.pagination)
    } catch (e) {
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [query.page, query.limit, query.status, query.sortBy, query.sortOrder])

  const toggleStatus = async (job) => {
    const next = job.status === 'open' ? 'closed' : 'open'
    try {
      await adminService.updateJobStatus(job._id, { status: next })
      toast.success(`Job set to ${next}`)
      fetchJobs()
    } catch {
      toast.error('Failed to update job status')
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs Moderation</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="Search title, description, skills" value={query.search} onChange={(e)=> setQuery(q=>({ ...q, search: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter'){ setQuery(q=>({...q, page:1})); fetchJobs() }}} />
          <input className="border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="Location" value={query.location} onChange={(e)=> setQuery(q=>({ ...q, location: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter'){ setQuery(q=>({...q, page:1})); fetchJobs() }}} />
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.status} onChange={(e)=> setQuery(q=>({ ...q, status: e.target.value, page:1 }))}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.sortBy} onChange={(e)=> setQuery(q=>({ ...q, sortBy: e.target.value, page:1 }))}>
            <option value="createdAt">Created</option>
            <option value="applicationsCount">Applications</option>
          </select>
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.sortOrder} onChange={(e)=> setQuery(q=>({ ...q, sortOrder: e.target.value, page:1 }))}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700" onClick={()=>{ setQuery({ page:1, limit:10, status:'', search:'', location:'', sortBy:'createdAt', sortOrder:'desc' }) }}>Reset</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={()=>{ setQuery(q=> ({ ...q, page:1 })); fetchJobs() }}>Search</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{pagination.totalJobs} jobs</div>
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center"><LoadingSpinner /></td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No jobs found</td></tr>
              ) : (
                jobs.map(j => (
                  <tr key={j._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.title}</div>
                      <div className="text-sm text-gray-500 max-w-xl truncate">{j.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{j.recruiter?.firstName} {j.recruiter?.lastName}</div>
                      <div className="text-sm text-gray-500">{j.recruiter?.email}</div>
                    </td>
                    <td className="px-4 py-3">{j.location || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${j.status==='open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{j.status}</span></td>
                    <td className="px-4 py-3">{j.applicationsCount ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={()=> toggleStatus(j)}>{j.status==='open' ? 'Close' : 'Open'}</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">Page {pagination.currentPage} of {pagination.totalPages}</div>
          <div className="flex items-center gap-2">
            <button disabled={query.page<=1} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50" onClick={()=> setQuery(q=> ({ ...q, page: q.page-1 }))}>Prev</button>
            <button disabled={!pagination.hasNextPage} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50" onClick={()=> setQuery(q=> ({ ...q, page: q.page+1 }))}>Next</button>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}


