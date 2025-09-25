import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  MapPin, 
  Briefcase, 
  DollarSign,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import Button from '@/components/ui/Button'

const MatchScoreVisualization = ({ 
  matchScore = 0, 
  matchedDetails = {}, 
  jobDetails = {},
  userProfile = {},
  showSuggestions = true,
  compact = false 
}) => {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)

  const {
    skillsMatch = 0,
    experienceMatch = 0,
    locationMatch = 0,
    salaryMatch = 0,
    matchedSkills = [],
    missingSkills = [],
    notes = ''
  } = matchedDetails

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  }

  const getScoreIcon = (score) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4" />
    if (score >= 60) return <Minus className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const getImprovementSuggestions = () => {
    const suggestions = []

    if (skillsMatch < 70) {
      suggestions.push({
        type: 'skill',
        title: 'Improve Skills Match',
        description: 'Consider learning the missing skills to increase your compatibility',
        skills: missingSkills.slice(0, 3),
        impact: Math.min(20, missingSkills.length * 5)
      })
    }

    if (experienceMatch < 60) {
      suggestions.push({
        type: 'experience',
        title: 'Gain Relevant Experience',
        description: 'Look for opportunities to gain experience in required technologies',
        impact: 15
      })
    }

    if (locationMatch < 80 && jobDetails.location !== 'Remote') {
      suggestions.push({
        type: 'location',
        title: 'Consider Location Flexibility',
        description: 'Remote work or relocation might improve your chances',
        impact: 10
      })
    }

    return suggestions
  }

  const suggestions = getImprovementSuggestions()

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`flex items-center px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(matchScore)}`}>
          {getScoreIcon(matchScore)}
          <span className="ml-1">{matchScore}%</span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getScoreText(matchScore)} Match
        </span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Job Match Analysis
          </h3>
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(matchScore)}`}>
          {getScoreIcon(matchScore)}
          <span className="ml-1">{matchScore}% Overall Match</span>
        </div>
      </div>

      {/* Overall Score Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Compatibility</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{matchScore}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              matchScore >= 80 ? 'bg-green-500' : 
              matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${matchScore}%` }}
          ></div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Skills Match */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills Match</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{skillsMatch}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${skillsMatch}%` }}
            ></div>
          </div>
          {matchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {matchedSkills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded">
                  {skill}
                </span>
              ))}
              {matchedSkills.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded">
                  +{matchedSkills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Experience Match */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience Match</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{experienceMatch}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${experienceMatch}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {userProfile.experienceYears ? `${userProfile.experienceYears} years experience` : 'Experience not specified'}
          </div>
        </div>

        {/* Location Match */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location Match</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{locationMatch}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${locationMatch}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {jobDetails.location === 'Remote' ? 'Remote position' : `Location: ${jobDetails.location}`}
          </div>
        </div>

        {/* Salary Match */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary Match</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{salaryMatch}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${salaryMatch}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {jobDetails.salary || 'Salary not specified'}
          </div>
        </div>
      </div>

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <XCircle className="w-4 h-4 text-red-600 mr-2" />
            Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-sm rounded-full border border-red-200 dark:border-red-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Analysis Notes</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">{notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
        >
          {showDetailedBreakdown ? 'Hide' : 'Show'} Detailed Breakdown
        </Button>
        
        {showSuggestions && suggestions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSuggestionsModal(true)}
            className="flex items-center"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Improvement Tips
          </Button>
        )}
      </div>

      {/* Detailed Breakdown Modal */}
      {showDetailedBreakdown && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Detailed Analysis</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Skills Compatibility:</span>
              <span className="font-medium">{skillsMatch}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Experience Alignment:</span>
              <span className="font-medium">{experienceMatch}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Location Fit:</span>
              <span className="font-medium">{locationMatch}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Salary Expectation:</span>
              <span className="font-medium">{salaryMatch}%</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Weighted Average:</span>
                <span className="font-semibold">{matchScore}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Improvement Suggestions Modal */}
      {showSuggestionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Improvement Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestionsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {suggestion.title}
                      </h4>
                      <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                        +{suggestion.impact}% potential
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {suggestion.description}
                    </p>
                    {suggestion.skills && suggestion.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {suggestion.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSuggestionsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchScoreVisualization
