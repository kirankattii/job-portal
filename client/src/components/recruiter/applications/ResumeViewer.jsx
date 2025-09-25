import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export default function ResumeViewer({ application }) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('pdf') // 'pdf', 'text'
  const [parsedText, setParsedText] = useState('')
  const iframeRef = useRef(null)
  const containerRef = useRef(null)

  const resumeUrl = application?.resumeUrl

  useEffect(() => {
    if (resumeUrl) {
      setIsLoading(true)
      setError(null)
      
      // Try to extract text from PDF for text view
      if (viewMode === 'text') {
        extractTextFromPDF(resumeUrl)
      }
    }
  }, [resumeUrl, viewMode])

  const extractTextFromPDF = async (url) => {
    try {
      // This would typically use a PDF parsing library like pdf-parse
      // For now, we'll simulate it
      setParsedText('Resume text extraction would be implemented here...')
      setIsLoading(false)
    } catch (err) {
      setError('Failed to extract text from resume')
      setIsLoading(false)
    }
  }

  const handleZoomChange = (newZoom) => {
    setZoom(Math.max(25, Math.min(200, newZoom)))
  }

  const handleZoomIn = () => {
    handleZoomChange(zoom + 25)
  }

  const handleZoomOut = () => {
    handleZoomChange(zoom - 25)
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handleDownload = () => {
    if (resumeUrl) {
      const link = document.createElement('a')
      link.href = resumeUrl
      link.download = `resume-${application.user?.firstName}-${application.user?.lastName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const getFileType = (url) => {
    if (!url) return 'unknown'
    const extension = url.split('.').pop()?.toLowerCase()
    return extension || 'unknown'
  }

  const fileType = getFileType(resumeUrl)

  if (!resumeUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No resume available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            This application doesn't have a resume attached
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'pdf' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('pdf')}
            >
              PDF View
            </Button>
            <Button
              variant={viewMode === 'text' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('text')}
            >
              Text View
            </Button>
          </div>

          {/* Zoom Controls */}
          {viewMode === 'pdf' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 25}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </Button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
              >
                Reset
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* File Type Indicator */}
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {fileType}
          </span>

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Resume Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800"
      >
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Loading resume...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Error loading resume
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="p-4">
            {viewMode === 'pdf' ? (
              <div className="flex justify-center">
                <div 
                  className="shadow-lg"
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    width: '100%',
                    maxWidth: '800px'
                  }}
                >
                  {fileType === 'pdf' ? (
                    <iframe
                      ref={iframeRef}
                      src={`${resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-[800px] border-0"
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        setError('Failed to load PDF')
                        setIsLoading(false)
                      }}
                    />
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {fileType.toUpperCase()} File
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        This file type cannot be previewed in the browser
                      </p>
                      <Button onClick={handleDownload}>
                        Download to View
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Resume Text
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {parsedText || 'Text extraction in progress...'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resume Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">File:</span> resume.{fileType}
          </div>
          <div>
            <span className="font-medium">Applied:</span> {new Date(application?.appliedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}
