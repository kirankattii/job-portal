import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function TeamCollaboration({ application, onUpdate }) {
  const [activeTab, setActiveTab] = useState('team') // 'team', 'permissions', 'activity'
  const [teamMembers, setTeamMembers] = useState([])
  const [sharedWith, setSharedWith] = useState([])
  const [activity, setActivity] = useState([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [permissionLevel, setPermissionLevel] = useState('view')

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTeamMembers = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@company.com',
        role: 'Senior Recruiter',
        avatar: 'JS',
        status: 'online'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        role: 'Hiring Manager',
        avatar: 'SJ',
        status: 'away'
      },
      {
        id: 3,
        name: 'Mike Chen',
        email: 'mike@company.com',
        role: 'Team Lead',
        avatar: 'MC',
        status: 'offline'
      },
      {
        id: 4,
        name: 'Emily Davis',
        email: 'emily@company.com',
        role: 'HR Specialist',
        avatar: 'ED',
        status: 'online'
      }
    ]

    const mockSharedWith = [
      {
        id: 1,
        member: mockTeamMembers[0],
        permission: 'edit',
        sharedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        sharedBy: 'You'
      },
      {
        id: 2,
        member: mockTeamMembers[1],
        permission: 'view',
        sharedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        sharedBy: 'John Smith'
      }
    ]

    const mockActivity = [
      {
        id: 1,
        type: 'shared',
        user: mockTeamMembers[0],
        action: 'shared this application with Sarah Johnson',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        details: 'View permission granted'
      },
      {
        id: 2,
        type: 'commented',
        user: mockTeamMembers[1],
        action: 'added a comment',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        details: 'Strong technical background, good communication skills'
      },
      {
        id: 3,
        type: 'evaluated',
        user: mockTeamMembers[0],
        action: 'rated the candidate 4/5 stars',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        details: 'Overall rating: 4.2/5'
      },
      {
        id: 4,
        type: 'status_changed',
        user: mockTeamMembers[2],
        action: 'changed status to "Under Review"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        details: 'Status updated from Applied'
      }
    ]

    setTeamMembers(mockTeamMembers)
    setSharedWith(mockSharedWith)
    setActivity(mockActivity)
  }, [])

  const handleShareApplication = async () => {
    try {
      // In real app, this would make an API call
      const newShares = selectedMembers.map(memberId => {
        const member = teamMembers.find(m => m.id === memberId)
        return {
          id: Date.now() + memberId,
          member,
          permission: permissionLevel,
          sharedAt: new Date(),
          sharedBy: 'You'
        }
      })
      
      setSharedWith(prev => [...prev, ...newShares])
      setShowShareModal(false)
      setSelectedMembers([])
    } catch (error) {
      console.error('Failed to share application:', error)
    }
  }

  const handleRemoveShare = async (shareId) => {
    try {
      setSharedWith(prev => prev.filter(share => share.id !== shareId))
    } catch (error) {
      console.error('Failed to remove share:', error)
    }
  }

  const handleUpdatePermission = async (shareId, newPermission) => {
    try {
      setSharedWith(prev => 
        prev.map(share => 
          share.id === shareId 
            ? { ...share, permission: newPermission }
            : share
        )
      )
    } catch (error) {
      console.error('Failed to update permission:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'shared':
        return '🔗'
      case 'commented':
        return '💬'
      case 'evaluated':
        return '⭐'
      case 'status_changed':
        return '🔄'
      default:
        return '📝'
    }
  }

  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'edit':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      case 'view':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      case 'comment':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('team')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'team'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Team ({sharedWith.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'permissions'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'activity'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Activity ({activity.length})
          </button>
        </nav>
      </div>

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Share Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shared With Team
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Collaborate with your team on this application
              </p>
            </div>
            <Button onClick={() => setShowShareModal(true)}>
              Share Application
            </Button>
          </div>

          {/* Shared Members List */}
          <div className="space-y-4">
            {sharedWith.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Not shared with anyone
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Share this application to start collaborating
                </p>
              </div>
            ) : (
              sharedWith.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {share.member.avatar}
                        </span>
                      </div>
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800",
                        getStatusColor(share.member.status)
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {share.member.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {share.member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      getPermissionColor(share.permission)
                    )}>
                      {share.permission}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(share.sharedAt)}
                    </span>
                    <Button
                      onClick={() => handleRemoveShare(share.id)}
                      variant="outline"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Permission Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">View Only</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• View application details</li>
                  <li>• Read comments and notes</li>
                  <li>• See evaluation scores</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Comment</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• All view permissions</li>
                  <li>• Add comments and notes</li>
                  <li>• Rate and evaluate</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Edit</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• All comment permissions</li>
                  <li>• Update application status</li>
                  <li>• Schedule interviews</li>
                  <li>• Send communications</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Permissions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Permissions
            </h3>
            <div className="space-y-3">
              {sharedWith.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {share.member.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {share.member.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={share.permission}
                      onChange={(e) => handleUpdatePermission(share.id, e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="view">View</option>
                      <option value="comment">Comment</option>
                      <option value="edit">Edit</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No activity yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Activity will appear here as team members interact with this application
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">{getActivityIcon(item.type)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.user.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.action}
                      </span>
                    </div>
                    {item.details && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {item.details}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowShareModal(false)} />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Share Application
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Team Members
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {teamMembers
                        .filter(member => !sharedWith.some(share => share.member.id === member.id))
                        .map((member) => (
                          <label key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers(prev => [...prev, member.id])
                                } else {
                                  setSelectedMembers(prev => prev.filter(id => id !== member.id))
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                            />
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                                  {member.avatar}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {member.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Permission Level
                    </label>
                    <select
                      value={permissionLevel}
                      onChange={(e) => setPermissionLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="view">View Only</option>
                      <option value="comment">Comment</option>
                      <option value="edit">Edit</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleShareApplication}
                  disabled={selectedMembers.length === 0}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Share Application
                </Button>
                <Button
                  onClick={() => setShowShareModal(false)}
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
