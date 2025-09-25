import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function SkillsComparison({ application }) {
  const [sortBy, setSortBy] = useState('match') // 'match', 'alphabetical', 'importance'
  const [showMissingOnly, setShowMissingOnly] = useState(false)

  const job = application?.job
  const matchDetails = application?.matchedDetails || {}
  
  // Mock job requirements - in real app, this would come from the job data
  const jobSkills = job?.requiredSkills || [
    'JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git'
  ]
  
  const candidateSkills = matchDetails.matchedSkills || []
  const missingSkills = matchDetails.missingSkills || []
  
  // Create comprehensive skills list
  const allSkills = [...new Set([...jobSkills, ...candidateSkills])]
  
  const getSkillStatus = (skill) => {
    if (candidateSkills.includes(skill)) return 'matched'
    if (missingSkills.includes(skill)) return 'missing'
    return 'not-required'
  }

  const getSkillImportance = (skill) => {
    // Mock importance levels - in real app, this would come from job analysis
    const highImportance = ['JavaScript', 'React', 'Node.js']
    const mediumImportance = ['Python', 'SQL', 'AWS']
    
    if (highImportance.includes(skill)) return 'high'
    if (mediumImportance.includes(skill)) return 'medium'
    return 'low'
  }

  const sortedSkills = allSkills.sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.localeCompare(b)
      case 'importance':
        const importanceOrder = { high: 3, medium: 2, low: 1 }
        return importanceOrder[getSkillImportance(b)] - importanceOrder[getSkillImportance(a)]
      case 'match':
      default:
        const statusOrder = { matched: 3, missing: 2, 'not-required': 1 }
        return statusOrder[getSkillStatus(b)] - statusOrder[getSkillStatus(a)]
    }
  })

  const filteredSkills = showMissingOnly 
    ? sortedSkills.filter(skill => getSkillStatus(skill) === 'missing')
    : sortedSkills

  const getSkillBadgeColor = (skill) => {
    const status = getSkillStatus(skill)
    switch (status) {
      case 'matched':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      case 'missing':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'not-required':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
    }
  }

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'low':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'matched':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'missing':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'not-required':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const matchedCount = candidateSkills.length
  const missingCount = missingSkills.length
  const totalRequired = jobSkills.length
  const matchPercentage = totalRequired > 0 ? Math.round((matchedCount / totalRequired) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Skills Comparison Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {matchedCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Matched Skills
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {missingCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Missing Skills
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalRequired}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Required Skills
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {matchPercentage}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Match Rate
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="match">Match Status</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="importance">Importance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showMissingOnly}
              onChange={(e) => setShowMissingOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show missing skills only
            </span>
          </label>
        </div>
      </div>

      {/* Skills Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Importance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Required
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSkills.map((skill, index) => {
                const status = getSkillStatus(skill)
                const importance = getSkillImportance(skill)
                const isRequired = jobSkills.includes(skill)
                
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {skill}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        getSkillBadgeColor(skill)
                      )}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">
                          {status === 'not-required' ? 'Not Required' : status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-sm font-medium capitalize",
                        getImportanceColor(importance)
                      )}>
                        {importance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {isRequired ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Legend
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Matched - Candidate has this skill</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Missing - Required but not found</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Not Required - Optional skill</span>
          </div>
        </div>
      </div>
    </div>
  )
}
