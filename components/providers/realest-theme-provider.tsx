'use client'

import React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface RealEstThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const RealEstThemeContext = createContext<RealEstThemeContextType | undefined>(undefined)

interface RealEstThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function RealEstThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'realest-theme',
}: RealEstThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme
    if (stored) {
      setTheme(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
    setMounted(true)
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    localStorage.setItem(storageKey, theme)
  }, [theme, mounted, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
    toggleTheme: () => {
      setTheme(theme === 'light' ? 'dark' : 'light')
    },
  }

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
        data-theme={theme}
      >
        {/* RealEST CSS Custom Properties */}
        <style jsx global>{`
          :root {
            /* HeroUI Component Overrides for RealEST Brand */
            --heroui-primary-50: var(--primary-neon);
            --heroui-primary-100: var(--primary-neon);
            --heroui-primary-200: var(--primary-neon);
            --heroui-primary-300: var(--primary-neon);
            --heroui-primary-400: var(--primary-neon);
            --heroui-primary-500: var(--primary-neon);
            --heroui-primary-600: var(--primary-neon);
            --heroui-primary-700: var(--primary-neon);
            --heroui-primary-800: var(--primary-neon);
            --heroui-primary-900: var(--primary-neon);

            /* Secondary colors mapped to violet */
            --heroui-secondary-50: var(--violet-50);
            --heroui-secondary-100: var(--violet-100);
            --heroui-secondary-200: var(--violet-200);
            --heroui-secondary-300: var(--violet-300);
            --heroui-secondary-400: var(--violet-400);
            --heroui-secondary-500: var(--primary-violet);
            --heroui-secondary-600: var(--violet-600);
            --heroui-secondary-700: var(--violet-700);
            --heroui-secondary-800: var(--violet-800);
            --heroui-secondary-900: var(--violet-900);

            /* Success colors */
            --heroui-success-50: var(--color-success);
            --heroui-success-500: var(--color-success);

            /* Warning colors */
            --heroui-warning-50: var(--color-warning);
            --heroui-warning-500: var(--color-warning);

            /* Danger/Error colors */
            --heroui-danger-50: var(--color-error);
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

            /* Focus ring colors */
            --heroui-focus-ring-color: var(--primary-neon);
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
            background: var(--primary-neon);
            color: var(--primary-dark);
            font-weight: 600;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="primary"]:hover:not([data-disabled="true"]) {
            background: var(--neon-500);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
          }

          .heroui-button[data-variant="secondary"] {
            background: var(--primary-violet);
            color: white;
            font-weight: 600;
            font-family: var(--font-body);
            border-radius: var(--radius-md);
            transition: all var(--duration-normal) var(--ease-out);
          }

          .heroui-button[data-variant="secondary"]:hover:not([data-disabled="true"]) {
            background: var(--violet-600);
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
            border-color: var(--primary-violet);
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
            border-color: var(--primary-violet)/20;
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
            border-color: var(--primary-violet)/30;
          }

          .heroui-card[data-variant="quaternary"] {
            background: var(--primary-violet)/5;
            border-color: var(--primary-violet)/20;
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
            border-color: var(--primary-violet);
            box-shadow: 0 0 0 2px var(--primary-violet)/20;
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
            background: var(--primary-violet);
            color: white;
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
            background: var(--primary-violet)/10;
            color: var(--primary-violet);
            border: 1px solid var(--primary-violet)/20;
          }

          .heroui-chip[data-color="success"] {
            background: var(--color-success)/10;
            color: var(--color-success);
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
            background: var(--primary-neon);
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

          /* Nigerian market specific styles */
          .nigerian-badge {
            background: var(--color-nigerian-green)/10;
            color: var(--color-nigerian-green);
            border: 1px solid var(--color-nigerian-green)/20;
          }

          .property-verified {
            background: var(--color-success)/10;
            color: var(--color-success);
            border: 1px solid var(--color-success)/20;
          }

          .property-pending {
            background: var(--color-warning)/10;
            color: var(--color-warning-dark);
            border: 1px solid var(--color-warning)/20;
          }

          /* Focus visible improvements */
          .heroui-button:focus-visible,
          .heroui-input:focus-visible,
          .heroui-textarea:focus-visible {
            outline: 2px solid var(--primary-neon);
            outline-offset: 2px;
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
