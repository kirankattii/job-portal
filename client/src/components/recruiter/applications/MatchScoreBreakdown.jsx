import React from 'react'
import { cn } from '@/utils/cn'

export default function MatchScoreBreakdown({ application }) {
  const matchDetails = application?.matchedDetails || {}
  const overallScore = application?.matchScore || 0

  const scoreCategories = [
    {
      key: 'skillsMatch',
      label: 'Skills Match',
      score: matchDetails.skillsMatch || 0,
      description: 'Relevant technical and soft skills',
      color: 'blue'
    },
    {
      key: 'experienceMatch',
      label: 'Experience Match',
      score: matchDetails.experienceMatch || 0,
      description: 'Years of experience alignment',
      color: 'green'
    },
    {
      key: 'locationMatch',
      label: 'Location Match',
      score: matchDetails.locationMatch || 0,
      description: 'Geographic preference alignment',
      color: 'purple'
    },
    {
      key: 'salaryMatch',
      label: 'Salary Match',
      score: matchDetails.salaryMatch || 0,
      description: 'Compensation expectation alignment',
      color: 'orange'
    }
  ]

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    if (score >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getOverallScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getOverallScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20'
    return 'bg-red-100 dark:bg-red-900/20'
  }

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent Match'
    if (score >= 80) return 'Very Good Match'
    if (score >= 70) return 'Good Match'
    if (score >= 60) return 'Fair Match'
    if (score >= 40) return 'Poor Match'
    return 'Very Poor Match'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={cn(
        "rounded-lg p-6 border-2",
        getOverallScoreBg(overallScore),
        overallScore >= 80 ? "border-green-200 dark:border-green-800" :
        overallScore >= 60 ? "border-yellow-200 dark:border-yellow-800" :
        overallScore >= 40 ? "border-orange-200 dark:border-orange-800" :
        "border-red-200 dark:border-red-800"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Match Score
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getScoreLabel(overallScore)}
            </p>
          </div>
          <div className="text-right">
            <div className={cn(
              "text-4xl font-bold",
              getOverallScoreColor(overallScore)
            )}>
              {overallScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              ATS Score
            </div>
          </div>
        </div>
        
        {/* Overall Score Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                getScoreBgColor(overallScore)
              )}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Individual Score Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreCategories.map((category) => (
          <div
            key={category.key}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {category.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                getScoreColor(category.score)
              )}>
                {category.score}%
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  getScoreBgColor(category.score)
                )}
                style={{ width: `${category.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Skills Analysis */}
      {(matchDetails.matchedSkills?.length > 0 || matchDetails.missingSkills?.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Skills Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            {matchDetails.matchedSkills?.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Matched Skills ({matchDetails.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchDetails.matchedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {matchDetails.missingSkills?.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Missing Skills ({matchDetails.missingSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchDetails.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
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

      {/* Notes */}
      {matchDetails.notes && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            ATS Notes
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {matchDetails.notes}
          </p>
        </div>
      )}

      {/* Score Legend */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Score Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">80-100%: Excellent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">60-79%: Good</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">40-59%: Fair</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">0-39%: Poor</span>
          </div>
        </div>
      </div>
    </div>
  )
}
