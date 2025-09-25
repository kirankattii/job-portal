import React, { useState, useEffect } from 'react'
import { useRecruiterApi } from '@/hooks/useRecruiterApi'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import CandidateFilters from '@/components/recruiter/candidates/CandidateFilters'
import CandidateList from '@/components/recruiter/candidates/CandidateList'
import CandidateDetailsModal from '@/components/recruiter/candidates/CandidateDetailsModal'

export default function Candidates() {
  const { 
    loading, 
    error, 
    searchCandidates, 
    getSavedCandidates, 
    saveCandidate, 
    sendMessage 
  } = useRecruiterApi()
  
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    location: '',
    experienceMin: '',
    experienceMax: '',
    salaryMin: '',
    salaryMax: '',
    sortBy: 'profileCompletion',
    sortOrder: 'desc',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({})
  const [savedCandidates, setSavedCandidates] = useState([])

  useEffect(() => {
    loadCandidates()
    loadSavedCandidates()
  }, [filters])

  const loadCandidates = async () => {
    try {
      const response = await searchCandidates(filters)
      setCandidates(response.data.data.candidates)
      setPagination(response.data.data.pagination)
    } catch (err) {
      console.error('Failed to load candidates:', err)
    }
  }

  const loadSavedCandidates = async () => {
    try {
      const response = await getSavedCandidates()
      setSavedCandidates(response.data.data.candidates || [])
    } catch (err) {
      console.error('Failed to load saved candidates:', err)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setShowDetailsModal(true)
  }

  const handleSaveCandidate = async (candidateId) => {
    try {
      await saveCandidate(candidateId)
      loadSavedCandidates()
    } catch (err) {
      console.error('Failed to save candidate:', err)
    }
  }

  const handleContactCandidate = async (candidateId, message) => {
    try {
      await sendMessage(candidateId, message)
      // Show success message or handle response
    } catch (err) {
      console.error('Failed to send message:', err)
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
                Candidate Search
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Find and connect with potential candidates
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setFilters(prev => ({ ...prev, saved: true }))}
                variant="outline"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Candidates ({savedCandidates.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
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

          {/* Filters */}
          <div className="mb-6">
            <CandidateFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Candidates List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No candidates found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria to find more candidates.
                </p>
              </div>
            ) : (
              <CandidateList
                candidates={candidates}
                onViewDetails={handleViewDetails}
                onSaveCandidate={handleSaveCandidate}
                onContactCandidate={handleContactCandidate}
                pagination={pagination}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          onClose={() => setShowDetailsModal(false)}
          onSaveCandidate={handleSaveCandidate}
          onContactCandidate={handleContactCandidate}
        />
      )}
    </div>
  )
}