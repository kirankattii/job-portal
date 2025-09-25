import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

// Simple rich text editor component
const RichTextEditor = ({ value, onChange, placeholder, error }) => {
  const editorRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const toolbarButtons = [
    { command: 'bold', icon: 'B', title: 'Bold' },
    { command: 'italic', icon: 'I', title: 'Italic' },
    { command: 'underline', icon: 'U', title: 'Underline' },
    { command: 'insertUnorderedList', icon: '•', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: '1.', title: 'Numbered List' },
  ]

  return (
    <div className="space-y-2">
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex space-x-1">
          {toolbarButtons.map((button) => (
            <button
              key={button.command}
              type="button"
              onClick={() => execCommand(button.command)}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={button.title}
            >
              {button.icon}
            </button>
          ))}
        </div>
        
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          className={cn(
            "min-h-[200px] p-4 focus:outline-none",
            isFocused ? "ring-2 ring-blue-500" : "",
            error ? "border-red-500" : ""
          )}
          style={{ minHeight: '200px' }}
          data-placeholder={placeholder}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Use the toolbar above to format your job description. Include details about responsibilities, 
        company culture, benefits, and what makes this role exciting.
      </p>
    </div>
  )
}

export default function JobDetails({ data, updateData, onNext, onPrev }) {
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!data.description.trim()) {
      newErrors.description = 'Job description is required'
    } else if (data.description.length < 50) {
      newErrors.description = 'Job description must be at least 50 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  const handleInputChange = (field, value) => {
    updateData({ [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Job Description & Details
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Provide a detailed description of the role, responsibilities, and what you're looking for.
        </p>
      </div>

      <div className="space-y-6">
        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            value={data.description}
            onChange={(value) => handleInputChange('description', value)}
            placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
            error={errors.description}
          />
        </div>

        {/* Company Overview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Overview
          </label>
          <textarea
            value={data.companyOverview || ''}
            onChange={(e) => handleInputChange('companyOverview', e.target.value)}
            placeholder="Tell candidates about your company, mission, culture, and what makes it a great place to work..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Key Responsibilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Key Responsibilities
          </label>
          <textarea
            value={data.responsibilities || ''}
            onChange={(e) => handleInputChange('responsibilities', e.target.value)}
            placeholder="List the main responsibilities and duties for this role..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Benefits & Perks
          </label>
          <textarea
            value={data.benefits || ''}
            onChange={(e) => handleInputChange('benefits', e.target.value)}
            placeholder="What benefits and perks do you offer? (e.g., health insurance, flexible hours, remote work, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Application Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Instructions
          </label>
          <textarea
            value={data.applicationInstructions || ''}
            onChange={(e) => handleInputChange('applicationInstructions', e.target.value)}
            placeholder="Any specific instructions for applicants? (e.g., include portfolio, answer specific questions, etc.)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <Button
          onClick={onPrev}
          variant="outline"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!data.description.trim()}
          className="px-8"
        >
          Next: Requirements
        </Button>
      </div>
    </div>
  )
}
