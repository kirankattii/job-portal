import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const SKILL_LEVELS = [
  { value: 'Beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
  { value: 'Intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'Advanced', label: 'Advanced', color: 'bg-green-100 text-green-800' },
  { value: 'Expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' }
]

const SkillsExperienceTab = ({ profileData, onUpdate, isLoading, setIsLoading }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [skills, setSkills] = useState(profileData?.skills || [])
  const [experiences, setExperiences] = useState(profileData?.experience || [])
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
  })

  // Fetch skill suggestions
  const fetchSkillSuggestions = async (query) => {
    if (query.length < 2) {
      setSkillSuggestions([])
      return
    }

    try {
      const response = await apiClient.get(`${API_ENDPOINTS.USER.SKILLS_SUGGESTIONS}?q=${encodeURIComponent(query)}`)
      if (response.data?.success) {
        const suggestions = response.data.data.suggestions.filter(skill => 
          !skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
        )
        setSkillSuggestions(suggestions.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch skill suggestions:', error)
      // Fallback to empty array on error
      setSkillSuggestions([])
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      const skill = {
        name: newSkill.trim(),
        level: newSkillLevel
      }
      setSkills([...skills, skill])
      setNewSkill('')
      setNewSkillLevel('Intermediate')
      setShowSuggestions(false)
    }
  }

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const addExperience = (data) => {
    const experience = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate && !data.current ? new Date(data.endDate) : null,
      current: data.current || false
    }
    setExperiences([...experiences, experience])
    reset()
  }

  const removeExperience = (index) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const saveChanges = async () => {
    try {
      setIsSaving(true)
      setSaveStatus(null)
      
      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        skills,
        experience: experiences
      })
      
      if (response.data?.success) {
        const updatedUser = response.data.data.user
        onUpdate(updatedUser)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    } catch (error) {
      console.error('Failed to update skills and experience:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Skills & Experience
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Showcase your skills and work experience to attract the right opportunities.
        </p>
      </div>

      {/* Skills Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Skills
          </h3>
          
          {/* Add New Skill */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value)
                  fetchSkillSuggestions(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Add a skill (e.g., JavaScript, Python, React)"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
              
              {/* Skill Suggestions */}
              {showSuggestions && skillSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
                  {skillSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setNewSkill(suggestion)
                        setShowSuggestions(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              {SKILL_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            
            <Button
              type="button"
              onClick={addSkill}
              disabled={!newSkill.trim()}
            >
              Add Skill
            </Button>
          </div>

          {/* Skills List */}
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {skill.name}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${SKILL_LEVELS.find(l => l.value === skill.level)?.color || 'bg-gray-100 text-gray-800'}`}>
                  {skill.level}
                </span>
                <button
                  onClick={() => removeSkill(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Work Experience
          </h3>
          
          {/* Add New Experience Form */}
          <form onSubmit={handleSubmit(addExperience)} className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Job Title"
                name="title"
                register={register}
                error={errors.title}
                required
              />
              <InputField
                label="Company"
                name="company"
                register={register}
                error={errors.company}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Location"
                name="location"
                register={register}
                error={errors.location}
              />
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    {...register('current')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Currently working here
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Start Date"
                name="startDate"
                type="date"
                register={register}
                error={errors.startDate}
                required
              />
              <InputField
                label="End Date"
                name="endDate"
                type="date"
                register={register}
                error={errors.endDate}
                disabled={watch('current')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder="Describe your role, responsibilities, and achievements..."
              />
            </div>
            
            <Button type="submit">
              Add Experience
            </Button>
          </form>

          {/* Experience List */}
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {exp.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {exp.startDate && new Date(exp.startDate).toLocaleDateString()} - {' '}
                      {exp.current ? 'Present' : (exp.endDate && new Date(exp.endDate).toLocaleDateString())}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {skills.length} skills • {experiences.length} experiences
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={saveChanges}
            isLoading={isSaving}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          
          {saveStatus && (
            <div className={`text-sm font-medium ${
              saveStatus === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {saveStatus === 'success' ? '✓ Saved' : '✗ Failed'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillsExperienceTab
