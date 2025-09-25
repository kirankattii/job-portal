# Recruiter API Integration Guide

This document outlines the complete integration of recruiter-related APIs into the client frontend.

## Overview

The recruiter API integration provides a comprehensive set of endpoints for managing jobs, applications, candidates, and analytics. All endpoints are properly integrated with error handling, loading states, and user feedback.

## API Endpoints Integrated

### Dashboard
- **GET** `/api/recruiter/dashboard` - Get recruiter dashboard statistics and data

### Job Management
- **GET** `/api/recruiter/jobs` - Get all jobs for the authenticated recruiter
- **POST** `/api/recruiter/jobs` - Create a new job posting
- **PUT** `/api/recruiter/jobs/:jobId` - Update an existing job posting
- **DELETE** `/api/recruiter/jobs/:jobId` - Delete a job posting

### Applications Management
- **GET** `/api/recruiter/job/:jobId/applicants` - Get applicants for a specific job with match scores
- **PUT** `/api/recruiter/applications/:applicationId/status` - Update application status

### Candidate Search & Management
- **GET** `/api/recruiter/candidates` - Search and filter candidates
- **GET** `/api/recruiter/candidates/:candidateId` - Get detailed candidate profile

### AI/Matching
- **POST** `/api/ai/match-job/:jobId` - Compute matches for all users for a given job

## Frontend Integration

### 1. API Service Layer

#### `src/services/recruiterService.js`
Complete API service with all recruiter endpoints:
- Centralized API calls using the modern `apiClient`
- Proper error handling and response formatting
- Support for query parameters and pagination
- Bulk operations for jobs and applications
- Export functionality for jobs

#### `src/hooks/useRecruiterApi.js`
Custom React hook providing:
- Centralized loading states
- Error handling with toast notifications
- Success messages for user actions
- Bulk operation handling
- Optimistic updates

### 2. Updated Components

#### Dashboard (`src/pages/recruiter/Dashboard.jsx`)
- Integrated with `useRecruiterApi` hook
- Real-time dashboard data loading
- Error handling and loading states
- Theme toggle functionality

#### Jobs Management (`src/pages/recruiter/Jobs.jsx`)
- Complete CRUD operations for jobs
- Bulk operations (update, delete, export)
- Advanced filtering and pagination
- Real-time job status updates

#### Applications (`src/pages/recruiter/Applications.jsx`)
- Job-specific application viewing
- Application status management
- Bulk application operations
- Match score visualization

#### Candidates (`src/pages/recruiter/Candidates.jsx`)
- Advanced candidate search and filtering
- Candidate profile viewing
- Save candidate functionality
- Communication features (placeholder)

#### Create Job (`src/pages/recruiter/CreateJob.jsx`)
- Multi-step job creation process
- Form validation and error handling
- Real-time preview
- Skills and location suggestions

### 3. API Client Configuration

#### `src/services/apiClient.js`
Modern API client with:
- Automatic token management
- Request/response interceptors
- Error handling with user-friendly messages
- Retry logic for failed requests
- Response caching for GET requests

#### `src/constants/index.js`
Updated with recruiter-specific API endpoints:
```javascript
RECRUITER: {
  DASHBOARD: '/recruiter/dashboard',
  JOBS: '/recruiter/jobs',
  JOB_APPLICANTS: '/recruiter/job',
  APPLICATIONS: '/recruiter/applications',
  CANDIDATES: '/recruiter/candidates',
  ANALYTICS: '/recruiter/analytics',
}
```

## Features Implemented

### 1. Error Handling
- Centralized error handling in the API hook
- User-friendly error messages via toast notifications
- Automatic retry for network errors
- Graceful fallbacks for failed operations

### 2. Loading States
- Global loading state management
- Component-specific loading indicators
- Optimistic updates for better UX
- Skeleton loading for data-heavy components

### 3. User Feedback
- Success messages for completed actions
- Error messages for failed operations
- Progress indicators for long-running operations
- Confirmation dialogs for destructive actions

### 4. Bulk Operations
- Bulk job updates (status changes)
- Bulk job deletion
- Bulk application status updates
- Progress tracking for bulk operations

### 5. Data Management
- Real-time data synchronization
- Optimistic updates
- Cache invalidation
- Pagination support

## Testing

### Test Component
A comprehensive test component is available at `src/test-components/RecruiterApiTest.jsx` that allows testing all API endpoints:

```jsx
import RecruiterApiTest from '@/test-components/RecruiterApiTest'

// Use in your app for testing
<RecruiterApiTest />
```

### Test Features
- Individual endpoint testing
- Job-specific operations testing
- Candidate operations testing
- Real-time test result tracking
- Console logging for debugging

## Usage Examples

### Using the API Hook
```jsx
import { useRecruiterApi } from '@/hooks/useRecruiterApi'

function MyComponent() {
  const { loading, error, getJobs, createJob } = useRecruiterApi()
  
  const handleCreateJob = async (jobData) => {
    try {
      await createJob(jobData)
      // Success message shown automatically
    } catch (err) {
      // Error handled automatically
    }
  }
  
  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {/* Your component content */}
    </div>
  )
}
```

### Direct API Service Usage
```jsx
import { recruiterService } from '@/services/recruiterService'

// Get jobs with filters
const jobs = await recruiterService.getJobs({
  search: 'developer',
  status: 'open',
  page: 1,
  limit: 10
})

// Create a new job
const newJob = await recruiterService.createJob({
  title: 'Senior Developer',
  description: 'Full-stack development role',
  location: 'San Francisco',
  requiredSkills: ['JavaScript', 'React', 'Node.js'],
  experienceMin: 3,
  experienceMax: 5,
  salaryRange: { min: 80000, max: 120000 }
})
```

## Security

### Authentication
- All API calls include JWT tokens automatically
- Token refresh handled transparently
- Automatic logout on token expiration

### Authorization
- Role-based access control
- Recruiter-specific data filtering
- Job ownership verification

## Performance

### Optimization Features
- Response caching for GET requests
- Request deduplication
- Lazy loading for large datasets
- Pagination for all list endpoints

### Monitoring
- Request duration logging
- Error rate tracking
- Performance metrics collection

## Future Enhancements

### Planned Features
1. Real-time notifications for new applications
2. Advanced candidate matching algorithms
3. Interview scheduling integration
4. Email communication system
5. Advanced analytics and reporting
6. Mobile app support

### API Extensions
1. WebSocket support for real-time updates
2. File upload for job attachments
3. Advanced search with AI
4. Integration with external job boards
5. Automated candidate screening

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check if user is logged in
   - Verify token validity
   - Clear localStorage and re-login

2. **Network Errors**
   - Check internet connection
   - Verify API server is running
   - Check CORS configuration

3. **Data Loading Issues**
   - Check API response format
   - Verify data structure matches expected format
   - Check console for detailed error messages

### Debug Mode
Enable debug mode by setting `VITE_DEBUG=true` in your environment variables to see detailed API request/response logging.

## Conclusion

The recruiter API integration provides a robust, user-friendly interface for all recruiter operations. The implementation follows modern React patterns with proper error handling, loading states, and user feedback. The modular design makes it easy to extend and maintain.

For questions or issues, refer to the test component or check the browser console for detailed error information.

