"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Icons for different verification statuses
import {
  MapPin,
  FileCheck,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPinned
} from "lucide-react";

const verificationBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 whitespace-nowrap",
  {
    variants: {
      status: {
        "geo-verified": [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/20 hover:border-success/30",
          "dark:bg-success/20 dark:text-success-foreground dark:border-success/40"
        ],
        "doc-verified": [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/20 hover:border-info/30",
          "dark:bg-info/20 dark:text-info-foreground dark:border-info/40"
        ],
        "fully-verified": [
          "bg-primary/10 text-primary border-primary/20",
          "hover:bg-primary/20 hover:border-primary/30",
          "dark:bg-neon-primary/20 dark:text-neon-primary dark:border-neon-primary/40"
        ],
        "pending": [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/20 hover:border-warning/30",
          "dark:bg-warning/20 dark:text-warning-foreground dark:border-warning/40"
        ],
        "failed": [
          "bg-error/10 text-error border-error/20",
          "hover:bg-error/20 hover:border-error/30",
          "dark:bg-error/20 dark:text-error-foreground dark:border-error/40"
        ],
        "available": [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/20 hover:border-success/30",
          "dark:bg-success/20 dark:text-success-foreground dark:border-success/40"
        ],
        "booked": [
          "bg-error/10 text-error border-error/20",
          "hover:bg-error/20 hover:border-error/30",
          "dark:bg-error/20 dark:text-error-foreground dark:border-error/40"
        ],
        "exclusive": [
          "bg-accent-violet/10 text-accent-violet border-accent-violet/20",
          "hover:bg-accent-violet/20 hover:border-accent-violet/30",
          "dark:bg-accent-violet/20 dark:text-accent-violet-foreground dark:border-accent-violet/40"
        ]
      },
      size: {
        sm: "px-2 py-1 text-xs gap-1",
        md: "px-3 py-1.5 text-xs gap-1.5",
        lg: "px-4 py-2 text-sm gap-2"
      },
      animated: {
        true: "animate-pulse",
        false: ""
      }
    },
    defaultVariants: {
      status: "pending",
      size: "md",
      animated: false
    }
  }
);

const statusConfig = {
  "geo-verified": {
    icon: MapPinned,
    label: "Geo-Verified",
    description: "Location verified with GPS coordinates"
  },
  "doc-verified": {
    icon: FileCheck,
    label: "Doc-Verified",
    description: "Documents verified by AI analysis"
  },
  "fully-verified": {
    icon: Shield,
    label: "RealEST Verified",
    description: "Fully verified by RealEST team"
  },
  "pending": {
    icon: Clock,
    label: "Pending",
    description: "Verification in progress"
  },
  "failed": {
    icon: AlertTriangle,
    label: "Failed",
    description: "Verification failed"
  },
  "available": {
    icon: CheckCircle2,
    label: "Available",
    description: "Property is available for viewing"
  },
  "booked": {
    icon: AlertTriangle,
    label: "Booked",
    description: "Property is currently booked"
  },
  "exclusive": {
    icon: Shield,
    label: "Exclusive",
    description: "Premium exclusive listing"
  }
} as const;

export interface VerificationBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof verificationBadgeVariants> {
  status: keyof typeof statusConfig;
  confidence?: number; // 0-100 for ML confidence scores
  lastUpdated?: Date;
  coordinates?: [number, number];
  showIcon?: boolean;
  showTooltip?: boolean;
  customLabel?: string;
}

export function VerificationBadge({
  className,
  status,
  size,
  animated,
  confidence,
  lastUpdated,
  coordinates,
  showIcon = true,
  showTooltip = true,
  customLabel,
  ...props
}: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badgeContent = (
    <div
      className={cn(verificationBadgeVariants({ status, size, animated }), className)}
      role="status"
      aria-label={`${config.description}${confidence ? ` (${confidence}% confidence)` : ''}`}
      {...props}
    >
      {showIcon && (
        <Icon
          className={cn(
            "shrink-0",
            size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"
          )}
          aria-hidden="true"
        />
      )}
      <span className="font-medium">
        {customLabel || config.label}
      </span>
      {confidence && confidence > 0 && (
        <span className="text-[10px] opacity-75 font-mono">
          {confidence}%
        </span>
      )}
    </div>
  );

  // If tooltip is disabled, return just the badge
  if (!showTooltip) {
    return badgeContent;
  }

  // Return badge with tooltip information
  return (
    <div className="group relative inline-flex">
      {badgeContent}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
        <div className="text-xs text-popover-foreground">
          <div className="font-semibold mb-1">{config.description}</div>
          {lastUpdated && (
            <div className="text-muted-foreground">
              Updated: {lastUpdated.toLocaleDateString()}
            </div>
          )}
          {coordinates && (
            <div className="text-muted-foreground font-mono text-[10px]">
              {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
            </div>
          )}
          {confidence && (
            <div className="text-muted-foreground">
              Confidence: {confidence}%
            </div>
          )}
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
      </div>
    </div>
  );
}

// Preset badge components for common use cases
export function GeoVerifiedBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="geo-verified" />;
}

export function DocVerifiedBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="doc-verified" />;
}

export function FullyVerifiedBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="fully-verified" />;
}

export function PendingBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="pending" animated={true} />;
}

export function AvailableBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="available" />;
}

export function BookedBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="booked" />;
}

export function ExclusiveBadge(props: Omit<VerificationBadgeProps, 'status'>) {
  return <VerificationBadge {...props} status="exclusive" />;
}

// Compound component for multiple verification statuses
export function VerificationBadgeGroup({
  badges,
  className,
  ...props
}: {
  badges: Array<Omit<VerificationBadgeProps, 'showTooltip'>>;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Property verification statuses"
      {...props}
    >
      {badges.map((badge, index) => (
        <VerificationBadge
          key={`${badge.status}-${index}`}
          {...badge}
          showTooltip={true}
        />
      ))}
    </div>
  );
}

export { verificationBadgeVariants };
// export type { VerificationBadgeProps };
