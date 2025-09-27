import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecruiterApi } from '@/hooks/useRecruiterApi'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import JobBasicInfo from '@/components/recruiter/jobs/JobBasicInfo'
import JobDetails from '@/components/recruiter/jobs/JobDetails'
import JobRequirements from '@/components/recruiter/jobs/JobRequirements'
import JobPreview from '@/components/recruiter/jobs/JobPreview'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const steps = [
  { id: 1, name: 'Basic Info', description: 'Job title and location' },
  { id: 2, name: 'Details', description: 'Description and requirements' },
  { id: 3, name: 'Requirements', description: 'Skills and experience' },
  { id: 4, name: 'Preview', description: 'Review and publish' },
]

export default function CreateJob() {
  const navigate = useNavigate()
  const { loading, error, createJob } = useRecruiterApi()
  const [currentStep, setCurrentStep] = useState(1)
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    remote: false,
    requiredSkills: [],
    experienceMin: 0,
    experienceMax: 0,
    salaryRange: {
      min: 0,
      max: 0
    },
    status: 'open'
  })

  const updateJobData = (updates) => {
    setJobData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      await createJob(jobData)
      navigate('/recruiter/jobs', { 
        state: { message: 'Job created successfully!' }
      })
    } catch (err) {
      console.error('Failed to create job:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create job'
      toast.error(errorMessage)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <JobBasicInfo
            data={jobData}
            updateData={updateJobData}
            onNext={nextStep}
          />
        )
      case 2:
        return (
          <JobDetails
            data={jobData}
            updateData={updateJobData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <JobRequirements
            data={jobData}
            updateData={updateJobData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <JobPreview
            data={jobData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            isLoading={loading}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create New Job
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Post a new job opening and start receiving applications
              </p>
            </div>
            <Button
              onClick={() => navigate('/recruiter/jobs')}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol className="flex items-center justify-between">
                {steps.map((step, stepIdx) => (
                  <li key={step.name} className={cn(
                    "relative",
                    stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
                  )}>
                    <div className="flex items-center">
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2",
                        currentStep >= step.id
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                      )}>
                        {currentStep > step.id ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-sm font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="ml-4 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          currentStep >= step.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        )}>
                          {step.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {stepIdx !== steps.length - 1 && (
                      <div className="absolute top-4 left-4 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  )
}