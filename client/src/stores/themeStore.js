/**
 * Theme Store
 * Manages theme state and dark mode functionality
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'light', // 'light' | 'dark' | 'system'
      isDark: false,
      
      // Theme actions
      setTheme: (theme) => {
        set({ theme })
        
        // Apply theme to document
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        set({ isDark })
        
        // Update document class
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      },
      
      initializeTheme: () => {
        const { theme } = get()
        get().setTheme(theme)
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          if (get().theme === 'system') {
            get().setTheme('system')
          }
        }
        
        mediaQuery.addEventListener('change', handleChange)
        
        // Return cleanup function
        return () => mediaQuery.removeEventListener('change', handleChange)
      },
      
      // Color scheme preferences
      colorScheme: 'primary', // 'primary' | 'secondary' | 'accent'
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      
      // Animation preferences
      reducedMotion: false,
      setReducedMotion: (reduced) => {
        set({ reducedMotion: reduced })
        
        // Apply to document
        if (reduced) {
          document.documentElement.style.setProperty('--animation-duration', '0.01ms')
          document.documentElement.style.setProperty('--animation-iteration-count', '1')
        } else {
          document.documentElement.style.removeProperty('--animation-duration')
          document.documentElement.style.removeProperty('--animation-iteration-count')
        }
      },
      
      // Font preferences
      fontSize: 'normal', // 'small' | 'normal' | 'large'
      setFontSize: (size) => set({ fontSize: size }),
      
      // High contrast mode
      highContrast: false,
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      
      // Reset to defaults
      resetTheme: () => {
        set({
          theme: 'light',
          isDark: false,
          colorScheme: 'primary',
          reducedMotion: false,
          fontSize: 'normal',
          highContrast: false,
        })
        get().setTheme('light')
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
        colorScheme: state.colorScheme,
        reducedMotion: state.reducedMotion,
        fontSize: state.fontSize,
        highContrast: state.highContrast,
      }),
    }
  )
)

export default useThemeStore