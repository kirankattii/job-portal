import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  CheckCircle, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Share2,
  Copy,
  ExternalLink,
  ArrowLeft,
  Clock,
  TrendingUp
} from 'lucide-react'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { apiService } from '@/services/api'
import toast from 'react-hot-toast'

const ApplicationConfirmation = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [applicationData, setApplicationData] = useState(null)
  const [jobDetails, setJobDetails] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [matchScore, setMatchScore] = useState(0)

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch job details
        const jobResponse = await apiService.get(`/api/jobs/${jobId}`)
        setJobDetails(jobResponse.data.data)

        // Fetch user profile
        const userResponse = await apiService.get('/api/users/profile')
        setUserInfo(userResponse.data.data.user)

        // Simulate application data (in real app, this would come from the application submission response)
        setApplicationData({
          applicationId: `APP-${Date.now()}`,
          appliedAt: new Date().toISOString(),
          status: 'applied',
          coverLetter: 'Your cover letter content here...',
          resumeUrl: userResponse.data.data.user.resumeUrl,
          matchScore: Math.floor(Math.random() * 40) + 60 // Simulate 60-100% match
        })
        
        setMatchScore(applicationData?.matchScore || 75)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load application details')
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationData()
  }, [jobId])

  const handleShare = async (platform) => {
    const shareUrl = window.location.origin
    const shareText = `I just applied for ${jobDetails?.title} at ${jobDetails?.company}!`
    
    if (platform === 'copy') {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      toast.success('Link copied to clipboard!')
      return
    }

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
    }
  }

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  }

  const getMatchScoreText = (score) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Fair Match'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Application Submitted Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your application has been sent to {jobDetails?.company}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Application Summary
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Application ID</span>
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {applicationData?.applicationId}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Position</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {jobDetails?.title}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Company</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {jobDetails?.company}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {jobDetails?.location}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 dark:text-gray-400">Applied Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(applicationData?.appliedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Job Match Score
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(matchScore)}`}>
                  {getMatchScoreText(matchScore)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Overall Match</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {matchScore}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      matchScore >= 80 ? 'bg-green-500' : 
                      matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${matchScore}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.floor(matchScore * 0.9)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Skills Match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(matchScore * 0.8)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Experience Match</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                What Happens Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Application Review</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      The hiring team will review your application and resume within 2-3 business days.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Initial Screening</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      If selected, you'll receive an email or call for an initial screening interview.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Interview Process</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Selected candidates will proceed to technical and cultural fit interviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600 dark:text-gray-400">{userInfo?.email}</span>
                </div>
                
                {userInfo?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">{userInfo.phone}</span>
                  </div>
                )}
                
                {userInfo?.preferredLocation && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-400">{userInfo.preferredLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Application Status
              </h3>
              
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900 dark:text-white">Applied</span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your application has been submitted and is awaiting review.
              </p>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate('/user/applications')}
              >
                View All Applications
              </Button>
            </div>

            {/* Share Application */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Share Your Success
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Let your network know about your job application!
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('linkedin')}
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  LinkedIn
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('twitter')}
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Twitter
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className="flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Link
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/jobs')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Browse More Jobs
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/user/profile')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/user/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationConfirmation
