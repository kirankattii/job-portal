import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function CommunicationPanel({ application, onUpdate }) {
  const [activeTab, setActiveTab] = useState('messages') // 'messages', 'templates', 'history'
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        type: 'outbound',
        subject: 'Application Received',
        content: 'Thank you for your application. We will review it and get back to you soon.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'sent'
      },
      {
        id: 2,
        type: 'inbound',
        subject: 'Question about the role',
        content: 'Hi, I have a question about the remote work policy for this position.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'read'
      },
      {
        id: 3,
        type: 'outbound',
        subject: 'Interview Invitation',
        content: 'We would like to invite you for an interview. Please let us know your availability.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'sent'
      }
    ]
    setMessages(mockMessages)
  }, [])

  const emailTemplates = [
    {
      id: 'interview_invitation',
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{jobTitle}}',
      content: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}. We were impressed with your application and would like to invite you for an interview.

Interview Details:
- Date: {{interviewDate}}
- Time: {{interviewTime}}
- Type: {{interviewType}}
- Interviewer: {{interviewer}}

Please confirm your availability by replying to this email.

Best regards,
{{recruiterName}}`
    },
    {
      id: 'rejection',
      name: 'Application Rejection',
      subject: 'Application Update - {{jobTitle}}',
      content: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}. After careful consideration, we have decided to move forward with other candidates.

We appreciate the time and effort you put into your application and encourage you to apply for other opportunities that match your skills and experience.

Best regards,
{{recruiterName}}`
    },
    {
      id: 'offer',
      name: 'Job Offer',
      subject: 'Job Offer - {{jobTitle}}',
      content: `Dear {{candidateName}},

We are pleased to offer you the position of {{jobTitle}} at {{companyName}}. We were impressed with your qualifications and believe you would be a great addition to our team.

Offer Details:
- Position: {{jobTitle}}
- Start Date: {{startDate}}
- Salary: {{salary}}
- Benefits: {{benefits}}

Please review the attached offer letter and let us know your decision by {{responseDeadline}}.

Best regards,
{{recruiterName}}`
    },
    {
      id: 'follow_up',
      name: 'Follow-up',
      subject: 'Application Status Update',
      content: `Dear {{candidateName}},

I wanted to follow up on your application for the {{jobTitle}} position. We are still in the review process and will have an update for you soon.

Thank you for your patience.

Best regards,
{{recruiterName}}`
    }
  ]

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      setIsSending(true)
      // In real app, this would send via API
      const message = {
        id: Date.now(),
        type: 'outbound',
        subject: 'New Message',
        content: newMessage,
        timestamp: new Date(),
        status: 'sending'
      }
      
      setMessages(prev => [message, ...prev])
      setNewMessage('')
      
      // Simulate sending
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        )
      }, 1000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
  }

  const handleSendTemplate = async (template, variables) => {
    try {
      setIsSending(true)
      
      // Replace template variables
      let content = template.content
      let subject = template.subject
      
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`
        content = content.replace(new RegExp(placeholder, 'g'), variables[key])
        subject = subject.replace(new RegExp(placeholder, 'g'), variables[key])
      })

      const message = {
        id: Date.now(),
        type: 'outbound',
        subject,
        content,
        timestamp: new Date(),
        status: 'sent'
      }
      
      setMessages(prev => [message, ...prev])
      setShowTemplateModal(false)
      setSelectedTemplate('')
    } catch (error) {
      console.error('Failed to send template:', error)
    } finally {
      setIsSending(false)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 dark:text-green-400'
      case 'delivered':
        return 'text-blue-600 dark:text-blue-400'
      case 'read':
        return 'text-purple-600 dark:text-purple-400'
      case 'sending':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('messages')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'messages'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'templates'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm",
              activeTab === 'history'
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          >
            Communication History
          </button>
        </nav>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {/* New Message Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Send Message
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  To: {application?.user?.email}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No messages yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start a conversation with this candidate
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg p-4 border",
                    message.type === 'outbound'
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ml-8"
                      : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 mr-8"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {message.subject}
                        </h4>
                        <span className={cn(
                          "text-xs font-medium",
                          getStatusColor(message.status)
                        )}>
                          {message.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {message.content}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatTimestamp(message.timestamp)}</span>
                        <span className="capitalize">{message.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {template.content}
                </p>
                <Button
                  onClick={() => handleUseTemplate(template)}
                  size="sm"
                  variant="outline"
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Communication Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {messages.filter(m => m.type === 'outbound').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Messages Sent
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {messages.filter(m => m.status === 'read').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Messages Read
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {messages.filter(m => m.type === 'inbound').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Responses Received
                </div>
              </div>
            </div>
          </div>

          {/* Detailed History */}
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    message.type === 'outbound' ? "bg-blue-500" : "bg-green-500"
                  )} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-xs font-medium",
                    getStatusColor(message.status)
                  )}>
                    {message.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {message.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowTemplateModal(false)} />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Use Template: {selectedTemplate.name}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={selectedTemplate.subject}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      value={selectedTemplate.content}
                      readOnly
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={() => handleSendTemplate(selectedTemplate, {
                    candidateName: `${application?.user?.firstName} ${application?.user?.lastName}`,
                    jobTitle: application?.job?.title || 'Position',
                    companyName: 'Your Company',
                    recruiterName: 'Your Name'
                  })}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Send Email
                </Button>
                <Button
                  onClick={() => setShowTemplateModal(false)}
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
