"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface RealEstLogoProps {
  variant?: 'full' | 'icon' | 'text' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  theme?: 'light' | 'dark' | 'auto';
  animated?: boolean;
  hideTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

const RealEstLogo: React.FC<RealEstLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  animated = false,
  hideTagline = false,
  className,
  onClick,
}) => {
  // Size mappings for different components
  const sizeConfig = {
    xs: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      container: 'gap-1',
      tagline: 'text-xs',
    },
    sm: {
      icon: 'w-6 h-6',
      text: 'text-base',
      container: 'gap-2',
      tagline: 'text-xs',
    },
    md: {
      icon: 'w-8 h-8',
      text: 'text-lg',
      container: 'gap-2',
      tagline: 'text-xs',
    },
    lg: {
      icon: 'w-10 h-10',
      text: 'text-xl',
      container: 'gap-3',
      tagline: 'text-sm',
    },
    xl: {
      icon: 'w-12 h-12',
      text: 'text-2xl',
      container: 'gap-3',
      tagline: 'text-sm',
    },
    '2xl': {
      icon: 'w-16 h-16 -mr-6',
      text: 'text-3xl',
      container: 'gap-4',
      tagline: 'text-xs',
    },
  };

  const config = sizeConfig[size];

  // Location Pin Icon Component
  const LocationIcon = ({ className = '' }: { className?: string }) => (
    <div className={cn('relative', className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer pin shape with gradient */}
        <defs>
          <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.89 0.24 128)" />
            <stop offset="50%" stopColor="oklch(0.85 0.22 130)" />
            <stop offset="100%" stopColor="oklch(0.30 0.06 165)" />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.89 0.24 128)" />
            <stop offset="100%" stopColor="oklch(0.85 0.22 130)" />
          </linearGradient>
        </defs>

        {/* Drop shadow */}
        <ellipse cx="50" cy="85" rx="15" ry="5" fill="oklch(0.30 0.06 165)" opacity="0.2" />

        {/* Main pin shape */}
        <path
          d="M50 10 C35 10, 25 20, 25 35 C25 50, 50 75, 50 75 C50 75, 75 50, 75 35 C75 20, 65 10, 50 10 Z"
          fill="url(#pinGradient)"
          stroke="oklch(0.30 0.06 165)"
          strokeWidth="1"
        />

        {/* Inner circle background */}
        <circle cx="50" cy="35" r="18" fill="oklch(0.30 0.06 165)" />

        {/* Buildings silhouette */}
        <g fill="url(#buildingGradient)">
          {/* Building 1 */}
          <rect x="38" y="25" width="5" height="15" rx="1" />
          <rect x="39" y="27" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="41" y="27" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="39" y="30" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="41" y="30" width="1" height="1" fill="oklch(0.30 0.06 165)" />

          {/* Building 2 (tallest) */}
          <rect x="45" y="20" width="6" height="20" rx="1" />
          <rect x="46" y="22" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="48" y="22" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="49.5" y="22" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="46" y="25" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="48" y="25" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="49.5" y="25" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="46" y="28" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="48" y="28" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="49.5" y="28" width="1" height="1" fill="oklch(0.30 0.06 165)" />

          {/* Building 3 */}
          <rect x="53" y="27" width="5" height="13" rx="1" />
          <rect x="54" y="29" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="56" y="29" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="54" y="32" width="1" height="1" fill="oklch(0.30 0.06 165)" />
          <rect x="56" y="32" width="1" height="1" fill="oklch(0.30 0.06 165)" />

          {/* Small buildings */}
          <rect x="35" y="32" width="3" height="8" rx="0.5" />
          <rect x="59" y="30" width="3" height="10" rx="0.5" />
          <rect x="32" y="35" width="2" height="5" rx="0.5" />
          <rect x="63" y="33" width="2" height="7" rx="0.5" />
        </g>

        {/* Ground/landscape */}
        <path
          d="M 32 42 Q 40 40, 45 41 Q 52 42, 58 40 Q 65 39, 68 41 L 68 45 L 32 45 Z"
          fill="oklch(0.89 0.24 128)"
          opacity="0.6"
        />
      </svg>
    </div>
  );

  // Text Logo Component
  const TextLogo = ({
    className = '',
    showTagline = true,
    hideTagline = false,
  }: {
    className?: string;
    showTagline?: boolean;
    hideTagline?: boolean;
  }) => (
    <div className={cn('flex flex-col', className)}>
      <div className={cn(
        'font-bold bg-linear-to-r from-accent via-accent/70 to-accent bg-clip-text text-transparent',
        config.text
      )}>
        RealEST
      </div>
      {showTagline && variant !== 'minimal' && !hideTagline && (
        <div className={cn(
          'text-muted-foreground font-medium -mt-1',
          config.tagline
        )}>
          Find Your Next Move
        </div>
      )}
    </div>
  );

  // Animation classes
  const animationClasses = animated ? 'group-hover:scale-105 transition-all duration-200' : '';
  const containerClasses = onClick ? 'cursor-pointer group' : '';

  // Render different variants
  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return (
          <div className={cn(animationClasses, config.icon)}>
            <LocationIcon />
          </div>
        );

      case 'text':
        return (
          <TextLogo className={animationClasses} hideTagline={hideTagline} />
        );

      case 'minimal':
        return (
          <div className={cn('flex items-center', config.container, animationClasses)}>
            <div className={config.icon}>
              <LocationIcon />
            </div>
            <TextLogo showTagline={false} />
          </div>
        );

      case 'full':
      default:
        return (
          <div className={cn('flex items-center', config.container, animationClasses)}>
            <div className={config.icon}>
              <LocationIcon />
            </div>
            <TextLogo hideTagline={hideTagline} />
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center',
        containerClasses,
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {renderLogo()}
    </div>
  );
};

// Pre-configured variants for common use cases
export const HeaderLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="md" animated {...props} />
);

export const FooterLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="sm" {...props} />
);

export const HeroLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="2xl" animated {...props} />
);

export const MobileLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="icon" size="md" {...props} />
);

export const LoadingLogo = (props: Omit<RealEstLogoProps, 'animated'>) => (
  <RealEstLogo animated={true} {...props} />
);

export default RealEstLogo;
