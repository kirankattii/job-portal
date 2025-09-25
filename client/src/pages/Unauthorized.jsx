/**
 * Unauthorized Access Page
 * Shown when user doesn't have required permissions
 */

import { Link } from 'react-router-dom'
import { Shield, ArrowLeft, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-error-50 to-warning-50 dark:from-error-950 dark:to-warning-950">
      <div className="max-w-md w-full mx-auto text-center px-6">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-error-500" />
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-error-500 to-warning-500 mx-auto rounded-full"></div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Access Denied
          </h1>
          <p className="text-text-secondary text-lg">
            You don't have permission to access this page. 
            Please contact your administrator if you believe this is an error.
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
        </div>

        {/* Help text */}
        <div className="mt-8 text-sm text-text-tertiary">
          <p>
            Need help?{' '}
            <Link to="/contact" className="text-primary-500 hover:text-primary-600 underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
