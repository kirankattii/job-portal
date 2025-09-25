/**
 * Modern App Component
 * Main application component with routing and global providers
 */

import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import useThemeStore from '@/stores/themeStore'
import router from '@/routes'
import '@/design-tokens/tokens.css'

function App() {
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme
    initializeTheme()
  }, [initializeTheme])

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <RouterProvider router={router} />
      
      {/* Global toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--surface-elevated))',
            color: 'hsl(var(--text-primary))',
            border: '1px solid hsl(var(--border-primary))',
            borderRadius: '0.75rem',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--color-success-500))',
              secondary: 'hsl(var(--color-success-50))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--color-error-500))',
              secondary: 'hsl(var(--color-error-50))',
            },
          },
          loading: {
            iconTheme: {
              primary: 'hsl(var(--color-primary-500))',
              secondary: 'hsl(var(--color-primary-50))',
            },
          },
        }}
      />
    </div>
  )
}

export default App