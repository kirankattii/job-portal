import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function CandidateDetailsModal({ candidate, onClose, onSaveCandidate, onContactCandidate }) {
  const [isSaving, setIsSaving] = useState(false)
  const [isContacting, setIsContacting] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSaveCandidate(candidate._id)
    } catch (err) {
      console.error('Failed to save candidate:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleContact = async () => {
    if (!message.trim()) return

    try {
      setIsContacting(true)
      await onContactCandidate(candidate._id, message)
      setMessage('')
      setShowContactForm(false)
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsContacting(false)
    }
  }

  const getProfileCompletionColor = (completion) => {
    if (completion >= 80) return 'text-green-600 dark:text-green-400'
    if (completion >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified'
    return `$${salary.toLocaleString()}`
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Candidate Profile
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                      {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {candidate.firstName} {candidate.lastName}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {candidate.currentPosition} at {candidate.currentCompany}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {candidate.currentLocation}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {formatSalary(candidate.expectedSalary)}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {candidate.experienceYears || 0} years experience
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Profile Completion
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Profile Completion</span>
                    <span className={cn(
                      "font-medium",
                      getProfileCompletionColor(candidate.profileCompletion || 0)
                    )}>
                      {candidate.profileCompletion || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${candidate.profileCompletion || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              {candidate.bio && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    About
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {candidate.bio}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Skills ({candidate.skills.length})
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              {candidate.experience && candidate.experience.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Work Experience
                  </h4>
                  <div className="space-y-4">
                    {candidate.experience.map((exp, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {exp.position}
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400">
                              {exp.company}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                            </p>
                          </div>
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {candidate.education && candidate.education.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Education
                  </h4>
                  <div className="space-y-4">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {edu.degree}
                            </h5>
                            <p className="text-gray-600 dark:text-gray-400">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Form */}
              {showContactForm && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Send Message
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write your message to the candidate..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => setShowContactForm(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleContact}
                          disabled={!message.trim() || isContacting}
                          size="sm"
                        >
                          {isContacting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-between">
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? 'Saving...' : 'Save Candidate'}
              </Button>
              <Button
                onClick={() => setShowContactForm(!showContactForm)}
                variant="primary"
              >
                {showContactForm ? 'Hide Contact Form' : 'Contact Candidate'}
              </Button>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
