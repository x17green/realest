"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface RealEstLogoProps {
  /**
   * icon        → realest-logo.svg (mark only, square)
   * wordmark    → realest-wordmark-{theme}.svg (RealEST Connect text)
   * full        → realest-logo-wordmark-{theme}.svg (mark + wordmark + tagline)
   * minimal     → alias for icon
   * text        → alias for wordmark
   */
  variant?: 'icon' | 'wordmark' | 'full' | 'minimal' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * dark → use -dark.svg variant (dark logo, for light backgrounds)
   * light → use -light.svg variant (light logo, for dark backgrounds)
   * auto → renders both, CSS dark-mode class switches between them
   */
  theme?: 'dark' | 'light' | 'auto';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

// Height (px) per size step — width is derived from per-variant aspect ratio
const HEIGHT: Record<NonNullable<RealEstLogoProps['size']>, number> = {
  xs:    20,
  sm:    32,
  md:    44,
  lg:    56,
  xl:    72,
  '2xl': 96,
};

// Aspect ratios (width / height) measured from SVG viewBox
const ASPECT = {
  icon:     1,     // 17.653 × 17.653
  wordmark: 1.969, // 249.23 × 126.59
  full:     3.011, // 387.49 × 128.69
} as const;

function resolveVariant(v: NonNullable<RealEstLogoProps['variant']>) {
  if (v === 'minimal') return 'icon';
  if (v === 'text') return 'wordmark';
  return v;
}

const RealEstLogo: React.FC<RealEstLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  animated = false,
  className,
  onClick,
}) => {
  const resolved = resolveVariant(variant);
  const h = HEIGHT[size];
  const w = Math.round(h * ASPECT[resolved]);

  const imgProps = {
    height: h,
    width: resolved === 'icon' ? h : w,
    style: { height: h, width: resolved === 'icon' ? h : w } as React.CSSProperties,
  };

  const renderIcon = () => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/realest-logo.svg" alt="RealEST Connect" {...imgProps} className="block" />
  );

  const renderThemed = (fileBase: 'realest-wordmark' | 'realest-logo-wordmark', alt: string) => {
    if (theme === 'dark') {
      return <img src={`/${fileBase}-dark.svg`} alt={alt} {...imgProps} className="block" />;// eslint-disable-line @next/next/no-img-element
    }
    if (theme === 'light') {
      return <img src={`/${fileBase}-light.svg`} alt={alt} {...imgProps} className="block" />;// eslint-disable-line @next/next/no-img-element
    }
    // auto — show/hide via Tailwind dark mode
    return (
      <>
        {/* Light mode: dark logo (dark text on light bg) */}
        <img src={`/${fileBase}-dark.svg`} alt={alt} {...imgProps} className="block dark:hidden" />{/* eslint-disable-line @next/next/no-img-element */}
        {/* Dark mode: light logo (light text on dark bg) */}
        <img src={`/${fileBase}-light.svg`} alt={alt} {...imgProps} className="hidden dark:block" />{/* eslint-disable-line @next/next/no-img-element */}
      </>
    );
  };

  return (
    <div
      className={cn(
        'inline-flex items-center',
        animated && 'transition-opacity duration-200 hover:opacity-80',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {resolved === 'icon'     && renderIcon()}
      {resolved === 'wordmark' && renderThemed('realest-wordmark', 'RealEST Connect')}
      {resolved === 'full'     && renderThemed('realest-logo-wordmark', 'RealEST Connect — Find Your Next Move Seamlessly')}
    </div>
  );
};

// ─── Pre-configured convenience exports ───────────────────────────────────────

/** Full logo with wordmark + tagline, auto theme, md size */
export const HeaderLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="xl" animated {...props} />
);

/** Wordmark only, auto theme, sm size */
export const FooterLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="wordmark" size="lg" {...props} />
);

/** Large full logo for hero sections */
export const HeroLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="2xl" animated {...props} />
);

/** Icon/mark only for mobile nav, favicons, avatars */
export const MobileLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="icon" size="md" {...props} />
);

export const LoadingLogo = (props: Omit<RealEstLogoProps, 'animated'>) => (
  <RealEstLogo animated={true} {...props} />
);

export default RealEstLogo;
