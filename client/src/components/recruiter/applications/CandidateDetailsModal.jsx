import React from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function CandidateDetailsModal({ application, onClose }) {
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {application.user?.firstName} {application.user?.lastName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Complete Candidate Profile
                </p>
              </div>
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
          <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Personal Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Profile Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{application.user?.email || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{application.user?.phone || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                      <p className="text-gray-900 dark:text-white">{application.user?.currentLocation || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                      <p className="text-gray-900 dark:text-white">
                        {application.user?.experienceYears ? `${application.user.experienceYears} years` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Position</label>
                      <p className="text-gray-900 dark:text-white">{application.user?.currentPosition || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Company</label>
                      <p className="text-gray-900 dark:text-white">{application.user?.currentCompany || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Application Status
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(application.status)
                      )}>
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ATS Score</span>
                      <span className={cn(
                        "text-sm font-medium",
                        getMatchScoreColor(application.matchScore)
                      )}>
                        {application.matchScore || 0}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Applied Date</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(application.appliedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resume Download */}
                {application.resumeUrl && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Resume
                    </h4>
                    <Button
                      onClick={() => window.open(application.resumeUrl, '_blank')}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download Resume</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column - Detailed Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                {application.user?.bio && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      About
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {application.user.bio}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {application.user?.skills && application.user.skills.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Skills ({application.user.skills.length})
                    </h4>
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
                )}

                {/* Work Experience */}
                {application.user?.experience && application.user.experience.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Work Experience ({application.user.experience.length})
                    </h4>
                    <div className="space-y-4">
                      {application.user.experience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-green-200 dark:border-green-800 pl-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {exp.title}
                          </div>
                          {exp.company && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {exp.company} {exp.location && `• ${exp.location}`}
                            </div>
                          )}
                          {exp.startDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                            </div>
                          )}
                          {exp.description && (
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {application.user?.education && application.user.education.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Education ({application.user.education.length})
                    </h4>
                    <div className="space-y-4">
                      {application.user.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {edu.degree} {edu.field && `in ${edu.field}`}
                          </div>
                          {edu.institution && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {edu.institution}
                            </div>
                          )}
                          {edu.startDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                            </div>
                          )}
                          {edu.description && (
                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                              {edu.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Cover Letter
                    </h4>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {application.coverLetter}
                    </div>
                  </div>
                )}

                {/* Match Analysis */}
                {application.matchedDetails && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Match Analysis
                    </h4>
                    
                    {/* Match Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

                    {/* Skills Match Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.matchedDetails.matchedSkills && application.matchedDetails.matchedSkills.length > 0 && (
                        <div>
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

                      {application.matchedDetails.missingSkills && application.matchedDetails.missingSkills.length > 0 && (
                        <div>
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end">
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
