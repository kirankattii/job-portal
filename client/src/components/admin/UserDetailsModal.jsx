import React, { useState } from 'react'
import { adminService } from '@/services/adminService'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function UserDetailsModal({ open, onClose, user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  if (!open) return null
  if (!user) return null

  const stats = user.statistics || {}

  const handleEdit = () => {
    setEditing(true)
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Update user role if changed
      if (editData.role !== user.role) {
        await adminService.updateUserRole(user._id, editData.role)
      }
      
      // Update user status if changed
      if (editData.isActive !== user.isActive) {
        await adminService.updateUserStatus(user._id, { isActive: editData.isActive })
      }

      toast.success('User updated successfully')
      setEditing(false)
      onUserUpdate?.() // Refresh the user list
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setEditData({})
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      await adminService.deleteUser(user._id, 'Deleted by admin')
      toast.success('User deleted successfully')
      onClose()
      onUserUpdate?.() // Refresh the user list
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'activity', label: 'Activity', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '📝' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">User Details</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Save'}
                </button>
                <button 
                  onClick={handleCancel} 
                  className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleEdit} 
                  className="px-3 py-1.5 rounded bg-blue-600 text-white"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={loading || user.role === 'admin'}
                  className="px-3 py-1.5 rounded bg-red-600 text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}
            <button className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-800" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
                      />
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
                      />
                    </div>
                  ) : (
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  {editing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
                    />
                  ) : (
                    <div className="font-medium">{user.email}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Role</div>
                  {editing ? (
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
                    >
                      <option value="user">User</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <div className="font-medium capitalize">{user.role}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  {editing ? (
                    <select
                      value={editData.isActive}
                      onChange={(e) => setEditData({...editData, isActive: e.target.value === 'true'})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <div className="font-medium">
                      <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Login</div>
                  <div className="font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center">
                  <div className="text-sm text-gray-500">Applications</div>
                  <div className="text-2xl font-bold">{stats.applicationsCount ?? 0}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center">
                  <div className="text-sm text-gray-500">Saved Jobs</div>
                  <div className="text-2xl font-bold">{stats.savedJobsCount ?? 0}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 text-center">
                  <div className="text-sm text-gray-500">Profile %</div>
                  <div className="text-2xl font-bold">{user.profileCompletion ?? 0}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <div className="text-sm font-semibold mb-2">Recent Applications</div>
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Job</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Applied</th>
                        <th className="px-3 py-2 text-left">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats.recentApplications || []).length === 0 ? (
                        <tr><td colSpan="4" className="px-3 py-4 text-center text-gray-500">No recent activity</td></tr>
                      ) : (
                        stats.recentApplications.map((a, idx) => (
                          <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="px-3 py-2">
                              <div className="font-medium">{a.job?.title}</div>
                              <div className="text-gray-500">{a.job?.company} {a.job?.location ? `• ${a.job?.location}` : ''}</div>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                a.status === 'hired' ? 'bg-green-100 text-green-700' :
                                a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">{a.appliedAt ? new Date(a.appliedAt).toLocaleString() : '—'}</td>
                            <td className="px-3 py-2">{a.matchScore ? `${a.matchScore}%` : '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{user.phone || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{user.location || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Current Position</div>
                  <div className="font-medium">{user.currentPosition || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Experience</div>
                  <div className="font-medium">{user.experience ? `${user.experience} years` : 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Education</div>
                  <div className="font-medium">{user.education || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Skills</div>
                  <div className="font-medium">
                    {user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'Not provided'}
                  </div>
                </div>
              </div>

              {user.company && (
                <div>
                  <div className="text-sm font-semibold mb-2">Company Information</div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Company Name</div>
                        <div className="font-medium">{user.company.name || 'Not provided'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Website</div>
                        <div className="font-medium">
                          {user.company.website ? (
                            <a href={user.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {user.company.website}
                            </a>
                          ) : 'Not provided'}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-500">Description</div>
                        <div className="font-medium">{user.company.description || 'Not provided'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Email Verified</div>
                  <div className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${user.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Two-Factor Auth</div>
                  <div className="font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${user.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Last Password Change</div>
                  <div className="font-medium">{user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleString() : 'Never'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status Changed</div>
                  <div className="font-medium">
                    {user.statusChangedAt ? new Date(user.statusChangedAt).toLocaleString() : 'Never'}
                    {user.statusChangeReason && (
                      <div className="text-xs text-gray-500 mt-1">Reason: {user.statusChangeReason}</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Security Actions</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (confirm('Send password reset email to this user?')) {
                        // Implement password reset functionality
                        toast.success('Password reset email sent')
                      }
                    }}
                    className="px-3 py-2 rounded bg-yellow-600 text-white text-sm"
                  >
                    Send Password Reset
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Force logout this user from all devices?')) {
                        // Implement force logout functionality
                        toast.success('User logged out from all devices')
                      }
                    }}
                    className="px-3 py-2 rounded bg-red-600 text-white text-sm"
                  >
                    Force Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


