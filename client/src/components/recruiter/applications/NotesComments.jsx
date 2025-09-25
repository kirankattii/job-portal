import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function NotesComments({ application, onUpdate }) {
  const [notes, setNotes] = useState(application?.matchedDetails?.notes || '')
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('notes') // 'notes', 'comments'

  // Mock comments data - in real app, this would come from API
  useEffect(() => {
    const mockComments = [
      {
        id: 1,
        text: 'Strong technical background, good communication skills during initial screening.',
        author: 'John Smith',
        authorRole: 'Senior Recruiter',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'positive'
      },
      {
        id: 2,
        text: 'Missing some required skills but shows potential. Consider for junior role.',
        author: 'Sarah Johnson',
        authorRole: 'Hiring Manager',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        type: 'neutral'
      },
      {
        id: 3,
        text: 'Excellent cultural fit, would be a great addition to the team.',
        author: 'Mike Chen',
        authorRole: 'Team Lead',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        type: 'positive'
      }
    ]
    setComments(mockComments)
  }, [])

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true)
      await onUpdate(application._id, { notes })
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    const comment = {
      id: Date.now(),
      text: newComment.trim(),
      author: 'Current User', // In real app, get from auth context
      authorRole: 'Recruiter',
      timestamp: new Date(),
      type: 'neutral'
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const getCommentTypeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'negative':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'neutral':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const getCommentTypeIcon = (type) => {
    switch (type) {
      case 'positive':
        return (
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'negative':
        return (
          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'neutral':
      default:
        return (
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
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
            onClick={() => setActiveTab('notes')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'notes'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Private Notes
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'comments'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Team Comments ({comments.length})
          </button>
        </nav>
      </div>

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Private Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={8}
              placeholder="Add your private notes about this candidate..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {notes.length}/1000 characters
              </div>
              <Button
                onClick={handleSaveNotes}
                disabled={isSaving || notes === (application?.matchedDetails?.notes || '')}
                size="sm"
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </Button>
            </div>
          </div>

          {/* Quick Notes Templates */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Notes
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Strong technical skills',
                'Good cultural fit',
                'Needs more experience',
                'Excellent communication',
                'Requires training',
                'Perfect match',
                'Consider for future roles'
              ].map((template) => (
                <button
                  key={template}
                  onClick={() => setNotes(prev => prev + (prev ? '\n' : '') + template)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  + {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {/* Add Comment Form */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Add Team Comment
            </h4>
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts with the team..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Comment type:</span>
                  <select className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="neutral">Neutral</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  size="sm"
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No comments yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Be the first to share your thoughts about this candidate
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "rounded-lg p-4 border",
                    getCommentTypeColor(comment.type)
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getCommentTypeIcon(comment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.author}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.authorRole}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-300">Private Notes:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-400">
              {notes.length > 0 ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-300">Team Comments:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-400">
              {comments.length}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800 dark:text-blue-300">Last Updated:</span>
            <span className="ml-2 text-blue-700 dark:text-blue-400">
              {comments.length > 0 ? formatTimestamp(comments[0].timestamp) : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
