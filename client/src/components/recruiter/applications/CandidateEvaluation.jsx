import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function CandidateEvaluation({ application, onUpdate }) {
  const [evaluation, setEvaluation] = useState({
    overallRating: 0,
    technicalSkills: 0,
    communication: 0,
    culturalFit: 0,
    experience: 0,
    potential: 0,
    notes: '',
    recommendation: 'pending', // 'hire', 'no-hire', 'maybe', 'pending'
    interviewScheduled: false,
    interviewDate: '',
    interviewTime: '',
    interviewType: 'phone', // 'phone', 'video', 'in-person'
    interviewer: '',
    status: application?.status || 'applied'
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)

  useEffect(() => {
    // Load existing evaluation data if available
    const existingEvaluation = application?.evaluation || {}
    setEvaluation(prev => ({ ...prev, ...existingEvaluation }))
  }, [application])

  const handleRatingChange = (category, rating) => {
    setEvaluation(prev => ({ ...prev, [category]: rating }))
  }

  const handleInputChange = (field, value) => {
    setEvaluation(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveEvaluation = async () => {
    try {
      setIsSaving(true)
      await onUpdate(application._id, { 
        evaluation,
        status: evaluation.status 
      })
    } catch (error) {
      console.error('Failed to save evaluation:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleScheduleInterview = () => {
    setShowInterviewModal(true)
  }

  const handleConfirmInterview = () => {
    setEvaluation(prev => ({
      ...prev,
      interviewScheduled: true,
      status: 'reviewing'
    }))
    setShowInterviewModal(false)
  }

  const StarRating = ({ rating, onRatingChange, disabled = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !disabled && onRatingChange(star)}
            disabled={disabled}
            className={cn(
              "w-6 h-6 transition-colors",
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600",
              !disabled && "hover:text-yellow-400 cursor-pointer"
            )}
          >
            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    )
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'hire':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      case 'no-hire':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'maybe':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'pending':
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
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
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const evaluationCategories = [
    {
      key: 'technicalSkills',
      label: 'Technical Skills',
      description: 'Relevant technical abilities and knowledge'
    },
    {
      key: 'communication',
      label: 'Communication',
      description: 'Verbal and written communication skills'
    },
    {
      key: 'culturalFit',
      label: 'Cultural Fit',
      description: 'Alignment with company values and culture'
    },
    {
      key: 'experience',
      label: 'Experience',
      description: 'Relevant work experience and achievements'
    },
    {
      key: 'potential',
      label: 'Growth Potential',
      description: 'Ability to learn and grow in the role'
    }
  ]

  const averageRating = evaluationCategories.reduce((sum, cat) => sum + evaluation[cat.key], 0) / evaluationCategories.length

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Rating
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {averageRating > 0 ? `${averageRating.toFixed(1)}/5.0` : 'Not rated yet'}
            </p>
          </div>
          <div className="text-right">
            <StarRating
              rating={evaluation.overallRating}
              onRatingChange={(rating) => handleRatingChange('overallRating', rating)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Overall assessment
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Ratings */}
      <div className="space-y-4">
        {evaluationCategories.map((category) => (
          <div
            key={category.key}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {category.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <StarRating
                  rating={evaluation[category.key]}
                  onRatingChange={(rating) => handleRatingChange(category.key, rating)}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                  {evaluation[category.key]}/5
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recommendation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'hire', label: 'Hire', icon: '✅' },
            { value: 'maybe', label: 'Maybe', icon: '🤔' },
            { value: 'no-hire', label: 'No Hire', icon: '❌' },
            { value: 'pending', label: 'Pending', icon: '⏳' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleInputChange('recommendation', option.value)}
              className={cn(
                "flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-colors",
                evaluation.recommendation === option.value
                  ? getRecommendationColor(option.value)
                  : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <span>{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status and Interview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Application Status
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Status
              </label>
              <select
                value={evaluation.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="applied">Applied</option>
                <option value="reviewing">Under Review</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                getStatusColor(evaluation.status)
              )}>
                {evaluation.status}
              </span>
            </div>
          </div>
        </div>

        {/* Interview Scheduling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Interview Scheduling
          </h3>
          <div className="space-y-4">
            {evaluation.interviewScheduled ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Interview Scheduled
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Date:</strong> {evaluation.interviewDate}</p>
                  <p><strong>Time:</strong> {evaluation.interviewTime}</p>
                  <p><strong>Type:</strong> {evaluation.interviewType}</p>
                  {evaluation.interviewer && (
                    <p><strong>Interviewer:</strong> {evaluation.interviewer}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No interview scheduled
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Schedule an interview to proceed
                </p>
                <Button
                  onClick={handleScheduleInterview}
                  className="mt-3"
                  size="sm"
                >
                  Schedule Interview
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Evaluation Notes
        </h3>
        <textarea
          value={evaluation.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          placeholder="Add detailed notes about your evaluation..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveEvaluation}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? 'Saving...' : 'Save Evaluation'}
        </Button>
      </div>

      {/* Interview Scheduling Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowInterviewModal(false)} />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Schedule Interview
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={evaluation.interviewDate}
                      onChange={(e) => handleInputChange('interviewDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={evaluation.interviewTime}
                      onChange={(e) => handleInputChange('interviewTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={evaluation.interviewType}
                      onChange={(e) => handleInputChange('interviewType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="phone">Phone</option>
                      <option value="video">Video Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interviewer
                    </label>
                    <input
                      type="text"
                      value={evaluation.interviewer}
                      onChange={(e) => handleInputChange('interviewer', e.target.value)}
                      placeholder="Enter interviewer name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleConfirmInterview}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Schedule Interview
                </Button>
                <Button
                  onClick={() => setShowInterviewModal(false)}
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
