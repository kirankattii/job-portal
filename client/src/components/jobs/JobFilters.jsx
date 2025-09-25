import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp, MapPin, DollarSign, Briefcase, Tag, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { skillsService, jobService } from '@/services/jobService'
import { cn } from '@/utils/cn'

const JobFilters = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  isMobile = false,
  isOpen = false,
  onToggle 
}) => {
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [locations, setLocations] = useState([])
  const [skillQuery, setSkillQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [isLoadingSkills, setIsLoadingSkills] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(false)

  // Load initial data
  useEffect(() => {
    loadLocations()
  }, [])

  // Load skill suggestions
  useEffect(() => {
    if (skillQuery.length >= 2) {
      loadSkillSuggestions()
    } else {
      setSkillSuggestions([])
    }
  }, [skillQuery])

  // Load location suggestions
  useEffect(() => {
    if (locationQuery.length >= 2) {
      loadLocationSuggestions()
    } else {
      setLocations([])
    }
  }, [locationQuery])

  const loadSkillSuggestions = async () => {
    setIsLoadingSkills(true)
    try {
      const response = await skillsService.getSkillSuggestions({ q: skillQuery })
      setSkillSuggestions(response.data.suggestions || [])
    } catch (error) {
      console.error('Failed to load skill suggestions:', error)
    } finally {
      setIsLoadingSkills(false)
    }
  }

  const loadLocations = async () => {
    setIsLoadingLocations(true)
    try {
      const response = await jobService.getJobLocations()
      setLocations(response.data || [])
    } catch (error) {
      console.error('Failed to load locations:', error)
    } finally {
      setIsLoadingLocations(false)
    }
  }

  const loadLocationSuggestions = () => {
    // Filter existing locations based on query
    const filtered = locations.filter(location =>
      location.toLowerCase().includes(locationQuery.toLowerCase())
    )
    setLocations(filtered)
  }

  const handleSkillAdd = (skill) => {
    if (!filters.skills.includes(skill)) {
      onFiltersChange({
        ...filters,
        skills: [...filters.skills, skill]
      })
    }
    setSkillQuery('')
    setSkillSuggestions([])
  }

  const handleSkillRemove = (skillToRemove) => {
    onFiltersChange({
      ...filters,
      skills: filters.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleLocationSelect = (location) => {
    onFiltersChange({
      ...filters,
      location
    })
    setLocationQuery('')
  }

  const handleSalaryChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value ? parseInt(value) : undefined
    })
  }

  const handleExperienceChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value ? parseInt(value) : undefined
    })
  }

  const handleJobTypeChange = (jobType) => {
    onFiltersChange({
      ...filters,
      jobType: filters.jobType === jobType ? '' : jobType
    })
  }

  const handleRemoteChange = (remote) => {
    onFiltersChange({
      ...filters,
      remote: filters.remote === remote ? undefined : remote
    })
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.location ||
      filters.skills.length > 0 ||
      filters.experienceMin !== undefined ||
      filters.experienceMax !== undefined ||
      filters.salaryMin !== undefined ||
      filters.salaryMax !== undefined ||
      filters.jobType ||
      filters.remote !== undefined
    )
  }

  const FilterSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
      <div className="border-b border-gray-200 dark:border-secondary-700 pb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {isOpen && children}
      </div>
    )
  }

  const content = (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters() && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Active filters</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Location */}
      <FilterSection title="Location" icon={MapPin}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search locations..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {locationQuery && locations.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {locations.slice(0, 10).map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-100"
                >
                  {location}
                </button>
              ))}
            </div>
          )}
          {filters.location && (
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs rounded-full">
                {filters.location}
              </span>
              <button
                onClick={() => onFiltersChange({ ...filters, location: '' })}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </FilterSection>

      {/* Salary Range */}
      <FilterSection title="Salary Range" icon={DollarSign}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Min Salary</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.salaryMin || ''}
                onChange={(e) => handleSalaryChange('salaryMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Max Salary</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.salaryMax || ''}
                onChange={(e) => handleSalaryChange('salaryMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection title="Experience Level" icon={Briefcase}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Min Experience</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filters.experienceMin || ''}
                onChange={(e) => handleExperienceChange('experienceMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Max Experience</label>
              <input
                type="number"
                placeholder="10"
                min="0"
                value={filters.experienceMax || ''}
                onChange={(e) => handleExperienceChange('experienceMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Skills */}
      <FilterSection title="Skills" icon={Tag}>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search skills..."
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {isLoadingSkills && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {skillQuery && skillSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {skillSuggestions.map((skill, index) => (
                  <button
                    key={index}
                    onClick={() => handleSkillAdd(skill)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-secondary-700 text-gray-700 dark:text-gray-100"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Skills */}
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs rounded-full"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillRemove(skill)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      {/* Job Type */}
      <FilterSection title="Job Type" icon={Building}>
        <div className="space-y-2">
          {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.jobType === type}
                onChange={() => handleJobTypeChange(type)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-secondary-700 rounded focus:ring-blue-500 bg-white dark:bg-secondary-800"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">{type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Remote Work */}
      <FilterSection title="Remote Work">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.remote === true}
              onChange={() => handleRemoteChange(true)}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-secondary-700 rounded focus:ring-blue-500 bg-white dark:bg-secondary-800"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Remote Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.remote === false}
              onChange={() => handleRemoteChange(false)}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-secondary-700 rounded focus:ring-blue-500 bg-white dark:bg-secondary-800"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">On-site Only</span>
          </label>
        </div>
      </FilterSection>
    </div>
  )

  if (isMobile) {
    return (
      <div className={cn(
        'fixed inset-0 z-50 bg-black/50 transition-opacity',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        <div className={cn(
          'fixed right-0 top-0 h-full w-80 bg-white dark:bg-secondary-900 border-l border-gray-200 dark:border-secondary-700 shadow-xl transform transition-transform',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-800 rounded-full text-gray-600 dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-lg border border-gray-200 dark:border-secondary-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h3>
      {content}
    </div>
  )
}

export default JobFilters
