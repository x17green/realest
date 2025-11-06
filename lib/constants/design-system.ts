/**
 * RealEST Design System Constants
 * Central source of truth for design tokens and system values
 */

// ================================================================
// BRAND IDENTITY
// ================================================================

export const BRAND = {
  name: 'RealEST',
  tagline: 'Find Your Next Move',
  domain: 'realest.ng',
  description: 'Nigeria\'s premier geo-verified property marketplace',
} as const;

// ================================================================
// COLOR TOKENS
// ================================================================

export const COLORS = {
  // Primary Brand Colors (Hex)
  brand: {
    dark: '#242834',
    violet: '#7D53FF',
    neon: '#B6FF00',
  },

  // OKLCH Color Values
  oklch: {
    primaryDark: 'oklch(0.26 0.08 258)',
    primaryViolet: 'oklch(0.67 0.25 286)',
    primaryNeon: 'oklch(0.91 0.20 127)',
  },

  // Semantic Colors
  semantic: {
    success: 'oklch(0.75 0.15 142)',
    warning: 'oklch(0.82 0.18 95)',
    error: 'oklch(0.62 0.2 20)',
    info: 'oklch(0.78 0.12 270)',
  },

  // Usage Guidelines (60-30-10 Rule)
  usage: {
    foundation: 'var(--primary-dark)', // 60% usage
    secondary: 'var(--primary-violet)', // 30% usage
    accent: 'var(--primary-neon)', // 10% usage
  },
} as const;

// ================================================================
// TYPOGRAPHY SYSTEM
// ================================================================

export const TYPOGRAPHY = {
  // Font Families
  fonts: {
    display: '"Lufga", "Playfair Display", serif',
    heading: '"Neulis Neue", "Space Grotesk", sans-serif',
    body: '"Space Grotesk", "Open Sauce Sans", "Inter", sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Monaco", monospace',
  },

  // Type Scale (clamp values for fluid typography)
  scale: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
    '3xl': 'clamp(2rem, 1.7rem + 1.5vw, 2.5rem)',
    '4xl': 'clamp(2.5rem, 2rem + 2.5vw, 3.5rem)',
    '5xl': 'clamp(3.5rem, 3rem + 2.5vw, 4.5rem)',
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },

  // Usage Guidelines
  usage: {
    display: ['Hero sections', 'Brand moments', 'Landing page headlines'],
    heading: ['Page titles', 'Section headers', 'Card titles'],
    body: ['Paragraphs', 'Descriptions', 'Form labels', 'General content'],
    mono: ['Property coordinates', 'IDs', 'Technical data', 'Code'],
  },
} as const;

// ================================================================
// SPACING SYSTEM
// ================================================================

export const SPACING = {
  // 4px base unit scale
  scale: {
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    7: '1.75rem',  // 28px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    28: '7rem',    // 112px
    32: '8rem',    // 128px
  },

  // Component-specific spacing
  component: {
    cardPadding: 'var(--space-6)',        // 24px
    formSpacing: 'var(--space-4)',        // 16px
    sectionSpacing: 'var(--space-16)',    // 64px
    buttonPaddingX: 'var(--space-4)',     // 16px
    buttonPaddingY: 'var(--space-3)',     // 12px
  },
} as const;

// ================================================================
// BORDER RADIUS SYSTEM
// ================================================================

export const RADIUS = {
  scale: {
    xs: '0.25rem',    // 4px
    sm: '0.375rem',   // 6px
    md: '0.625rem',   // 10px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    full: '9999px',
  },

  // Component-specific radius
  component: {
    card: 'var(--radius-xl)',
    button: 'var(--radius-md)',
    input: 'var(--radius-lg)',
    badge: 'var(--radius-full)',
  },
} as const;

// ================================================================
// SHADOW SYSTEM
// ================================================================

export const SHADOWS = {
  // Shadow scale
  scale: {
    xs: '0 1px 2px oklch(0.26 0.08 258 / 0.05)',
    sm: '0 1px 3px oklch(0.26 0.08 258 / 0.1), 0 1px 2px oklch(0.26 0.08 258 / 0.06)',
    md: '0 4px 6px oklch(0.26 0.08 258 / 0.07), 0 2px 4px oklch(0.26 0.08 258 / 0.06)',
    lg: '0 10px 15px oklch(0.26 0.08 258 / 0.1), 0 4px 6px oklch(0.26 0.08 258 / 0.05)',
    xl: '0 20px 25px oklch(0.26 0.08 258 / 0.1), 0 10px 10px oklch(0.26 0.08 258 / 0.04)',
    '2xl': '0 25px 50px oklch(0.26 0.08 258 / 0.15), 0 15px 20px oklch(0.26 0.08 258 / 0.05)',
  },

  // Colored shadows for interactive elements
  colored: {
    neon: '0 4px 14px oklch(0.91 0.20 127 / 0.25)',
    violet: '0 4px 14px oklch(0.67 0.25 286 / 0.25)',
  },

  // Component-specific shadows
  component: {
    card: 'var(--shadow-md)',
    cardHover: 'var(--shadow-lg)',
    button: 'var(--shadow-sm)',
    buttonHover: 'var(--shadow-md)',
  },
} as const;

// ================================================================
// ANIMATION TOKENS
// ================================================================

export const ANIMATION = {
  // Duration values
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Easing functions
  easing: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Common transitions
  transition: {
    default: 'all 300ms cubic-bezier(0, 0, 0.2, 1)',
    fast: 'all 150ms cubic-bezier(0, 0, 0.2, 1)',
    colors: 'color 300ms cubic-bezier(0, 0, 0.2, 1), background-color 300ms cubic-bezier(0, 0, 0.2, 1)',
    transform: 'transform 300ms cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

// ================================================================
// RESPONSIVE BREAKPOINTS
// ================================================================

export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ================================================================
// COMPONENT LIBRARY STRATEGY
// ================================================================

export const COMPONENT_LIBRARY = {
  // Usage percentages and guidelines
  heroui: {
    percentage: 70,
    usage: [
      'Buttons (all variants)',
      'Navigation components',
      'Forms and inputs',
      'Cards and containers',
      'Modals and drawers',
      'Data display components',
      'Layout components',
    ],
  },

  untitledui: {
    percentage: 25,
    usage: [
      'Status badges and chips',
      'Progress indicators',
      'Alert banners',
      'Small pills and tags',
      'Tooltip components',
      'Loading states',
      'Empty states',
    ],
  },

  shadcn: {
    percentage: 5,
    usage: [
      'Complex data tables',
      'Advanced form patterns',
      'Specialized interactions',
    ],
  },
} as const;

// ================================================================
// NIGERIAN MARKET SPECIFIC CONSTANTS
// ================================================================

export const NIGERIAN_MARKET = {
  // Property types specific to Nigeria
  propertyTypes: [
    'Boys Quarters (BQ)',
    'Duplex',
    'Bungalow',
    'Estate Property',
    'Individual House',
    'Face-me-I-face-you',
    'Self-contained',
    'Mini Flat',
  ],

  // Infrastructure indicators
  infrastructure: [
    'NEPA/Power Supply',
    'Borehole/Water Supply',
    'Internet Connectivity',
    'Good Road Network',
    'Drainage System',
  ],

  // Security features
  securityFeatures: [
    'Gated Community',
    'Security Post',
    'CCTV Surveillance',
    'Perimeter Fencing',
    'Security Guards',
  ],

  // Nigerian states (for location selection)
  states: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ],
} as const;

// ================================================================
// UX WRITING & MICROCOPY
// ================================================================

export const MICROCOPY = {
  // Voice and tone principles
  voiceTone: {
    confident: 'Confident but not arrogant',
    clear: 'Clear and direct, avoid jargon',
    supportive: 'Supportive and encouraging',
    culturallySensitive: 'Nigerian-aware and culturally sensitive',
  },

  // Primary CTAs
  primaryCTAs: [
    'Find Your Space',
    'Start Exploring',
    'Get Verified',
    'View Properties',
    'See Details',
    'Book a Tour',
    'List Your Property',
    'Continue Setup',
  ],

  // Secondary CTAs
  secondaryCTAs: [
    'Learn More',
    'View All',
    'Filter Results',
    'Save for Later',
    'Share Property',
    'Contact Owner',
    'Schedule Visit',
    'Update Listing',
  ],

  // Status messages
  statusMessages: {
    verification: {
      pending: 'Verification in progress...',
      inReview: 'Under review by our team',
      verified: 'Property verified ✓',
      rejected: 'Verification failed',
    },
    availability: {
      available: 'Available now',
      pending: 'Application pending',
      rented: 'Currently rented',
      sold: 'Sold',
      inactive: 'Not available',
    },
    geotag: {
      verified: 'Location verified ✓',
      pending: 'Location verification pending',
      failed: 'Location verification needed',
    },
  },
} as const;

// ================================================================
// ACCESSIBILITY STANDARDS
// ================================================================

export const ACCESSIBILITY = {
  // Color contrast requirements
  contrast: {
    normalText: 4.5, // WCAG AA standard
    largeText: 3.0,  // WCAG AA standard
    uiElements: 3.0, // WCAG AA standard
  },

  // Focus indicators
  focusRing: {
    width: '2px',
    offset: '2px',
    color: 'var(--ring)',
  },

  // Screen reader labels
  ariaLabels: {
    verified: 'This property is verified and geotagged',
    pending: 'This property is pending verification',
    menu: 'Main navigation menu',
    search: 'Search properties',
    filter: 'Filter search results',
  },
} as const;

// ================================================================
// PERFORMANCE GUIDELINES
// ================================================================

export const PERFORMANCE = {
  // Image optimization
  images: {
    formats: ['webp', 'jpeg'],
    maxSize: '1MB',
    responsive: true,
    lazyLoading: true,
  },

  // Font loading strategy
  fonts: {
    display: 'swap',
    preload: ['Space Grotesk', 'Neulis Neue'],
    fallbacks: {
      display: 'serif',
      heading: 'sans-serif',
      body: 'sans-serif',
      mono: 'monospace',
    },
  },

  // Bundle optimization
  bundling: {
    codesplitting: true,
    treeshaking: true,
    compression: 'gzip',
  },
} as const;

// ================================================================
// EXPORT ALL CONSTANTS
// ================================================================

export const DESIGN_SYSTEM = {
  BRAND,
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  ANIMATION,
  BREAKPOINTS,
  COMPONENT_LIBRARY,
  NIGERIAN_MARKET,
  MICROCOPY,
  ACCESSIBILITY,
  PERFORMANCE,
} as const;

// Type exports for TypeScript support
export type BrandColors = typeof COLORS.brand;
export type SemanticColors = typeof COLORS.semantic;
export type FontFamilies = typeof TYPOGRAPHY.fonts;
export type SpacingScale = typeof SPACING.scale;
export type RadiusScale = typeof RADIUS.scale;
export type ShadowScale = typeof SHADOWS.scale;
export type AnimationDuration = typeof ANIMATION.duration;
export type AnimationEasing = typeof ANIMATION.easing;
export type Breakpoints = typeof BREAKPOINTS;
export type NigerianStates = typeof NIGERIAN_MARKET.states;
export type PropertyTypes = typeof NIGERIAN_MARKET.propertyTypes;
