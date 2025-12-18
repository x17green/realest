'use client'

import React, { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useRealEstTheme } from '@/components/providers/RealEstThemeProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({
  variant = 'button',
  size = 'default',
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, effectiveTheme, setTheme, toggleTheme, systemTheme } = useRealEstTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={cn('gap-2 opacity-50', className)}
        disabled
      >
        <Sun className="h-4 w-4" />
        {showLabel && <span className="text-sm">Loading...</span>}
      </Button>
    )
  }

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return effectiveTheme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
  }

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${systemTheme})`
    }
    return effectiveTheme === 'light' ? 'Light' : 'Dark'
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            className={cn(
              'gap-2 justify-start',
              showLabel ? 'w-auto' : 'w-auto px-2',
              className
            )}
          >
            {getThemeIcon()}
            {showLabel && <span className="text-sm">{getThemeLabel()}</span>}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={cn(
              'gap-2 cursor-pointer',
              theme === 'light' && 'bg-accent text-accent-foreground'
            )}
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
            {theme === 'light' && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className={cn(
              'gap-2 cursor-pointer',
              theme === 'dark' && 'bg-accent text-accent-foreground'
            )}
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
            {theme === 'dark' && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className={cn(
              'gap-2 cursor-pointer',
              theme === 'system' && 'bg-accent text-accent-foreground'
            )}
          >
            <Monitor className="h-4 w-4" />
            <span>System</span>
            {theme === 'system' && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Simple button variant
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn(
        'gap-2',
        showLabel ? 'justify-start' : 'px-2',
        className
      )}
      aria-label={`Switch to ${
        theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
      } theme`}
    >
      {getThemeIcon()}
      {showLabel && <span className="text-sm">{getThemeLabel()}</span>}
    </Button>
  )
}

// Compact version for headers/navbars
export function ThemeToggleCompact({
  className,
  ...props
}: Omit<ThemeToggleProps, 'variant' | 'showLabel'>) {
  return (
    <ThemeToggle
      variant="button"
      showLabel={false}
      className={cn('h-8 w-8', className)}
      {...props}
    />
  )
}

// Dropdown version with full labels
export function ThemeToggleDropdown({
  className,
  ...props
}: Omit<ThemeToggleProps, 'variant'>) {
  return (
    <ThemeToggle
      variant="dropdown"
      showLabel={true}
      className={className}
      {...props}
    />
  )
}

// Theme status indicator (useful for debugging/development)
export function ThemeIndicator() {
  const [mounted, setMounted] = useState(false)
  const { theme, effectiveTheme, systemTheme } = useRealEstTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (process.env.NODE_ENV !== 'development' || !mounted) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground z-50 pointer-events-none">
      Theme: {theme}
      {theme === 'system' && ` (${systemTheme})`}
      <br />
      Active: {effectiveTheme}
    </div>
  )
}
