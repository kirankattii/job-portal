import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Briefcase, 
  Building2, 
  Globe, 
  Share2, 
  CheckCircle,
  Star,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { jobService, savedJobsService } from '@/services/jobService'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

const JobDetails = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [similarJobs, setSimilarJobs] = useState([])
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    resumeFile: null
  })

  const { isAuthenticated, user, isRecruiter, isAdmin } = useAuthStore()

  // Load job details
  useEffect(() => {
    const loadJobDetails = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await jobService.getJobDetails(jobId)
        setJob(response.data?.data || response.data)
        
        // Load similar jobs
        loadSimilarJobs(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      loadJobDetails()
    }
  }, [jobId])

  // Check if job is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !job) return
      
      try {
        const response = await savedJobsService.getSavedJobs({ limit: 1000 })
        const savedJobIds = response.data.savedJobs.map(item => item.job._id)
        setIsSaved(savedJobIds.includes(job._id))
      } catch (err) {
        console.error('Failed to check saved status:', err)
      }
    }

    checkSavedStatus()
  }, [isAuthenticated, job])

  // Load similar jobs
  const loadSimilarJobs = async (currentJob) => {
    try {
      const response = await jobService.searchJobs({
        skills: currentJob.requiredSkills.slice(0, 3),
        limit: 3,
        exclude: currentJob._id
      })
      setSimilarJobs(response.data?.data?.jobs || response.data?.jobs || [])
    } catch (err) {
      console.error('Failed to load similar jobs:', err)
    }
  }

  // Handle save toggle
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save jobs')
      return
    }

    setIsSaving(true)
    try {
      if (isSaved) {
        await savedJobsService.removeSavedJob(job._id)
        toast.success('Job removed from saved list')
        setIsSaved(false)
      } else {
        await savedJobsService.saveJob(job._id)
        toast.success('Job saved successfully')
        setIsSaved(true)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update saved job')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle apply
  const handleApply = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for jobs')
      return
    }

    setIsApplying(true)
    try {
      await jobService.applyToJob(job._id, {
        coverLetter: applicationData.coverLetter,
        resumeFile: applicationData.resumeFile,
        resumeUrl: user?.resumeUrl
      })
      toast.success('Application submitted successfully')
      setShowApplicationForm(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply for job')
    } finally {
      setIsApplying(false)
    }
  }


  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job: ${job.title} at ${job.recruiter?.company?.name}`,
          url: window.location.href
        })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  // Format salary range
  const formatSalary = () => {
    if (!job.salaryRange?.min || !job.salaryRange?.max) return 'Salary not specified'
    return `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`
  }

  // Format experience range
  const formatExperience = () => {
    if (job.experienceMin === undefined || job.experienceMax === undefined) return 'Experience not specified'
    if (job.experienceMin === job.experienceMax) {
      return `${job.experienceMin} year${job.experienceMin !== 1 ? 's' : ''}`
    }
    return `${job.experienceMin} - ${job.experienceMax} years`
  }

  // Format posted date
  const formatPostedDate = () => {
    const date = new Date(job.createdAt)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Check if user should see apply button
  const shouldShowApplyButton = isAuthenticated && !isRecruiter() && !isAdmin()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Job not found</p>
          <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Main Job Details */}
          <div className={cn(
            "lg:col-span-2 order-1 lg:order-1",
            similarJobs.length === 0 && "lg:col-span-3"
          )}>
            <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-sm border border-gray-200 dark:border-secondary-700 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-secondary-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {job.recruiter?.company?.logo && (
                        <img
                          src={job.recruiter.company.logo}
                          alt={job.recruiter.company.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300">{job.recruiter?.company?.name || 'Company'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                        {job.remote && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 text-xs rounded-full">
                            Remote
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{formatExperience()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{job.applicantsCount} applicants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Posted {formatPostedDate()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      onClick={handleSaveToggle}
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Heart className={cn('w-4 h-4', isSaved && 'fill-current text-red-500')} />
                      {isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Information */}
              {job.recruiter?.company && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-secondary-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About the Company</h3>
                  <div className="flex items-start gap-4">
                    {job.recruiter.company.logo && (
                      <img
                        src={job.recruiter.company.logo}
                        alt={job.recruiter.company.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.recruiter.company.name}</h4>
                      {job.recruiter.company.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{job.recruiter.company.description}</p>
                      )}
                      {job.recruiter.company.website && (
                        <a
                          href={job.recruiter.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2"
                        >
                          <Globe className="w-4 h-4" />
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Application Form */}
              {showApplicationForm && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-secondary-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Apply for this Job</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Cover Letter (Optional)
                      </label>
                      <textarea
                        value={applicationData.coverLetter}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Tell us why you're interested in this position..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Resume
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setApplicationData(prev => ({ ...prev, resumeFile: e.target.files[0] }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100"
                      />
                      {user?.resumeUrl && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Or use your saved resume: {user.resumeUrl.split('/').pop()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={handleApply}
                        disabled={isApplying}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isApplying ? 'Applying...' : 'Submit Application'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowApplicationForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Apply Button */}
              {!showApplicationForm && shouldShowApplyButton && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-secondary-700">
                  <Button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    size="lg"
                  >
                    Apply for this Job
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Similar Jobs */}
          {similarJobs.length > 0 && (
            <div className="lg:col-span-1 order-2 lg:order-2 md:-mt-10">
              <div className="sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Similar Jobs</h2>
                <div className="space-y-4">
                  {similarJobs.map((similarJob) => (
                    <div
                      key={similarJob._id}
                      className="bg-white dark:bg-secondary-900 rounded-lg border border-gray-200 dark:border-secondary-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(`/jobs/${similarJob._id}`)}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">{similarJob.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{similarJob.recruiter?.company?.name || 'Company'}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{similarJob.location}</span>
                        {similarJob.remote && (
                          <span className="px-1 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded">Remote</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <DollarSign className="w-3 h-3" />
                        <span>{similarJob.salaryRange?.min && similarJob.salaryRange?.max 
                          ? `$${similarJob.salaryRange.min.toLocaleString()} - $${similarJob.salaryRange.max.toLocaleString()}`
                          : 'Salary not specified'
                        }</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobDetails


