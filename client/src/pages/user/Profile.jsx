import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import useAuthStore from '@/stores/authStore'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import UserLayout from '@/components/layout/UserLayout'
import ProfileCompletion from '@/components/profile/ProfileCompletion'
import PersonalInfoTab from '@/components/profile/PersonalInfoTab'
import ProfessionalDetailsTab from '@/components/profile/ProfessionalDetailsTab'
import SkillsExperienceTab from '@/components/profile/SkillsExperienceTab'
import EducationTab from '@/components/profile/EducationTab'
import ResumeUploadTab from '@/components/profile/ResumeUploadTab'
import AccountSettingsTab from '@/components/profile/AccountSettingsTab'

const TABS = [
  { id: 'personal', label: 'Personal Information', icon: '👤' },
  { id: 'professional', label: 'Professional Details', icon: '💼' },
  { id: 'skills', label: 'Skills & Experience', icon: '🎯' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'resume', label: 'Resume Upload', icon: '📄' },
  { id: 'settings', label: 'Account Settings', icon: '⚙️' },
]

export default function UserProfile() {
  const { user, updateProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('personal')
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState(user)
  const [profileCompletion, setProfileCompletion] = useState(0)

  // Client-side fallback computation for profile completion when server doesn't return it
  const computeClientCompletion = (profile) => {
    if (!profile) return 0
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'bio', 'skills', 'experience', 'education',
      'currentLocation', 'preferredLocation', 'experienceYears', 'currentPosition', 
      'currentCompany', 'currentSalary', 'expectedSalary', 'resumeUrl', 'avatarUrl'
    ]
    let filled = 0
    fields.forEach((field) => {
      const value = profile[field]
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) filled += 1
        } else {
          filled += 1
        }
      }
    })
    return Math.round((filled / fields.length) * 100)
  }


  // Fetch updated profile data
  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE)
      const userData = response.data?.data?.user
      if (userData) {
        setProfileData(userData)
        setProfileCompletion(userData.profileCompletion || 0)
        updateProfile(userData)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleProfileUpdate = (updatedData) => {
    setProfileData((prev) => {
      const next = { ...prev, ...updatedData }
      const completion =
        typeof updatedData?.profileCompletion === 'number'
          ? updatedData.profileCompletion
          : computeClientCompletion(next)
      setProfileCompletion(completion)
      return next
    })
    updateProfile(updatedData)
  }

  const renderTabContent = () => {
    const commonProps = {
      profileData,
      onUpdate: handleProfileUpdate,
      isLoading,
      setIsLoading,
    }

    switch (activeTab) {
      case 'personal':
        return <PersonalInfoTab {...commonProps} />
      case 'professional':
        return <ProfessionalDetailsTab {...commonProps} />
      case 'skills':
        return <SkillsExperienceTab {...commonProps} />
      case 'education':
        return <EducationTab {...commonProps} />
      case 'resume':
        return <ResumeUploadTab {...commonProps} />
      case 'settings':
        return <AccountSettingsTab {...commonProps} />
      default:
        return <PersonalInfoTab {...commonProps} />
    }
  }

  if (isLoading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <UserLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your profile information and settings
          </p>
        </div>

        {/* Profile Completion */}
        <div className="mb-8">
          <ProfileCompletion 
            completion={profileCompletion}
            onRefresh={fetchProfile}
          />
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </UserLayout>
  )
}


