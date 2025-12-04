'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sun } from 'lucide-react'

// Dynamically import the theme toggle to prevent SSR issues
const ThemeToggleDynamic = dynamic(
  () => import('./theme-toggle').then(mod => ({ default: mod.ThemeToggle })),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="default"
        className="h-8 w-8 opacity-50"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Loading theme toggle...</span>
      </Button>
    )
  }
)

const ThemeToggleCompactDynamic = dynamic(
  () => import('./theme-toggle').then(mod => ({ default: mod.ThemeToggleCompact })),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="default"
        className="h-8 w-8 opacity-50"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Loading theme toggle...</span>
      </Button>
    )
  }
)

const ThemeToggleDropdownDynamic = dynamic(
  () => import('./theme-toggle').then(mod => ({ default: mod.ThemeToggleDropdown })),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="default"
        className="opacity-50"
        disabled
      >
        <Sun className="h-4 w-4" />
        <span className="text-sm ml-2">Loading...</span>
        <span className="sr-only">Loading theme toggle...</span>
      </Button>
    )
  }
)

// Export the dynamic versions
export { ThemeToggleDynamic as ThemeToggle }
export { ThemeToggleCompactDynamic as ThemeToggleCompact }
export { ThemeToggleDropdownDynamic as ThemeToggleDropdown }

// Default export
export default ThemeToggleCompactDynamic
