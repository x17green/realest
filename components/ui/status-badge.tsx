import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body whitespace-nowrap transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        verified: "bg-success/10 text-success border border-success/20 shadow-sm",
        pending: "bg-warning/10 text-warning border border-warning/20 shadow-sm",
        rejected: "bg-error/10 text-error border border-error/20 shadow-sm",
        available: "bg-primary/10 text-primary border border-primary/20 shadow-sm",
        rented: "bg-gray-500/10 text-gray-600 border border-gray-300 shadow-sm",
        sold: "bg-gray-700/10 text-gray-700 border border-gray-400 shadow-sm",
        new: "bg-brand-violet/10 text-brand-violet border border-brand-violet/20 shadow-sm",
        featured: "bg-gradient-to-r from-brand-violet/10 to-brand-neon/10 text-brand-violet border border-brand-violet/20 shadow-sm",
        info: "bg-info/10 text-info border border-info/20 shadow-sm",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      variant: "verified",
      size: "md",
      interactive: false,
    },
  }
)

const statusIcons = {
  verified: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  pending: (
    <svg className="w-3 h-3 fill-current animate-spin" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" fill="none"/>
    </svg>
  ),
  rejected: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  available: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="2" fill="currentColor"/>
    </svg>
  ),
  rented: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 6h6M6 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  sold: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  new: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 2l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L6 2z" fill="currentColor"/>
    </svg>
  ),
  featured: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 1l1.5 4.5H12l-3.75 2.5L9.5 11 6 8.5 2.5 11l1.25-3L0 5.5h4.5L6 1z" fill="currentColor"/>
    </svg>
  ),
  info: (
    <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="4" r="1" fill="currentColor"/>
      <path d="M6 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  showIcon?: boolean
  icon?: React.ReactNode
}

function StatusBadge({
  className,
  variant = "verified",
  size = "md",
  interactive = false,
  children,
  showIcon = true,
  icon,
  ...props
}: StatusBadgeProps) {
  const IconComponent = icon || (showIcon && variant && statusIcons[variant])

  return (
    <span
      className={cn(statusBadgeVariants({ variant, size, interactive, className }))}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {IconComponent && (
        <span className="shrink-0" aria-hidden="true">
          {IconComponent}
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  )
}

// Predefined status badge components for common use cases
function VerifiedBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="verified"
      className={className}
      aria-label="Property is verified and geotagged"
      {...props}
    >
      Verified
    </StatusBadge>
  )
}

function PendingBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="pending"
      className={className}
      aria-label="Property verification is pending"
      {...props}
    >
      Pending
    </StatusBadge>
  )
}

function AvailableBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="available"
      className={className}
      aria-label="Property is available for rent or sale"
      {...props}
    >
      Available
    </StatusBadge>
  )
}

function FeaturedBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="featured"
      className={className}
      aria-label="This is a featured property"
      {...props}
    >
      Featured
    </StatusBadge>
  )
}

function NewBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="new"
      className={className}
      aria-label="This is a newly listed property"
      {...props}
    >
      New
    </StatusBadge>
  )
}

// Nigerian-specific status badges
function BQAvailableBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="available"
      className={className}
      aria-label="Boys Quarters available"
      showIcon={false}
      {...props}
    >
      BQ Available
    </StatusBadge>
  )
}

function GatedCommunityBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="info"
      className={className}
      aria-label="Located in a gated community"
      showIcon={false}
      {...props}
    >
      Gated Community
    </StatusBadge>
  )
}

function PowerIncludedBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return (
    <StatusBadge
      variant="featured"
      className={className}
      aria-label="Power supply included"
      showIcon={false}
      {...props}
    >
      Power Included
    </StatusBadge>
  )
}

export {
  StatusBadge,
  VerifiedBadge,
  PendingBadge,
  AvailableBadge,
  FeaturedBadge,
  NewBadge,
  BQAvailableBadge,
  GatedCommunityBadge,
  PowerIncludedBadge,
  statusBadgeVariants,
}

export type { StatusBadgeProps }
