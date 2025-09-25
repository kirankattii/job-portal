import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import UserLayout from '@/components/layout/UserLayout'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import MatchScoreVisualization from '@/components/forms/MatchScoreVisualization'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  User,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Share2,
  Download
} from 'lucide-react'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'
import useAuthStore from '@/stores/authStore'
import { USER_ROLES } from '@/constants'

const ApplicationDetails = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  // Check if user is recruiter or admin - redirect if so
  useEffect(() => {
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      navigate('/unauthorized')
      return
    }
  }, [user, navigate])
  const [application, setApplication] = useState(null)
  const [jobDetails, setJobDetails] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [showResume, setShowResume] = useState(false)

  useEffect(() => {
    fetchApplicationDetails()
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch application details
      const appResponse = await apiService.get(`/api/users/applications/${applicationId}`)
      if (appResponse.data.success) {
        setApplication(appResponse.data.data)
        
        // Fetch job details
        const jobResponse = await apiService.get(`/api/jobs/${appResponse.data.data.job}`)
        setJobDetails(jobResponse.data.data)
      }

      // Fetch user profile
      const userResponse = await apiService.get('/api/users/profile')
      setUserInfo(userResponse.data.data.user)

      // Generate timeline
      generateTimeline(appResponse.data.data)
    } catch (error) {
      console.error('Error fetching application details:', error)
      toast.error('Failed to fetch application details')
      // Fallback to mock data for development
      setApplication(getMockApplication())
      setJobDetails(getMockJobDetails())
      setUserInfo(getMockUserInfo())
      generateTimeline(getMockApplication())
    } finally {
      setLoading(false)
    }
  }

  const generateTimeline = (appData) => {
    const timelineEvents = [
      {
        id: 1,
        date: appData.appliedAt,
        status: 'applied',
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted',
        icon: CheckCircle,
        color: 'text-blue-600'
      }
    ]

    // Add status-specific events
    if (appData.status === 'reviewing' || appData.status === 'hired') {
      timelineEvents.push({
        id: 2,
        date: new Date(appData.appliedAt).toISOString(),
        status: 'reviewing',
        title: 'Under Review',
        description: 'Your application is being reviewed by the hiring team',
        icon: Eye,
        color: 'text-yellow-600'
      })
    }

    if (appData.status === 'hired') {
      timelineEvents.push({
        id: 3,
        date: new Date(appData.appliedAt).toISOString(),
        status: 'hired',
        title: 'Hired!',
        description: 'Congratulations! You have been selected for this position',
        icon: CheckCircle,
        color: 'text-green-600'
      })
    }

    if (appData.status === 'rejected') {
      timelineEvents.push({
        id: 2,
        date: new Date(appData.appliedAt).toISOString(),
        status: 'rejected',
        title: 'Application Rejected',
        description: 'Unfortunately, this application was not selected',
        icon: XCircle,
        color: 'text-red-600'
      })
    }

    setTimeline(timelineEvents)
  }

  // Mock data for development
  const getMockApplication = () => ({
    _id: applicationId,
    job: 'mock-job-id',
    appliedAt: '2024-01-15T10:30:00Z',
    status: 'reviewing',
    matchScore: 85,
    coverLetter: 'I am writing to express my strong interest in the Senior Software Engineer position at Tech Corp. With over 5 years of experience in full-stack development and a passion for creating innovative solutions, I believe I would be a valuable addition to your team...',
    matchedDetails: {
      skillsMatch: 90,
      experienceMatch: 80,
      locationMatch: 100,
      salaryMatch: 75,
      matchedSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express.js'],
      missingSkills: ['Docker', 'AWS', 'GraphQL'],
      notes: 'Strong technical skills with excellent match on core technologies. Consider learning containerization and cloud platforms.'
    }
  })

  const getMockJobDetails = () => ({
    _id: 'mock-job-id',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    type: 'Full-time',
    description: 'We are looking for a senior software engineer to join our growing team...'
  })

  const getMockUserInfo = () => ({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    preferredLocation: 'San Francisco, CA',
    experienceYears: 5,
    resumeUrl: 'https://example.com/resume.pdf'
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'hired':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleWithdrawApplication = async () => {
    // Check if user is recruiter or admin - don't make API calls for these roles
    if (user?.role === USER_ROLES.RECRUITER || user?.role === USER_ROLES.ADMIN) {
      toast.error('This action is not available for your role')
      return
    }

    if (confirm('Are you sure you want to withdraw this application?')) {
      try {
        await apiService.delete(`/api/users/applications/${applicationId}`)
        toast.success('Application withdrawn successfully')
        navigate('/user/applications')
      } catch (error) {
        console.error('Withdrawal error:', error)
        toast.error('Failed to withdraw application')
      }
    }
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/user/applications')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Application Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Application ID: {application._id}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/jobs/${application.job}`)}
              className="flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Job
            </Button>
            
            {application.status === 'applied' && (
              <Button
                variant="outline"
                onClick={handleWithdrawApplication}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {jobDetails.title}
                </h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">{jobDetails.location}</span>
                </div>
                
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">{jobDetails.salary}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Applied {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Job Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {jobDetails.description}
                </p>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Cover Letter
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>

            {/* Match Score Visualization */}
            <MatchScoreVisualization
              matchScore={application.matchScore}
              matchedDetails={application.matchedDetails}
              jobDetails={jobDetails}
              userProfile={userInfo}
              showSuggestions={true}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Application Timeline
              </h3>
              
              <div className="space-y-4">
                {timeline.map((event, index) => {
                  const IconComponent = event.icon
                  return (
                    <div key={event.id} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <IconComponent className={`w-4 h-4 ${event.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">{userInfo.email}</span>
                </div>
                
                {userInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">{userInfo.phone}</span>
                  </div>
                )}
                
                {userInfo.preferredLocation && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">{userInfo.preferredLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Submitted Resume
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-400">resume.pdf</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResume(!showResume)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (userInfo.resumeUrl) {
                        window.open(userInfo.resumeUrl, '_blank')
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {showResume && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resume preview would be displayed here in a real application.
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Next Steps
              </h3>
              
              <div className="space-y-3">
                {application.status === 'applied' && (
                  <div className="flex items-start">
                    <Clock className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Awaiting Review
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        The hiring team will review your application within 2-3 business days.
                      </p>
                    </div>
                  </div>
                )}
                
                {application.status === 'reviewing' && (
                  <div className="flex items-start">
                    <Eye className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Under Review
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your application is being evaluated. You may be contacted for an interview.
                      </p>
                    </div>
                  </div>
                )}
                
                {application.status === 'hired' && (
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Congratulations!
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        You have been selected for this position. Check your email for next steps.
                      </p>
                    </div>
                  </div>
                )}
                
                {application.status === 'rejected' && (
                  <div className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Not Selected
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This application was not selected. Consider applying to similar positions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default ApplicationDetails
