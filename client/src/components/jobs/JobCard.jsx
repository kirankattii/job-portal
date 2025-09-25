import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MapPin, Clock, DollarSign, Users, Briefcase, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { jobService, savedJobsService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

const JobCard = ({ 
  job, 
  isSaved = false, 
  isApplied = false,
  onSaveToggle, 
  onApply,
  showApplyButton = true,
  className = '' 
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const { isAuthenticated, user, isRecruiter, isAdmin } = useAuthStore()
  const navigate = useNavigate()


  const {
    _id,
    title,
    description,
    location,
    remote,
    salaryRange,
    requiredSkills = [],
    experienceMin,
    experienceMax,
    applicantsCount = 0,
    createdAt,
    recruiter
  } = job

  const companyName = recruiter?.company?.name || recruiter?.companyName || 'Company'
  const companyLogo = recruiter?.company?.logo

  // Format salary range
  const formatSalary = () => {
    if (!salaryRange?.min || !salaryRange?.max) return 'Salary not specified'
    return `$${salaryRange.min.toLocaleString()} - $${salaryRange.max.toLocaleString()}`
  }

  // Format experience range
  const formatExperience = () => {
    if (experienceMin === undefined || experienceMax === undefined) return 'Experience not specified'
    if (experienceMin === experienceMax) {
      return `${experienceMin} year${experienceMin !== 1 ? 's' : ''}`
    }
    return `${experienceMin} - ${experienceMax} years`
  }

  // Format posted date
  const formatPostedDate = () => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  // Handle save/unsave job
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save jobs')
      return
    }

    setIsSaving(true)
    try {
      if (isSaved) {
        await savedJobsService.removeSavedJob(_id)
        toast.success('Job removed from saved list')
      } else {
        await savedJobsService.saveJob(_id)
        toast.success('Job saved successfully')
      }
      onSaveToggle?.(_id, !isSaved)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update saved job')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle apply to job - redirect to details page
  const handleApply = () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for jobs')
      return
    }
    
    // Navigate to job details page
    navigate(`/jobs/${_id}`)
  }

  // Check if user should see View button instead of Apply
  const shouldShowViewButton = isRecruiter() || isAdmin()
  const buttonText = shouldShowViewButton ? 'View' : (isApplied ? 'Applied' : 'Apply Now')
  const buttonAction = shouldShowViewButton ? () => navigate(`/jobs/${_id}`) : handleApply

  // Check if this is list view mode
  const isListView = className.includes('flex')

  return (
    <div className={cn(
      'bg-white dark:bg-secondary-900 rounded-lg border border-gray-200 dark:border-secondary-700 hover:shadow-lg transition-all duration-200 h-full',
      isListView ? 'p-4' : 'p-6 flex flex-col',
      className
    )}>
      {isListView ? (
        /* List View Layout */
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Job Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {companyLogo && (
              <img
                src={companyLogo}
                alt={companyName}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h3>
                <button
                  onClick={handleSaveToggle}
                  disabled={isSaving}
                  className={cn(
                    'p-1 rounded-full transition-colors flex-shrink-0',
                    isSaved 
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-500 dark:hover:bg-red-500/10'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">{companyName}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{location}</span>
                  {remote && (
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs rounded-full whitespace-nowrap">
                      Remote
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="truncate">{formatSalary()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="truncate">{formatExperience()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatPostedDate()}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4" />
                <span>{applicantsCount} applicants</span>
              </div>
            </div>
            
            {isApplied && (
              <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-sm font-medium rounded-full whitespace-nowrap">
                Applied
              </div>
            )}
          </div>
          
          {/* Button Section - Far Right */}
          {showApplyButton && (
            <div className="flex-shrink-0 ml-2">
              <Button
                onClick={buttonAction}
                disabled={!shouldShowViewButton && isApplied}
                size="sm"
                className={cn(
                  "whitespace-nowrap",
                  (!shouldShowViewButton && isApplied)
                    ? "bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Grid View Layout */
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                {companyLogo && (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{companyName}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveToggle}
              disabled={isSaving}
              className={cn(
                'p-2 rounded-full transition-colors flex-shrink-0',
                isSaved 
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-500 dark:hover:bg-red-500/10'
              )}
            >
              <Heart className={cn('w-5 h-5', isSaved && 'fill-current')} />
            </button>
          </div>

          {/* Job Details */}
          <div className="space-y-3 mb-4">
            {/* Location and Remote */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
              {remote && (
                <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs rounded-full whitespace-nowrap flex-shrink-0">
                  Remote
                </span>
              )}
            </div>

            {/* Salary */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{formatSalary()}</span>
            </div>

            {/* Job Stats Row */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{formatExperience()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{applicantsCount} applicants</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{formatPostedDate()}</span>
              </div>
            </div>
          </div>


          {/* Skills */}
          {requiredSkills.length > 0 && (
            <div className="mb-4 flex-1">
              <div className="flex flex-wrap gap-2">
                {requiredSkills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs rounded-full whitespace-nowrap"
                  >
                    {skill}
                  </span>
                ))}
                {requiredSkills.length > 5 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-secondary-800 dark:text-gray-300 text-xs rounded-full">
                    ...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-auto pt-2">
            {isApplied && (
              <div className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-sm font-medium rounded-full">
                Applied
              </div>
            )}
            
            {showApplyButton && (
              <Button
                onClick={buttonAction}
                disabled={!shouldShowViewButton && isApplied}
                size="sm"
                className={cn(
                  "whitespace-nowrap",
                  (!shouldShowViewButton && isApplied)
                    ? "bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {buttonText}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default JobCard
