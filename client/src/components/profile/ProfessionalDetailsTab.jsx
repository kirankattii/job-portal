import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const ProfessionalDetailsTab = ({ profileData, onUpdate, isLoading, setIsLoading }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      currentPosition: profileData?.currentPosition || '',
      currentCompany: profileData?.currentCompany || '',
      currentSalary: profileData?.currentSalary || '',
      expectedSalary: profileData?.expectedSalary || '',
      experienceYears: profileData?.experienceYears || '',
      currentLocation: profileData?.currentLocation || '',
      preferredLocation: profileData?.preferredLocation || ''
    }
  })

  const onSubmit = async (data) => {
    try {
      setIsSaving(true)
      setSaveStatus(null)
      
      // Convert salary fields to numbers
      const processedData = {
        ...data,
        currentSalary: data.currentSalary ? Number(data.currentSalary) : null,
        expectedSalary: data.expectedSalary ? Number(data.expectedSalary) : null,
        experienceYears: data.experienceYears ? Number(data.experienceYears) : null
      }
      
      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, processedData)
      
      if (response.data?.success) {
        const updatedUser = response.data.data.user
        onUpdate(updatedUser)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    } catch (error) {
      console.error('Failed to update professional details:', error)
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
          Professional Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Share your current professional status and career preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Current Position"
            name="currentPosition"
            register={register}
            error={errors.currentPosition}
            placeholder="e.g., Software Engineer, Marketing Manager"
          />
          <InputField
            label="Current Company"
            name="currentCompany"
            register={register}
            error={errors.currentCompany}
            placeholder="e.g., Google, Microsoft"
          />
        </div>

        {/* Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Years of Experience
            </label>
            <select
              {...register('experienceYears')}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <option value="">Select experience level</option>
              <option value="0">0-1 years (Entry Level)</option>
              <option value="2">2-3 years (Junior)</option>
              <option value="4">4-6 years (Mid-level)</option>
              <option value="7">7-10 years (Senior)</option>
              <option value="11">11-15 years (Lead)</option>
              <option value="16">16+ years (Principal/Executive)</option>
            </select>
          </div>
          <InputField
            label="Current Location"
            name="currentLocation"
            register={register}
            error={errors.currentLocation}
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        {/* Salary Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Salary Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Current Salary (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  {...register('currentSalary', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Salary must be positive' }
                  })}
                  type="number"
                  className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  placeholder="75000"
                />
              </div>
              {errors.currentSalary && (
                <p className="mt-1 text-xs text-red-600">{errors.currentSalary.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Expected Salary (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  {...register('expectedSalary', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Salary must be positive' }
                  })}
                  type="number"
                  className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  placeholder="85000"
                />
              </div>
              {errors.expectedSalary && (
                <p className="mt-1 text-xs text-red-600">{errors.expectedSalary.message}</p>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Salary information helps us show you relevant opportunities. This information is kept private.
          </p>
        </div>

        {/* Preferred Location */}
        <div>
          <InputField
            label="Preferred Work Location"
            name="preferredLocation"
            register={register}
            error={errors.preferredLocation}
            placeholder="e.g., Remote, New York, NY, or Anywhere"
            helpText="Where would you like to work? This helps recruiters find you."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <Button
              type="submit"
              isLoading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`text-sm font-medium ${
              saveStatus === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {saveStatus === 'success' ? '✓ Saved successfully' : '✗ Failed to save'}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default ProfessionalDetailsTab
