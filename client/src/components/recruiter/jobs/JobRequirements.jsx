import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import { recruiterService } from '@/services/recruiterService'
import { cn } from '@/utils/cn'

const SkillsAutocomplete = ({ skills, onSkillsChange, error }) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    try {
      setIsLoading(true)
      const response = await recruiterService.getSkillsSuggestions(query)
      setSuggestions(response.data || [])
    } catch (err) {
      console.error('Failed to fetch skill suggestions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(inputValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setShowSuggestions(true)
  }

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      onSkillsChange([...skills, skill])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeSkill = (skillToRemove) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addSkill(inputValue.trim())
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type a skill and press Enter..."
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
            error ? "border-red-500" : ""
          )}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading suggestions...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {suggestion}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

const SalaryRangeInput = ({ value, onChange, error }) => {
  const handleMinChange = (e) => {
    const min = parseInt(e.target.value) || 0
    onChange({ ...value, min })
  }

  const handleMaxChange = (e) => {
    const max = parseInt(e.target.value) || 0
    onChange({ ...value, max })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Minimum Salary
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={value.min || ''}
              onChange={handleMinChange}
              placeholder="50000"
              className={cn(
                "w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                error ? "border-red-500" : ""
              )}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Maximum Salary
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              value={value.max || ''}
              onChange={handleMaxChange}
              placeholder="80000"
              className={cn(
                "w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                error ? "border-red-500" : ""
              )}
            />
          </div>
        </div>
      </div>
      
      {value.min && value.max && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Range: ${value.min.toLocaleString()} - ${value.max.toLocaleString()}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

export default function JobRequirements({ data, updateData, onNext, onPrev }) {
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (data.requiredSkills.length === 0) {
      newErrors.requiredSkills = 'At least one skill is required'
    }
    
    if (!data.experienceMin && data.experienceMin !== 0) {
      newErrors.experienceMin = 'Minimum experience is required'
    }
    
    if (!data.experienceMax && data.experienceMax !== 0) {
      newErrors.experienceMax = 'Maximum experience is required'
    }
    
    if (data.experienceMin > data.experienceMax) {
      newErrors.experienceMax = 'Maximum experience must be greater than minimum'
    }
    
    if (!data.salaryRange.min && data.salaryRange.min !== 0) {
      newErrors.salaryRange = 'Salary range is required'
    }
    
    if (data.salaryRange.min > data.salaryRange.max) {
      newErrors.salaryRange = 'Maximum salary must be greater than minimum'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleInputChange = (field, value) => {
    updateData({ [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Job Requirements
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define the skills, experience, and salary requirements for this position.
        </p>
      </div>

      <div className="space-y-6">
        {/* Required Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Required Skills <span className="text-red-500">*</span>
          </label>
          <SkillsAutocomplete
            skills={data.requiredSkills}
            onSkillsChange={(skills) => handleInputChange('requiredSkills', skills)}
            error={errors.requiredSkills}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add skills that are essential for this role. Start typing to see suggestions.
          </p>
        </div>

        {/* Experience Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Experience Required <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Minimum (years)
              </label>
              <input
                type="number"
                min="0"
                value={data.experienceMin || ''}
                onChange={(e) => handleInputChange('experienceMin', parseInt(e.target.value) || 0)}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                  errors.experienceMin ? "border-red-500" : ""
                )}
              />
              {errors.experienceMin && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.experienceMin}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Maximum (years)
              </label>
              <input
                type="number"
                min="0"
                value={data.experienceMax || ''}
                onChange={(e) => handleInputChange('experienceMax', parseInt(e.target.value) || 0)}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                  errors.experienceMax ? "border-red-500" : ""
                )}
              />
              {errors.experienceMax && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.experienceMax}</p>
              )}
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salary Range <span className="text-red-500">*</span>
          </label>
          <SalaryRangeInput
            value={data.salaryRange}
            onChange={(value) => handleInputChange('salaryRange', value)}
            error={errors.salaryRange}
          />
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Education Level
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD', 'No Requirement'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleInputChange('educationLevel', level.toLowerCase())}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg border transition-colors",
                  data.educationLevel === level.toLowerCase()
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Requirements
          </label>
          <textarea
            value={data.additionalRequirements || ''}
            onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
            placeholder="Any other requirements, certifications, or qualifications needed..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <Button
          onClick={onPrev}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={data.requiredSkills.length === 0}
          className="px-8"
        >
          Next: Preview
        </Button>
      </div>
    </div>
  )
}
