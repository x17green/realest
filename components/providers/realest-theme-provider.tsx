'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface RealEstThemeContextType {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: 'light' | 'dark'
}

const RealEstThemeContext = createContext<RealEstThemeContextType | undefined>(undefined)

interface RealEstThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
}

export function RealEstThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'realest-theme',
  enableSystem = true,
}: RealEstThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Calculate the effective theme (light or dark)
  const effectiveTheme = theme === 'system' ? systemTheme : theme

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme
      if (stored && (stored === 'light' || stored === 'dark' || (enableSystem && stored === 'system'))) {
        setTheme(stored)
      } else if (enableSystem) {
        // Default to system if no stored preference
        setTheme('system')
      } else {
        // Fallback to system preference without 'system' option
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    } catch (error) {
      // Fallback if localStorage is not available
      console.warn('localStorage not available, using default theme')
      if (enableSystem) {
        setTheme('system')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    }

    setMounted(true)
  }, [storageKey, enableSystem])

  // Apply theme to document and save to localStorage
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove('light', 'dark')

    // Add effective theme class
    root.classList.add(effectiveTheme)

    // Update data attribute for CSS targeting
    root.setAttribute('data-theme', effectiveTheme)

    // Save theme preference to localStorage
    try {
      localStorage.setItem(storageKey, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [effectiveTheme, theme, mounted, storageKey])

  const value = {
    theme,
    effectiveTheme,
    systemTheme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
    toggleTheme: () => {
      if (enableSystem) {
        // Cycle through light → dark → system
        if (theme === 'light') {
          setTheme('dark')
        } else if (theme === 'dark') {
          setTheme('system')
        } else {
          setTheme('light')
        }
      } else {
        // Toggle between light and dark only
        setTheme(theme === 'light' ? 'dark' : 'light')
      }
    },
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  return (
    <RealEstThemeContext.Provider value={value}>
      <div
        className={`min-h-screen bg-background text-foreground transition-colors duration-300`}
        data-theme={effectiveTheme}
      >
        {/* RealEST CSS Custom Properties - New Brand Colors */}
        {/* Off-White #F8F9F7 | Acid Green #ADF434 | Dark Green #07402F | Deep Neutral #2E322E */}
        <style jsx global>{`
          :root {
            /* HeroUI Component Overrides for RealEST Brand */
            /* Primary colors mapped to Acid Green */
            --heroui-primary-50: var(--accent-50);
            --heroui-primary-100: var(--accent-100);
            --heroui-primary-200: var(--accent-200);
            --heroui-primary-300: var(--accent-300);
            --heroui-primary-400: var(--accent-400);
            --heroui-primary-500: var(--primary-accent);
            --heroui-primary-600: var(--accent-600);
            --heroui-primary-700: var(--accent-700);
            --heroui-primary-800: var(--accent-800);
            --heroui-primary-900: var(--accent-900);

            /* Secondary colors mapped to Dark Green */
            --heroui-secondary-50: var(--green-50);
            --heroui-secondary-100: var(--green-100);
            --heroui-secondary-200: var(--green-200);
            --heroui-secondary-300: var(--green-300);
            --heroui-secondary-400: var(--green-400);
            --heroui-secondary-500: var(--primary-dark);
            --heroui-secondary-600: var(--green-600);
            --heroui-secondary-700: var(--green-700);
            --heroui-secondary-800: var(--green-800);
            --heroui-secondary-900: var(--green-900);

            /* Success colors */
            --heroui-success-50: var(--color-success-light);
            --heroui-success-500: var(--color-success);

            /* Warning colors */
            --heroui-warning-50: var(--color-warning-light);
            --heroui-warning-500: var(--color-warning);

            /* Danger/Error colors */
            --heroui-danger-50: var(--color-error-light);
            --heroui-danger-500: var(--color-error);

            /* Background surfaces */
            --heroui-background: var(--background);
            --heroui-foreground: var(--foreground);
            --heroui-card-background: var(--card);
            --heroui-card-foreground: var(--card-foreground);

            /* Default border radius for RealEST */
            --heroui-radius-small: var(--radius-sm);
            --heroui-radius-medium: var(--radius-md);
            --heroui-radius-large: var(--radius-lg);

            /* Focus ring colors - Acid Green */
            --heroui-focus-ring-color: var(--primary-accent);
            --heroui-focus-ring-offset: 2px;
            --heroui-focus-ring-width: 2px;
          }

          .dark {
            /* Dark mode specific overrides */
            --heroui-background: var(--background);
            --heroui-foreground: var(--foreground);
          }

          /* RealEST Button Overrides */
          .heroui-button[data-variant="primary"] {
            background: var(--primary-accent);
            color: var(--primary-dark);
            font-weight: 600;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="primary"]:hover:not([data-disabled="true"]) {
            background: var(--accent-600);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }

          .heroui-button[data-variant="secondary"] {
            background: var(--primary-dark);
            color: var(--primary-light);
            font-weight: 600;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="secondary"]:hover:not([data-disabled="true"]) {
            background: var(--green-600);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }

          .heroui-button[data-variant="tertiary"] {
            background: transparent;
            color: var(--foreground);
            border: 1px solid var(--border);
            font-weight: 500;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="tertiary"]:hover:not([data-disabled="true"]) {
            background: var(--accent);
            color: var(--accent-foreground);
            border-color: var(--primary-dark);
          }

          .heroui-button[data-variant="ghost"] {
            background: transparent;
            color: var(--foreground);
            font-weight: 500;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="ghost"]:hover:not([data-disabled="true"]) {
            background: var(--accent);
            color: var(--accent-foreground);
          }

          .heroui-button[data-variant="danger"] {
            background: var(--color-error);
            color: white;
            font-weight: 600;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="danger"]:hover:not([data-disabled="true"]) {
            background: var(--color-error-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }

          /* RealEST Card Overrides */
          .heroui-card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-sm);
            transition: all var(--duration-normal) var(--ease-out);
            font-family: var(--font-body);
          }

          .heroui-card:hover {
            box-shadow: var(--shadow-md);
            border-color: var(--primary-dark)/20;
          }

          .heroui-card[data-variant="transparent"] {
            background: transparent;
            border: none;
            box-shadow: none;
          }

          .heroui-card[data-variant="secondary"] {
            background: var(--muted);
            border-color: var(--border);
          }

          .heroui-card[data-variant="tertiary"] {
            background: var(--accent);
            border-color: var(--primary-dark)/30;
          }

          .heroui-card[data-variant="quaternary"] {
            background: var(--primary-dark)/5;
            border-color: var(--primary-dark)/20;
          }

          .heroui-card__header {
            font-family: var(--font-heading);
          }

          .heroui-card__title {
            font-family: var(--font-heading);
            font-weight: 600;
            color: var(--foreground);
          }

          .heroui-card__description {
            color: var(--muted-foreground);
            font-size: 0.875rem;
            line-height: 1.5;
          }

          /* RealEST Input/TextField Overrides */
          .heroui-input,
          .heroui-textarea {
            background: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            font-family: var(--font-body);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-input:focus,
          .heroui-textarea:focus {
            border-color: var(--primary-accent);
            box-shadow: 0 0 0 2px var(--primary-accent)/20;
            outline: none;
          }

          .heroui-input[data-invalid="true"],
          .heroui-textarea[data-invalid="true"] {
            border-color: var(--color-error);
          }

          .heroui-input[data-invalid="true"]:focus,
          .heroui-textarea[data-invalid="true"]:focus {
            box-shadow: 0 0 0 2px var(--color-error)/20;
          }

          .heroui-label {
            font-family: var(--font-body);
            font-weight: 500;
            color: var(--foreground);
            font-size: 0.875rem;
          }

          .heroui-description {
            color: var(--muted-foreground);
            font-size: 0.75rem;
            font-family: var(--font-body);
          }

          .heroui-field-error {
            color: var(--color-error);
            font-size: 0.75rem;
            font-family: var(--font-body);
            font-weight: 500;
          }

          /* RealEST Avatar Overrides */
          .heroui-avatar {
            border-radius: var(--radius-full);
            font-family: var(--font-body);
            font-weight: 600;
          }

          .heroui-avatar[data-color="accent"] {
            background: var(--primary-dark);
            color: var(--primary-light);
          }

          .heroui-avatar[data-color="success"] {
            background: var(--color-success);
            color: white;
          }

          .heroui-avatar[data-color="warning"] {
            background: var(--color-warning);
            color: var(--primary-dark);
          }

          .heroui-avatar[data-color="danger"] {
            background: var(--color-error);
            color: white;
          }

          /* RealEST Chip Overrides */
          .heroui-chip {
            font-family: var(--font-body);
            font-weight: 500;
            border-radius: var(--radius-full);
            transition: all var(--duration-fast) var(--ease-out);
          }

          .heroui-chip[data-color="accent"] {
            background: var(--primary-dark)/10;
            color: var(--primary-dark);
            border: 1px solid var(--primary-dark)/20;
          }

          .heroui-chip[data-color="primary"] {
            background: var(--primary-accent)/15;
            color: var(--primary-dark);
            border: 1px solid var(--primary-accent)/30;
          }

          .heroui-chip[data-color="success"] {
            background: var(--color-success)/10;
            color: var(--color-success-dark);
            border: 1px solid var(--color-success)/20;
          }

          .heroui-chip[data-color="warning"] {
            background: var(--color-warning)/10;
            color: var(--color-warning-dark);
            border: 1px solid var(--color-warning)/20;
          }

          .heroui-chip[data-color="danger"] {
            background: var(--color-error)/10;
            color: var(--color-error);
            border: 1px solid var(--color-error)/20;
          }

          /* RealEST Tabs Overrides */
          .heroui-tabs__list {
            background: var(--muted);
            border-radius: var(--radius-lg);
            padding: 0.25rem;
          }

          .heroui-tabs__tab {
            font-family: var(--font-body);
            color: var(--muted-foreground);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-tabs__tab[data-selected="true"] {
            background: var(--background);
            color: var(--foreground);
            box-shadow: var(--shadow-sm);
          }

          .heroui-tabs__indicator {
            background: var(--primary-accent);
            border-radius: var(--radius-md);
          }

          /* RealEST Typography */
          .heroui-heading {
            font-family: var(--font-heading);
          }

          /* RealEST animations */
          @keyframes realest-fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .heroui-card,
          .heroui-button,
          .heroui-input {
            animation: realest-fade-in var(--duration-normal) var(--ease-out);
          }

          /* Nigerian market specific styles - updated with green palette */
          .nigerian-badge {
            background: var(--primary-dark)/10;
            color: var(--primary-dark);
            border: 1px solid var(--primary-dark)/20;
          }

          .property-verified {
            background: var(--color-success)/10;
            color: var(--color-success-dark);
            border: 1px solid var(--color-success)/20;
          }

          .property-pending {
            background: var(--color-warning)/10;
            color: var(--color-warning-dark);
            border: 1px solid var(--color-warning)/20;
          }

          /* Focus visible improvements - Acid Green */
          .heroui-button:focus-visible,
          .heroui-input:focus-visible,
          .heroui-textarea:focus-visible {
            outline: 2px solid var(--primary-accent);
            outline-offset: 2px;
          }

          /* Brand accent glow effect */
          .glow-accent {
            box-shadow: 0 0 20px var(--primary-accent)/30,
                        0 0 40px var(--primary-accent)/20;
          }

          .glow-dark {
            box-shadow: 0 0 20px var(--primary-dark)/30,
                        0 0 40px var(--primary-dark)/20;
          }

          /* System theme indicator for debugging */
          .theme-indicator {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: 8px 12px;
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--muted-foreground);
            z-index: 1000;
            pointer-events: none;
          }
        `}</style>
        {children}
      </div>
    </RealEstThemeContext.Provider>
  )
}

export function useRealEstTheme() {
  const context = useContext(RealEstThemeContext)

  if (context === undefined) {
    throw new Error('useRealEstTheme must be used within a RealEstThemeProvider')
  }

  return context
}

// Theme persistence helper
export function getThemeFromStorage(storageKey = 'realest-theme'): Theme | null {
  try {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) as Theme | null
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
  }
  return null
}

// System theme detection helper
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}
