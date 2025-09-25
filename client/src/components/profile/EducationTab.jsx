import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const DEGREE_TYPES = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate (PhD)',
  'Professional Degree',
  'Certificate',
  'Other'
]

const EducationTab = ({ profileData, onUpdate, isLoading, setIsLoading }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [educations, setEducations] = useState(profileData?.education || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: ''
    }
  })

  const addEducation = (data) => {
    const education = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate && !data.current ? new Date(data.endDate) : null,
      current: data.current || false,
      gpa: data.gpa ? Number(data.gpa) : null
    }
    setEducations([...educations, education])
    reset()
  }

  const removeEducation = (index) => {
    setEducations(educations.filter((_, i) => i !== index))
  }

  const saveChanges = async () => {
    try {
      setIsSaving(true)
      setSaveStatus(null)
      
      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        education: educations
      })
      
      if (response.data?.success) {
        const updatedUser = response.data.data.user
        onUpdate(updatedUser)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    } catch (error) {
      console.error('Failed to update education:', error)
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Education
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add your educational background and academic achievements.
        </p>
      </div>

      {/* Add New Education Form */}
      <form onSubmit={handleSubmit(addEducation)} className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Institution"
            name="institution"
            register={register}
            error={errors.institution}
            required
            placeholder="e.g., Stanford University, MIT"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Degree Type
            </label>
            <select
              {...register('degree')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="">Select degree type</option>
              {DEGREE_TYPES.map(degree => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
            {errors.degree && (
              <p className="mt-1 text-xs text-red-600">{errors.degree.message}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Field of Study"
            name="field"
            register={register}
            error={errors.field}
            placeholder="e.g., Computer Science, Business Administration"
          />
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                {...register('current')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Currently studying
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              GPA (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                {...register('gpa', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'GPA must be positive' },
                  max: { value: 4, message: 'GPA cannot exceed 4.0' }
                })}
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                placeholder="3.75"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">/ 4.0</span>
            </div>
            {errors.gpa && (
              <p className="mt-1 text-xs text-red-600">{errors.gpa.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Additional Information
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            placeholder="Honors, awards, relevant coursework, thesis topic, etc."
          />
        </div>
        
        <Button type="submit">
          Add Education
        </Button>
      </form>

      {/* Education List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Education History
        </h3>
        
        {educations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🎓</div>
            <p>No education entries yet. Add your first education entry above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {educations.map((edu, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {edu.degree}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {edu.institution}
                    </p>
                    {edu.field && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {edu.field}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {edu.startDate && new Date(edu.startDate).toLocaleDateString()} - {' '}
                      {edu.current ? 'Present' : (edu.endDate && new Date(edu.endDate).toLocaleDateString())}
                    </p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        GPA: {edu.gpa}/4.0
                      </p>
                    )}
                    {edu.description && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {edu.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {educations.length} education {educations.length === 1 ? 'entry' : 'entries'}
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

export default EducationTab
