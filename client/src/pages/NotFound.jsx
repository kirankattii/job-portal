/**
 * 404 Not Found Page
 * Modern error page with helpful navigation
 */

import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'
import Button from '@/components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950">
      <div className="max-w-md w-full mx-auto text-center px-6">
        {/* Error illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-200 dark:text-primary-800 mb-4">
            404
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Page Not Found
          </h1>
          <p className="text-text-secondary text-lg">
            Sorry, we couldn't find the page you're looking for. 
            It might have been moved, deleted, or doesn't exist.
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/"
              leftIcon={<Home className="w-4 h-4" />}
              size="lg"
            >
              Go Home
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              size="lg"
            >
              Go Back
            </Button>
          </div>
          
          <div className="pt-4">
            <Button
              variant="ghost"
              as={Link}
              to="/jobs"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Browse Jobs
            </Button>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-8 text-sm text-text-tertiary">
          <p>
            If you believe this is an error, please{' '}
            <Link to="/contact" className="text-primary-500 hover:text-primary-600 underline">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
