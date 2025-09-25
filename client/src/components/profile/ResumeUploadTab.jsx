import React, { useState, useCallback, useRef } from 'react'
import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const ResumeUploadTab = ({ profileData, onUpdate, isLoading, setIsLoading }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Please select a PDF file' })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size must be less than 5MB' })
      return
    }

    setSelectedFile(file)
    setUploadStatus(null)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const uploadResume = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadStatus(null)

      const formData = new FormData()
      formData.append('resume', selectedFile)

      const response = await apiClient.post(API_ENDPOINTS.USER.UPLOAD_RESUME, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      if (response.data?.success) {
        const updatedUser = response.data.data
        onUpdate(updatedUser)
        setUploadStatus({ type: 'success', message: 'Resume uploaded successfully!' })
        setSelectedFile(null)
        setParsedData(updatedUser)
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Failed to upload resume:', error)
      setUploadStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to upload resume' 
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const downloadResume = () => {
    if (profileData?.resumeUrl) {
      window.open(profileData.resumeUrl, '_blank')
    }
  }

  const removeResume = async () => {
    try {
      setIsUploading(true)
      setUploadStatus(null)

      const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, {
        resumeUrl: null
      })

      if (response.data?.success) {
        const updatedUser = response.data.data.user
        onUpdate(updatedUser)
        setUploadStatus({ type: 'success', message: 'Resume removed successfully' })
        setParsedData(null)
      }
    } catch (error) {
      console.error('Failed to remove resume:', error)
      setUploadStatus({ type: 'error', message: 'Failed to remove resume' })
    } finally {
      setIsUploading(false)
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
          Resume Upload
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload your resume to auto-fill your profile and make it visible to recruiters.
        </p>
      </div>

      {/* Current Resume Status */}
      {profileData?.resumeUrl && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-green-500">📄</div>
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Resume Uploaded
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your resume is ready and visible to recruiters
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadResume}
              >
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeResume}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedFile ? selectedFile.name : 'Upload your resume'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop your PDF resume here, or click to browse
            </p>
          </div>
          
          {selectedFile && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <div className="flex justify-center">
          <Button
            onClick={uploadResume}
            disabled={isUploading}
            className="px-8"
          >
            Upload Resume
          </Button>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`p-4 rounded-lg ${
          uploadStatus.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className={`text-sm font-medium ${
            uploadStatus.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {uploadStatus.type === 'success' ? '✓' : '✗'} {uploadStatus.message}
          </div>
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Profile Auto-filled from Resume
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p>We've automatically extracted and filled the following information:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              {parsedData.firstName && <li>Personal information</li>}
              {parsedData.skills?.length > 0 && <li>Skills ({parsedData.skills.length} skills)</li>}
              {parsedData.experienceYears && <li>Experience level</li>}
              {parsedData.currentPosition && <li>Current position</li>}
              {parsedData.currentCompany && <li>Current company</li>}
            </ul>
            <p className="mt-2 text-xs">
              Please review and update the information in other tabs as needed.
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <h4 className="font-medium mb-2">Supported formats:</h4>
        <ul className="space-y-1">
          <li>• PDF files only</li>
          <li>• Maximum file size: 5MB</li>
          <li>• We'll automatically extract information to fill your profile</li>
          <li>• Your resume will be visible to recruiters when you apply for jobs</li>
        </ul>
      </div>
    </div>
  )
}

export default ResumeUploadTab
