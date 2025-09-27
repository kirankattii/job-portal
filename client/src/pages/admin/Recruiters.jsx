import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { adminService } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecruiters: 0 })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ page: 1, limit: 10, verified: '', search: '', sortBy: 'createdAt', sortOrder: 'desc' })

  const fetchRecruiters = async () => {
    setLoading(true)
    try {
      const res = await adminService.listRecruiters({
        page: query.page,
        limit: query.limit,
        verified: query.verified !== '' ? query.verified : undefined,
        search: query.search || undefined,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      })
      setRecruiters(res.data.recruiters)
      setPagination(res.data.pagination)
    } catch (error) {
      console.error('Failed to load recruiters:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load recruiters'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecruiters() }, [query.page, query.limit, query.verified, query.sortBy, query.sortOrder])

  const toggleVerify = async (rec) => {
    try {
      await adminService.verifyRecruiter(rec._id, { verified: !rec.isVerified })
      toast.success(`Recruiter ${!rec.isVerified ? 'verified' : 'unverified'}`)
      fetchRecruiters()
    } catch (error) {
      console.error('Failed to update verification:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update verification'
      toast.error(errorMessage)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recruiters</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="Search name, email, company" value={query.search} onChange={(e)=> setQuery(q=>({ ...q, search: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter'){ setQuery(q=>({...q, page:1})); fetchRecruiters() }}} />
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.verified} onChange={(e)=> setQuery(q=>({ ...q, verified: e.target.value, page:1 }))}>
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.sortBy} onChange={(e)=> setQuery(q=>({ ...q, sortBy: e.target.value, page:1 }))}>
            <option value="createdAt">Created</option>
            <option value="lastLogin">Last Login</option>
          </select>
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.sortOrder} onChange={(e)=> setQuery(q=>({ ...q, sortOrder: e.target.value, page:1 }))}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700" onClick={()=>{ setQuery({ page:1, limit:10, verified:'', search:'', sortBy:'createdAt', sortOrder:'desc' }) }}>Reset</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={()=>{ setQuery(q=> ({ ...q, page:1 })); fetchRecruiters() }}>Search</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{pagination.totalRecruiters} recruiters</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Recruiter</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Jobs</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Applications</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Verified</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center"><LoadingSpinner /></td></tr>
              ) : recruiters.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No recruiters found</td></tr>
              ) : (
                recruiters.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.firstName} {r.lastName}</div>
                      <div className="text-sm text-gray-500">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.company?.name || '—'}</div>
                      <div className="text-sm text-blue-600">{r.company?.website}</div>
                    </td>
                    <td className="px-4 py-3">{r.statistics?.jobsPosted ?? 0}</td>
                    <td className="px-4 py-3">{r.statistics?.totalApplications ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${r.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{r.isVerified ? 'Verified' : 'Unverified'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={()=> toggleVerify(r)}>{r.isVerified ? 'Unverify' : 'Verify'}</button>
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


