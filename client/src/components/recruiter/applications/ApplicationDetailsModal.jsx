import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function ApplicationDetailsModal({ application, onClose, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(application.status)
  const [notes, setNotes] = useState(application.matchedDetails?.notes || '')

  const handleUpdate = async () => {
    try {
      setIsUpdating(true)
      await onUpdate(application._id, { status, notes })
      onClose()
    } catch (err) {
      console.error('Failed to update application:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      case 'reviewing':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'hired':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
    }
  }

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                Application Details
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
              {/* Candidate Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {application.user?.firstName} {application.user?.lastName}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{application.user?.email}</p>
                    
                    {/* Candidate Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                      {application.user?.currentPosition && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{application.user.currentPosition}</span>
                            {application.user.currentCompany && <span> at {application.user.currentCompany}</span>}
                          </span>
                        </div>
                      )}
                      {application.user?.experienceYears !== undefined && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">{application.user.experienceYears} years experience</span>
                        </div>
                      )}
                      {application.user?.currentLocation && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">{application.user.currentLocation}</span>
                        </div>
                      )}
                      {application.user?.phone && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-gray-600 dark:text-gray-400">{application.user.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mt-3">
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(application.status)
                      )}>
                        {application.status}
                      </span>
                      {application.matchScore && (
                        <span className={cn(
                          "text-sm font-medium",
                          getMatchScoreColor(application.matchScore)
                        )}>
                          {application.matchScore}% ATS Score
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 ml-4">
                    <p>Applied on</p>
                    <p>{formatDate(application.appliedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Job Application
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {application.job?.title}
                  </h5>
                  <p className="text-gray-600 dark:text-gray-400">
                    {application.job?.location}
                  </p>
                </div>
              </div>

              {/* Cover Letter */}
              {application.coverLetter && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Cover Letter
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {application.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {application.user?.skills && application.user.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Candidate Skills
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {application.user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                        >
                          {skill.name} {skill.level && `(${skill.level})`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              {application.user?.education && application.user.education.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Education
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="space-y-3">
                      {application.user.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {edu.degree} {edu.field && `in ${edu.field}`}
                          </div>
                          {edu.institution && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {edu.institution}
                            </div>
                          )}
                          {edu.startDate && edu.endDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                            </div>
                          )}
                          {edu.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {edu.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              {application.user?.experience && application.user.experience.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Work Experience
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="space-y-3">
                      {application.user.experience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {exp.title}
                          </div>
                          {exp.company && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {exp.company} {exp.location && `• ${exp.location}`}
                            </div>
                          )}
                          {exp.startDate && exp.endDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                            </div>
                          )}
                          {exp.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Match Details */}
              {application.matchedDetails && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Match Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Skills Match */}
                    {application.matchedDetails.matchedSkills && application.matchedDetails.matchedSkills.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          Matched Skills ({application.matchedDetails.matchedSkills.length})
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {application.matchedDetails.matchedSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {application.matchedDetails.missingSkills && application.matchedDetails.missingSkills.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          Missing Skills ({application.matchedDetails.missingSkills.length})
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {application.matchedDetails.missingSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Match Scores */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {application.matchedDetails.skillsMatch || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {application.matchedDetails.experienceMatch || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {application.matchedDetails.locationMatch || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Location</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {application.matchedDetails.salaryMatch || 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Salary</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Update Status
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="applied">Applied</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add notes about this application..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-between items-center">
            <div className="flex space-x-3">
              {/* Download Resume */}
              {application.resumeUrl && (
                <Button
                  onClick={() => window.open(application.resumeUrl, '_blank')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Resume</span>
                </Button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Application'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
