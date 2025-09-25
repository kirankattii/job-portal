import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'
import ResumeViewer from './ResumeViewer'
import MatchScoreBreakdown from './MatchScoreBreakdown'
import SkillsComparison from './SkillsComparison'
import NotesComments from './NotesComments'
import CandidateEvaluation from './CandidateEvaluation'
import CommunicationPanel from './CommunicationPanel'
import ApplicationFilters from './ApplicationFilters'
import ApplicationList from './ApplicationList'
import BulkActions from './BulkActions'

export default function AdvancedApplicationReview({ 
  jobId, 
  applications = [], 
  onApplicationUpdate, 
  onBulkAction,
  onFilterChange,
  filters = {},
  pagination = {},
  isLoading = false,
  error = null
}) {
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [selectedApplications, setSelectedApplications] = useState([])
  const [viewMode, setViewMode] = useState('split') // 'split', 'list', 'details'
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setViewMode('split')
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-select first application if none selected
  useEffect(() => {
    if (applications.length > 0 && !selectedApplication) {
      setSelectedApplication(applications[0])
    }
  }, [applications, selectedApplication])

  const handleApplicationSelect = (application) => {
    setSelectedApplication(application)
    if (isMobile) {
      setViewMode('details')
    }
  }

  const handleBulkSelect = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(applications.map(app => app._id))
    }
  }

  const handleBulkAction = async (action, data = {}) => {
    if (selectedApplications.length === 0) return
    
    try {
      await onBulkAction(action, { applicationIds: selectedApplications, ...data })
      setSelectedApplications([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const handleApplicationUpdate = async (applicationId, updates) => {
    try {
      await onApplicationUpdate(applicationId, updates)
      // Update local state
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, ...updates }))
      }
    } catch (error) {
      console.error('Application update failed:', error)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'resume', label: 'Resume', icon: '📄' },
    { id: 'evaluation', label: 'Evaluation', icon: '⭐' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'notes', label: 'Notes', icon: '📝' }
  ]

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Application Review
              </h1>
              {selectedApplication && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant={viewMode === 'split' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                >
                  Split View
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List View
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={viewMode === 'split' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('split')
                    setShowMobileMenu(false)
                  }}
                >
                  Split View
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setViewMode('list')
                    setShowMobileMenu(false)
                  }}
                >
                  List View
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Applications List Panel */}
        <div className={cn(
          "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col",
          viewMode === 'split' ? "w-1/3 lg:w-1/2 xl:w-2/5" : "w-full",
          viewMode === 'list' && "w-full",
          isMobile && viewMode === 'details' && "hidden"
        )}>
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <ApplicationFilters
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </div>

          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <BulkActions
                selectedCount={selectedApplications.length}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedApplications([])}
              />
            </div>
          )}

          {/* Applications List */}
          <div className="flex-1 overflow-y-auto">
            <ApplicationList
              applications={applications}
              selectedApplications={selectedApplications}
              selectedApplication={selectedApplication}
              onApplicationSelect={handleApplicationSelect}
              onBulkSelect={handleBulkSelect}
              onSelectAll={handleSelectAll}
              onApplicationUpdate={handleApplicationUpdate}
              pagination={pagination}
              isLoading={isLoading}
              compact={viewMode === 'split'}
            />
          </div>
        </div>

        {/* Application Details Panel */}
        {selectedApplication && viewMode !== 'list' && (
          <div className={cn(
            "flex-1 flex flex-col bg-white dark:bg-gray-800",
            isMobile && viewMode === 'details' && "w-full"
          )}>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2",
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <span>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <MatchScoreBreakdown application={selectedApplication} />
                  <SkillsComparison application={selectedApplication} />
                </div>
              )}
              
              {activeTab === 'resume' && (
                <ResumeViewer application={selectedApplication} />
              )}
              
              {activeTab === 'evaluation' && (
                <CandidateEvaluation 
                  application={selectedApplication}
                  onUpdate={handleApplicationUpdate}
                />
              )}
              
              {activeTab === 'communication' && (
                <CommunicationPanel 
                  application={selectedApplication}
                  onUpdate={handleApplicationUpdate}
                />
              )}
              
              {activeTab === 'notes' && (
                <NotesComments 
                  application={selectedApplication}
                  onUpdate={handleApplicationUpdate}
                />
              )}
            </div>
          </div>
        )}

        {/* No Application Selected */}
        {!selectedApplication && viewMode !== 'list' && (
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No application selected
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select an application from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
