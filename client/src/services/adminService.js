import { api, createRequestConfig } from '@/services/apiClient'

const base = '/admin'

export const adminService = {
  // Dashboard/analytics
  getAnalytics: (params = {}) =>
    api.get(`${base}/analytics`, { params, ...createRequestConfig() }).then(r => r.data),

  getDashboard: (params = {}) =>
    api.get(`${base}/dashboard`, { params, ...createRequestConfig() }).then(r => r.data),

  // Users
  listUsers: (params = {}) =>
    api.get(`${base}/users`, { params, ...createRequestConfig() }).then(r => r.data),

  getUser: (userId) =>
    api.get(`${base}/users/${userId}`, createRequestConfig()).then(r => r.data),

  updateUserStatus: (userId, payload) =>
    api.put(`${base}/users/${userId}/status`, payload, createRequestConfig()).then(r => r.data),

  updateUserRole: (userId, role) =>
    api.put(`${base}/users/${userId}/role`, { role }, createRequestConfig()).then(r => r.data),

  deleteUser: (userId, reason) =>
    api.delete(`${base}/users/${userId}`, { data: { reason }, ...createRequestConfig() }).then(r => r.data),

  // Recruiters
  listRecruiters: (params = {}) =>
    api.get(`${base}/recruiters`, { params, ...createRequestConfig() }).then(r => r.data),

  verifyRecruiter: (recruiterId, payload) =>
    api.put(`${base}/recruiters/${recruiterId}/verify`, payload, createRequestConfig()).then(r => r.data),

  // Jobs moderation
  listJobs: (params = {}) =>
    api.get(`${base}/jobs`, { params, ...createRequestConfig() }).then(r => r.data),

  updateJobStatus: (jobId, payload) =>
    api.put(`${base}/jobs/${jobId}/status`, payload, createRequestConfig()).then(r => r.data),

  // Reports
  getReports: (params = {}) =>
    api.get(`${base}/reports`, { params, ...createRequestConfig() }).then(r => r.data),

  // Bulk operations
  bulkUpdateUserStatus: async (userIds, status) => {
    try {
      const results = await Promise.allSettled(
        userIds.map(id => adminService.updateUserStatus(id, { isActive: status }))
      )
      return results
    } catch (error) {
      console.error('Bulk update user status failed:', error)
      throw error
    }
  },

  bulkDeleteUsers: async (userIds, reason) => {
    try {
      const results = await Promise.allSettled(
        userIds.map(id => adminService.deleteUser(id, reason))
      )
      return results
    } catch (error) {
      console.error('Bulk delete users failed:', error)
      throw error
    }
  },

  bulkUpdateUserRoles: async (userIds, role) => {
    try {
      const results = await Promise.allSettled(
        userIds.map(id => adminService.updateUserRole(id, role))
      )
      return results
    } catch (error) {
      console.error('Bulk update user roles failed:', error)
      throw error
    }
  },

  // Advanced analytics
  getSystemHealth: () =>
    api.get(`${base}/health`, createRequestConfig()).then(r => r.data),

  getAuditLogs: (params = {}) =>
    api.get(`${base}/audit-logs`, { params, ...createRequestConfig() }).then(r => r.data),

  // Settings
  getSystemSettings: () =>
    api.get(`${base}/settings`, createRequestConfig()).then(r => r.data),

  updateSystemSettings: (settings) =>
    api.put(`${base}/settings`, settings, createRequestConfig()).then(r => r.data),

  // Notifications
  sendSystemNotification: (notification) =>
    api.post(`${base}/notifications`, notification, createRequestConfig()).then(r => r.data),

  // Data export
  exportData: async (type, format = 'csv', params = {}) => {
    try {
      const response = await api.get(`${base}/export/${type}`, { 
        params: { ...params, format }, 
        responseType: 'blob',
        ...createRequestConfig() 
      })
      
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`
      link.click()
      window.URL.revokeObjectURL(url)
      
      return response
    } catch (error) {
      console.error('Data export failed:', error)
      throw error
    }
  },
}

export default adminService


