"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Icons for different property statuses
import {
  Home,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  Eye,
  Heart
} from "lucide-react";

const propertyStatusChipVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-200 whitespace-nowrap cursor-default",
  {
    variants: {
      status: {
        available: [
          "bg-success/10 text-success border-success/20",
          "hover:bg-success/15 hover:scale-105",
          "dark:bg-success/15 dark:border-success/30"
        ],
        pending: [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:scale-105",
          "dark:bg-warning/15 dark:border-warning/30"
        ],
        booked: [
          "bg-error/10 text-error border-error/20",
          "hover:bg-error/15 hover:scale-105",
          "dark:bg-error/15 dark:border-error/30"
        ],
        unavailable: [
          "bg-muted/50 text-muted-foreground border-muted/30",
          "hover:bg-muted/60 hover:scale-105",
          "dark:bg-muted/30 dark:border-muted/40"
        ],
        featured: [
          "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20",
          "hover:from-primary/15 hover:to-accent/15 hover:scale-105",
          "dark:from-neon-primary/10 dark:to-accent-violet/10 dark:text-neon-primary dark:border-neon-primary/30"
        ],
        "fresh-listing": [
          "bg-info/10 text-info border-info/20",
          "hover:bg-info/15 hover:scale-105",
          "dark:bg-info/15 dark:border-info/30"
        ],
        exclusive: [
          "bg-gradient-to-r from-accent-violet/10 to-primary/10 text-accent-violet border-accent-violet/20",
          "hover:from-accent-violet/15 hover:to-primary/15 hover:scale-105",
          "dark:from-accent-violet/15 dark:to-neon-primary/15 dark:text-accent-violet dark:border-accent-violet/30"
        ],
        "under-offer": [
          "bg-warning/10 text-warning border-warning/20",
          "hover:bg-warning/15 hover:scale-105",
          "dark:bg-warning/15 dark:border-warning/30"
        ]
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] gap-0.5",
        md: "px-2.5 py-1 text-xs gap-1",
        lg: "px-3 py-1.5 text-sm gap-1.5"
      },
      priority: {
        low: "opacity-80",
        medium: "opacity-90",
        high: "opacity-100 ring-1 ring-current ring-opacity-20"
      },
      animated: {
        true: "animate-pulse",
        false: ""
      },
      interactive: {
        true: "cursor-pointer hover:shadow-sm active:scale-95",
        false: "cursor-default"
      }
    },
    defaultVariants: {
      status: "available",
      size: "md",
      priority: "medium",
      animated: false,
      interactive: false
    }
  }
);

const statusConfig = {
  available: {
    icon: CheckCircle,
    label: "Available",
    description: "Property is available for viewing and booking",
    color: "success"
  },
  pending: {
    icon: Clock,
    label: "Pending",
    description: "Application or booking is pending approval",
    color: "warning"
  },
  booked: {
    icon: Calendar,
    label: "Booked",
    description: "Property is currently booked",
    color: "error"
  },
  unavailable: {
    icon: XCircle,
    label: "Unavailable",
    description: "Property is not available at this time",
    color: "muted"
  },
  featured: {
    icon: Star,
    label: "Featured",
    description: "Premium featured listing",
    color: "primary"
  },
  "fresh-listing": {
    icon: Eye,
    label: "Fresh Listing",
    description: "Recently added property",
    color: "info"
  },
  exclusive: {
    icon: Heart,
    label: "Exclusive",
    description: "Exclusive premium property",
    color: "accent"
  },
  "under-offer": {
    icon: Home,
    label: "Under Offer",
    description: "Property has received an offer",
    color: "warning"
  }
} as const;

export interface PropertyStatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof propertyStatusChipVariants> {
  status: keyof typeof statusConfig;
  showIcon?: boolean;
  showTooltip?: boolean;
  customLabel?: string;
  lastUpdated?: Date;
  onStatusClick?: (status: string) => void;
}

export function PropertyStatusChip({
  className,
  status,
  size,
  priority,
  animated,
  interactive,
  showIcon = true,
  showTooltip = true,
  customLabel,
  lastUpdated,
  onStatusClick,
  onClick,
  ...props
}: PropertyStatusChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    if (onStatusClick) {
      onStatusClick(status);
    }
    if (onClick) {
      onClick(e);
    }
  }, [status, onStatusClick, onClick]);

  const chipContent = (
    <span
      className={cn(
        propertyStatusChipVariants({
          status,
          size,
          priority,
          animated,
          interactive: interactive || !!onStatusClick
        }),
        className
      )}
      role="status"
      aria-label={`${config.description}${lastUpdated ? ` (Updated: ${lastUpdated.toLocaleDateString()})` : ''}`}
      onClick={interactive || onStatusClick ? handleClick : undefined}
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
    </span>
  );

  // If tooltip is disabled, return just the chip
  if (!showTooltip) {
    return chipContent;
  }

  // Return chip with tooltip information
  return (
    <div className="group relative inline-flex">
      {chipContent}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-max">
        <div className="text-xs text-popover-foreground">
          <div className="font-semibold mb-1">{config.description}</div>
          {lastUpdated && (
            <div className="text-muted-foreground">
              Last updated: {lastUpdated.toLocaleDateString()} at {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-popover border-r border-b border-border rotate-45"></div>
      </div>
    </div>
  );
}

// Preset chip components for common use cases
export function AvailableChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="available" />;
}

export function PendingChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="pending" animated={true} />;
}

export function BookedChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="booked" />;
}

export function FeaturedChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="featured" priority="high" />;
}

export function ExclusiveChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="exclusive" priority="high" />;
}

export function FreshListingChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="fresh-listing" />;
}

export function UnderOfferChip(props: Omit<PropertyStatusChipProps, 'status'>) {
  return <PropertyStatusChip {...props} status="under-offer" animated={true} />;
}

// Compound component for multiple status chips
export function PropertyStatusGroup({
  statuses,
  className,
  showTooltip = true,
  onStatusClick,
  ...props
}: {
  statuses: Array<{
    status: keyof typeof statusConfig;
    size?: PropertyStatusChipProps['size'];
    priority?: PropertyStatusChipProps['priority'];
    customLabel?: string;
    lastUpdated?: Date;
  }>;
  className?: string;
  showTooltip?: boolean;
  onStatusClick?: (status: string) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap gap-1.5", className)}
      role="group"
      aria-label="Property status indicators"
      {...props}
    >
      {statuses.map((statusProps, index) => (
        <PropertyStatusChip
          key={`${statusProps.status}-${index}`}
          {...statusProps}
          showTooltip={showTooltip}
          onStatusClick={onStatusClick}
        />
      ))}
    </div>
  );
}

// Helper function to determine chip priority based on status
export function getStatusPriority(status: keyof typeof statusConfig): PropertyStatusChipProps['priority'] {
  const highPriority: Array<keyof typeof statusConfig> = ['featured', 'exclusive', 'under-offer'];
  const mediumPriority: Array<keyof typeof statusConfig> = ['available', 'fresh-listing', 'booked'];

  if (highPriority.includes(status)) return 'high';
  if (mediumPriority.includes(status)) return 'medium';
  return 'low';
}

// Helper function to determine if status should be animated
export function isStatusAnimated(status: keyof typeof statusConfig): boolean {
  const animatedStatuses: Array<keyof typeof statusConfig> = ['pending', 'under-offer'];
  return animatedStatuses.includes(status);
}

export { propertyStatusChipVariants, statusConfig };
export type { PropertyStatusChipProps };
