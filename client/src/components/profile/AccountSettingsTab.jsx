import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const AccountSettingsTab = ({ profileData, onUpdate, isLoading, setIsLoading }) => {
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
      preferences: {
        emailNotifications: profileData?.preferences?.emailNotifications ?? true,
        jobAlerts: profileData?.preferences?.jobAlerts ?? true,
        profileVisibility: profileData?.preferences?.profileVisibility || 'public'
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
      console.error('Failed to update settings:', error)
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
          Account Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your notification preferences and profile visibility.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Notification Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive email updates about your applications and job matches
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  {...register('preferences.emailNotifications')}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Job Alerts
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified about new job opportunities that match your profile
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  {...register('preferences.jobAlerts')}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Visibility Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Profile Visibility
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Who can see your profile?
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: 'public',
                    title: 'Public',
                    description: 'Anyone can view your profile',
                    icon: '🌐'
                  },
                  {
                    value: 'recruiters-only',
                    title: 'Recruiters Only',
                    description: 'Only verified recruiters can view your profile',
                    icon: '👔'
                  },
                  {
                    value: 'private',
                    title: 'Private',
                    description: 'Only you can view your profile',
                    icon: '🔒'
                  }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      {...register('preferences.profileVisibility')}
                      type="radio"
                      value={option.value}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Visibility */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Contact Information
          </h3>
          
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-500">⚠️</div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Contact Information Privacy
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Your email and phone number are always kept private and only shared with recruiters 
                  when you apply for a job. This ensures your privacy while allowing legitimate 
                  communication about job opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Download Permissions */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Resume Access
          </h3>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500">📄</div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Resume Download Policy
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Recruiters can download your resume when you apply for their jobs. 
                  This helps them review your qualifications and contact you about opportunities. 
                  Your resume is not publicly accessible.
                </p>
              </div>
            </div>
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
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`text-sm font-medium ${
              saveStatus === 'success' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {saveStatus === 'success' ? '✓ Settings saved' : '✗ Failed to save'}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default AccountSettingsTab
