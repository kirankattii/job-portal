import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { adminService } from '@/services/adminService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import UserDetailsModal from '@/components/admin/UserDetailsModal'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 })
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState({ page: 1, limit: 10, role: '', isActive: '', search: '' })
  const [selected, setSelected] = useState(new Set())
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsUser, setDetailsUser] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminService.listUsers({
        page: query.page,
        limit: query.limit,
        role: query.role || undefined,
        isActive: query.isActive !== '' ? query.isActive : undefined,
        search: query.search || undefined,
      })
      setUsers(res.data.users)
      setPagination(res.data.pagination)
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [query.page, query.limit, query.role, query.isActive])

  const toggleSelectAll = (checked) => {
    if (checked) setSelected(new Set(users.map(u => u._id)))
    else setSelected(new Set())
  }

  const toggleSelect = (id) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const bulkDeactivate = async () => {
    if (selected.size === 0) return
    try {
      await Promise.all(Array.from(selected).map(id => adminService.updateUserStatus(id, { isActive: false })))
      toast.success('Selected users deactivated')
      setSelected(new Set())
      fetchUsers()
    } catch {
      toast.error('Bulk operation failed')
    }
  }

  const bulkActivate = async () => {
    if (selected.size === 0) return
    try {
      await Promise.all(Array.from(selected).map(id => adminService.updateUserStatus(id, { isActive: true })))
      toast.success('Selected users activated')
      setSelected(new Set())
      fetchUsers()
    } catch {
      toast.error('Bulk operation failed')
    }
  }

  const bulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm('Delete selected users? This cannot be undone.')) return
    try {
      await Promise.all(Array.from(selected).map(id => adminService.deleteUser(id)))
      toast.success('Selected users deleted')
      setSelected(new Set())
      fetchUsers()
    } catch {
      toast.error('Bulk deletion failed')
    }
  }

  const exportCsv = () => {
    const header = ['Name','Email','Role','Active']
    const rows = users.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.role,
      u.isActive ? 'true' : 'false'
    ])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="border rounded px-3 py-2 bg-white dark:bg-gray-900" placeholder="Search name or email" value={query.search} onChange={(e)=> setQuery(q=>({ ...q, search: e.target.value }))} onKeyDown={(e)=>{ if(e.key==='Enter'){ setQuery(q=>({...q, page:1})); fetchUsers() }}} />
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.role} onChange={(e)=> setQuery(q=>({ ...q, role: e.target.value, page:1 }))}>
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
          <select className="border rounded px-3 py-2 bg-white dark:bg-gray-900" value={query.isActive} onChange={(e)=> setQuery(q=>({ ...q, isActive: e.target.value, page:1 }))}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700" onClick={()=>{ setQuery({ page:1, limit:10, role:'', isActive:'', search:'' }); setSelected(new Set()); }}>Reset</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={()=>{ setQuery(q=> ({ ...q, page:1 })); fetchUsers() }}>Search</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">{pagination.totalUsers} users</div>
          <div className="flex gap-2">
            <button disabled={selected.size===0} className="px-3 py-2 rounded bg-green-600/10 text-green-700 disabled:opacity-50" onClick={bulkActivate}>Bulk Activate</button>
            <button disabled={selected.size===0} className="px-3 py-2 rounded bg-yellow-600/10 text-yellow-700 disabled:opacity-50" onClick={bulkDeactivate}>Bulk Deactivate</button>
            <button disabled={selected.size===0} className="px-3 py-2 rounded bg-red-600/10 text-red-700 disabled:opacity-50" onClick={bulkDelete}>Bulk Delete</button>
            <button className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700" onClick={exportCsv}>Export CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"><input type="checkbox" onChange={(e)=> toggleSelectAll(e.target.checked)} checked={selected.size>0 && selected.size===users.length} /></th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="py-10 text-center"><LoadingSpinner /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.has(u._id)} onChange={()=> toggleSelect(u._id)} /></td>
                    <td className="px-4 py-3">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700" onClick={async ()=>{ const details = await adminService.getUser(u._id); setDetailsUser(details.data); setDetailsOpen(true) }}>Details</button>
                        <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={async ()=>{ await adminService.updateUserStatus(u._id, { isActive: !u.isActive }); toast.success('Status updated'); fetchUsers() }}>Toggle Status</button>
                        <button className="px-3 py-1.5 rounded bg-purple-600 text-white" onClick={async ()=>{ const next = u.role==='user' ? 'recruiter' : 'user'; await adminService.updateUserRole(u._id, next); toast.success('Role updated'); fetchUsers() }}>Toggle Role</button>
                        <button className="px-3 py-1.5 rounded bg-red-600 text-white" onClick={async ()=>{ if (confirm('Delete user?')) { await adminService.deleteUser(u._id); toast.success('User deleted'); fetchUsers() } }}>Delete</button>
                      </div>
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
      <UserDetailsModal open={detailsOpen} onClose={()=> setDetailsOpen(false)} user={detailsUser} onUserUpdate={fetchUsers} />
      </div>
    </AdminLayout>
  )
}


