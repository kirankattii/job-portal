import React, { useEffect, useMemo, useState } from 'react'
import UserLayout from '@/components/layout/UserLayout'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import useAuthStore from '@/stores/authStore'
import useProfileStore from '@/stores/profileStore'
import apiClient from '@/services/apiClient'
import { API_ENDPOINTS } from '@/constants'

const UserSettings = () => {
  const { user, setUser } = useAuthStore()
  const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore()

  const effectiveUser = useMemo(() => {
    // profile from API can be { user: {...} } or the user object itself
    if (profile && profile.user) return profile.user
    if (profile) return profile
    return user
  }, [profile, user])

  const [email, setEmail] = useState('')
  const [accountType, setAccountType] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [jobAlerts, setJobAlerts] = useState(true)
  const [profileVisibility, setProfileVisibility] = useState('public')

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  const [showPwdModal, setShowPwdModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    // Load profile on mount if not available
    if (!effectiveUser && fetchProfile) {
      fetchProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (effectiveUser) {
      setEmail(effectiveUser.email || '')
      setAccountType(effectiveUser.role === 'recruiter' ? 'Recruiter' : effectiveUser.role === 'admin' ? 'Admin' : 'Job Seeker')
      const prefs = effectiveUser.preferences || {}
      setEmailNotifications(prefs.emailNotifications ?? true)
      setJobAlerts(prefs.jobAlerts ?? true)
      setProfileVisibility(prefs.profileVisibility || 'public')
    }
  }, [effectiveUser])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveStatus(null)

      const payload = {
        // Only preferences are editable here
        preferences: {
          emailNotifications,
          jobAlerts,
          profileVisibility,
        },
      }

      const res = await updateProfile(payload)
      const updated = res?.profile?.user || res?.profile || null
      if (updated && setUser) {
        setUser(updated)
      }

      setIsSaving(false)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (_) {
      setIsSaving(false)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleChangePassword = async () => {
    setPwdError('')
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match')
      return
    }
    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters')
      return
    }
    try {
      setPwdLoading(true)
      await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword })
      setPwdLoading(false)
      setShowPwdModal(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password'
      setPwdLoading(false)
      setPwdError(msg)
    }
  }

  return (
    <UserLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Settings ⚙️
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
              />
              <InputField
                label="Account Type"
                name="accountType"
                value={accountType}
                disabled
              />
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Security Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your password to keep your account secure
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPwdModal(true)}>
                  Change Password
                </Button>
              </div>
          
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive email updates about your applications and job matches
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Job Alerts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified about new job opportunities that match your profile
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={jobAlerts}
                    onChange={(e) => setJobAlerts(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Privacy Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'public', title: 'Public', description: 'Anyone can view your profile' },
                    { value: 'recruiters-only', title: 'Recruiters Only', description: 'Only verified recruiters can view your profile' },
                    { value: 'private', title: 'Private', description: 'Only you can view your profile' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="profileVisibility"
                        value={option.value}
                        checked={profileVisibility === option.value}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-4">
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-red-900 dark:text-red-200">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Loading settings…' : 'Update your preferences and save'}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSave}
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

        {showPwdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => !pwdLoading && setShowPwdModal(false)}></div>
            <div className="relative z-10 w-full max-w-md mx-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                <InputField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <InputField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {pwdError && (
                  <div className="text-sm text-red-600 dark:text-red-400">{pwdError}</div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowPwdModal(false)} disabled={pwdLoading}>Cancel</Button>
                <Button onClick={handleChangePassword} isLoading={pwdLoading} disabled={pwdLoading}>Update Password</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  )
}

export default UserSettings


