import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  FileText, 
  X, 
  Save, 
  Send, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'

// Zod schema for form validation
const applicationSchema = z.object({
  coverLetter: z.string()
    .min(50, 'Cover letter must be at least 50 characters')
    .max(2000, 'Cover letter cannot exceed 2000 characters'),
  resumeUrl: z.string().optional(),
  resumeFile: z.any().optional(),
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    location: z.string().optional()
  })
})

const ApplicationForm = ({ 
  jobId, 
  jobDetails, 
  userInfo, 
  onSuccess, 
  onCancel,
  isDraft = false,
  draftData = null 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: draftData?.coverLetter || '',
      resumeUrl: userInfo?.resumeUrl || '',
      personalInfo: {
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        location: userInfo?.preferredLocation || ''
      }
    }
  })

  const watchedCoverLetter = watch('coverLetter')
  const watchedPersonalInfo = watch('personalInfo')

  // Update character count when cover letter changes
  useEffect(() => {
    setCharacterCount(watchedCoverLetter?.length || 0)
  }, [watchedCoverLetter])

  // Track unsaved changes
  useEffect(() => {
    if (isDraft) {
      setHasUnsavedChanges(true)
    }
  }, [watchedCoverLetter, watchedPersonalInfo, isDraft])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Drag and drop configuration
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: handleFileUpload,
    onDropRejected: (fileRejections) => {
      const errors = fileRejections[0]?.errors || []
      if (errors.some(e => e.code === 'file-too-large')) {
        toast.error('File size must be less than 5MB')
      } else if (errors.some(e => e.code === 'file-invalid-type')) {
        toast.error('Please upload a PDF, DOC, DOCX, or TXT file')
      }
    }
  })

  async function handleFileUpload(acceptedFiles) {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setFileUploading(true)
    setUploadedFile(file)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await apiService.upload('/api/users/upload-resume', formData)
      
      if (response.data.success) {
        setValue('resumeUrl', response.data.data.resumeUrl)
        toast.success('Resume uploaded successfully!')
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast.error('Failed to upload resume. Please try again.')
      setUploadedFile(null)
    } finally {
      setFileUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setValue('resumeUrl', '')
    setValue('resumeFile', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const saveDraft = async (data) => {
    setIsSavingDraft(true)
    try {
      await apiService.post(`/api/applications/${jobId}/draft`, {
        coverLetter: data.coverLetter,
        resumeUrl: data.resumeUrl,
        personalInfo: data.personalInfo
      })
      toast.success('Draft saved successfully!')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Save draft error:', error)
      toast.error('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      
      // Add form data
      formData.append('coverLetter', data.coverLetter)
      if (data.resumeUrl) {
        formData.append('resumeUrl', data.resumeUrl)
      }
      
      // Add personal info
      Object.entries(data.personalInfo).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      const response = await apiService.upload(`/api/jobs/${jobId}/apply`, formData)
      
      if (response.data.success) {
        toast.success('Application submitted successfully!')
        onSuccess?.(response.data.data)
      }
    } catch (error) {
      console.error('Application submission error:', error)
      const errorMessage = error.response?.data?.message || 'Failed to submit application'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    handleSubmit(saveDraft)()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Apply for {jobDetails?.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {jobDetails?.company} • {jobDetails?.location} • {jobDetails?.type}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                {...register('personalInfo.firstName')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your first name"
              />
              {errors.personalInfo?.firstName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.personalInfo.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                {...register('personalInfo.lastName')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your last name"
              />
              {errors.personalInfo?.lastName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.personalInfo.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                {...register('personalInfo.email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your email"
              />
              {errors.personalInfo?.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.personalInfo.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                {...register('personalInfo.phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                {...register('personalInfo.location')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your location"
              />
            </div>
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Resume Upload
            </h3>
          </div>

          {userInfo?.resumeUrl && !uploadedFile && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 dark:text-green-200">
                    Using saved resume from your profile
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setValue('resumeUrl', '')}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : isDragReject
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            {fileUploading ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="md" />
                <p className="mt-2 text-gray-600 dark:text-gray-400">Uploading resume...</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center">
                <FileText className="w-12 h-12 text-green-600 mb-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="mt-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag and drop your resume here, or click to select a file
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {errors.resumeUrl && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Resume is required
            </p>
          )}
        </div>

        {/* Cover Letter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cover Letter
              </h3>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className={characterCount > 2000 ? 'text-red-500' : characterCount > 1800 ? 'text-yellow-500' : 'text-green-500'}>
                {characterCount}/2000
              </span>
            </div>
          </div>

          <textarea
            {...register('coverLetter')}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Write a compelling cover letter explaining why you're the perfect fit for this position..."
          />
          
          {errors.coverLetter && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.coverLetter.message}
            </p>
          )}

          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Explain why you're interested in this role and company</p>
            <p>• Highlight relevant experience and skills</p>
            <p>• Show enthusiasm and professionalism</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isSavingDraft}
            >
              Cancel
            </Button>
            
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
                className="flex items-center"
              >
                {isSavingDraft ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting || isSavingDraft || (!userInfo?.resumeUrl && !uploadedFile)}
            className="flex items-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 dark:text-yellow-200 text-sm">
              You have unsaved changes. Consider saving as draft before submitting.
            </span>
          </div>
        )}
      </form>
    </div>
  )
}

export default ApplicationForm
