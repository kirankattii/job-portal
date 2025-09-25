import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const PersonalInfoTab = ({ profileData, onUpdate, isLoading, setIsLoading }) => {
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
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      bio: profileData?.bio || '',
      location: {
        city: profileData?.location?.city || '',
        state: profileData?.location?.state || '',
        country: profileData?.location?.country || '',
        zipCode: profileData?.location?.zipCode || ''
      }
    }
  })

  const onSubmit = async (data) => {
    try {
      setIsSaving(true)
      setSaveStatus(null)
      
      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data)
      
      if (response.data?.success) {
        const updatedUser = response.data.data.user
        onUpdate(updatedUser)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
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
          Personal Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Update your personal details and contact information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            name="firstName"
            register={register}
            error={errors.firstName}
            required
          />
          <InputField
            label="Last Name"
            name="lastName"
            register={register}
            error={errors.lastName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Email Address"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            required
          />
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            register={register}
            error={errors.phone}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Bio
          </label>
          <textarea
            {...register('bio')}
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            placeholder="Tell us about yourself, your interests, and what makes you unique..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Maximum 500 characters
          </p>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="City"
              name="location.city"
              register={register}
              error={errors.location?.city}
            />
            <InputField
              label="State/Province"
              name="location.state"
              register={register}
              error={errors.location?.state}
            />
            <InputField
              label="Country"
              name="location.country"
              register={register}
              error={errors.location?.country}
            />
            <InputField
              label="ZIP/Postal Code"
              name="location.zipCode"
              register={register}
              error={errors.location?.zipCode}
            />
          </div>
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

export default PersonalInfoTab
