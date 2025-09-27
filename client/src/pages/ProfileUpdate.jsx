import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import InputField from '@/components/forms/InputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/forms/ErrorMessage'

export default function ProfileUpdate() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm()

  // Verify token and get user info
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid or missing token')
        return
      }

      try {
        setIsLoading(true)
        // Note: This would need a separate endpoint to verify token without updating
        // For now, we'll proceed with the form
        setUser({ token })
        
        // Pre-fill form with URL parameters for quick updates
        const skills = searchParams.get('skills')
        const experienceYears = searchParams.get('experienceYears')
        const currentPosition = searchParams.get('currentPosition')
        const currentCompany = searchParams.get('currentCompany')
        const currentLocation = searchParams.get('currentLocation')
        const preferredLocation = searchParams.get('preferredLocation')
        const bio = searchParams.get('bio')
        
        if (skills) setValue('skills', skills)
        if (experienceYears) setValue('experienceYears', experienceYears)
        if (currentPosition) setValue('currentPosition', currentPosition)
        if (currentCompany) setValue('currentCompany', currentCompany)
        if (currentLocation) setValue('currentLocation', currentLocation)
        if (preferredLocation) setValue('preferredLocation', preferredLocation)
        if (bio) setValue('bio', bio)
        
      } catch (error) {
        setError('Invalid or expired token')
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [token, searchParams, setValue])

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      setError('')
      setSuccess('')

      const response = await apiClient.post('/api/users/profile/update-from-email', {
        token,
        ...data
      })

      if (response.data.success) {
        setSuccess('Profile updated successfully! You can now close this page.')
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate('/')
        }, 3000)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying your token...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Token</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-blue-500 text-6xl mb-4">📝</div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="mt-2 text-gray-600">
              Help recruiters find you by completing your profile information
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex">
                <div className="text-green-400 text-xl mr-3">✅</div>
                <div>
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <p className="mt-1 text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="text-red-400 text-xl mr-3">❌</div>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="md:col-span-2">
                <InputField
                  label="Skills (comma-separated)"
                  placeholder="JavaScript, React, Node.js, Python"
                  {...register('skills', {
                    required: 'Skills are required'
                  })}
                  error={errors.skills?.message}
                />
              </div>

              {/* Experience Years */}
              <div>
                <InputField
                  label="Years of Experience"
                  type="number"
                  placeholder="5"
                  {...register('experienceYears', {
                    required: 'Experience years are required',
                    min: {
                      value: 0,
                      message: 'Experience years must be 0 or greater'
                    }
                  })}
                  error={errors.experienceYears?.message}
                />
              </div>

              {/* Current Position */}
              <div>
                <InputField
                  label="Current Position"
                  placeholder="Software Engineer"
                  {...register('currentPosition', {
                    required: 'Current position is required'
                  })}
                  error={errors.currentPosition?.message}
                />
              </div>

              {/* Current Company */}
              <div>
                <InputField
                  label="Current Company"
                  placeholder="Tech Corp"
                  {...register('currentCompany', {
                    required: 'Current company is required'
                  })}
                  error={errors.currentCompany?.message}
                />
              </div>

              {/* Current Location */}
              <div>
                <InputField
                  label="Current Location"
                  placeholder="San Francisco, CA"
                  {...register('currentLocation', {
                    required: 'Current location is required'
                  })}
                  error={errors.currentLocation?.message}
                />
              </div>

              {/* Preferred Location */}
              <div>
                <InputField
                  label="Preferred Location"
                  placeholder="Remote, New York, CA"
                  {...register('preferredLocation')}
                  error={errors.preferredLocation?.message}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Summary
              </label>
              <textarea
                id="bio"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your professional background, skills, and career goals..."
                {...register('bio')}
              />
              {errors.bio && <ErrorMessage message={errors.bio.message} />}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Profile Updates'
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              This form was sent to you via email. If you didn't request this, please ignore this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
