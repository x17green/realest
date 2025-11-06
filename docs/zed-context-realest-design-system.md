# RealEST Design System - Zed AI Context Documentation

This is a comprehensive context file for AI assistants working on the RealEST (realest.ng) property marketplace project. It contains all essential design system architecture, component patterns, brand guidelines, and implementation strategies.

## Available MCP (Model Context Protocol) Servers

This project has access to specialized MCP servers for real-time documentation and examples:

### HeroUI v3 MCP Server
- **Purpose**: Get up-to-date HeroUI v3 component documentation, examples, and API references
- **Usage**: When working with HeroUI components, the MCP can provide:
  - Component prop definitions and TypeScript interfaces
  - Working code examples with proper implementation patterns
  - Latest API changes and best practices
  - Compound component patterns and usage guidelines
- **Note**: HeroUI v3 is in alpha, so always check MCP for latest breaking changes

### Supabase MCP Server  
- **Purpose**: Access current Supabase documentation and implementation patterns
- **Usage**: For database, authentication, and backend logic:
  - SQL query patterns and best practices
  - Authentication flow implementations
  - Real-time subscription patterns
  - Storage and file upload examples
  - Row Level Security (RLS) policy examples

**Important**: Always consult the appropriate MCP server when implementing components or backend features to ensure you're using the most current APIs and best practices.

## Project Overview

**Project Name:** RealEST - Vetted & Verified Property Marketplace
**Domain:** realest.ng
**Primary Market:** Nigeria (with global expansion potential)
**Tech Stack:** Next.js 16, React 19, HeroUI v3, UntitledUI, Tailwind CSS v4, Supabase
**Brand Essence:** "Find Your Next Move" - Movement, discovery, trust, and authenticity

## Core Brand Identity

### Brand Values
- **Trust & Verification:** Geotag-verified properties with physical vetting
- **Nigerian Cultural Authenticity:** Local market focus with cultural sensitivity
- **Premium Experience:** Sophisticated design with accessible interactions
- **Transparency:** Clear verification processes and property information

### Visual Language
- **Modern & Minimal:** Clean interfaces with purposeful use of color
- **Trust-Building:** Visual indicators of verification and credibility
- **Movement-Focused:** Dynamic typography and smooth interactions
- **Geospatially-Aware:** Map-centric design patterns

## Color System (OKLCH-based)

### Primary Color Palette (60-30-10 Rule)

```css
/* Primary Colors */
--color-primary-dark: #242834;     /* 60% - Foundation color */
--color-primary-neon: #B6FF00;     /* 10% - Accent/CTA color */
--color-primary-violet: #7D53FF;   /* 30% - Secondary accent */

/* OKLCH Equivalents */
--primary-dark: oklch(0.26 0.08 258);
--primary-neon: oklch(0.91 0.20 127);
--primary-violet: oklch(0.67 0.25 286);
```

### Extended Grayscale System

```css
/* Derived from primary dark (#242834) */
--gray-50: oklch(0.98 0.005 258);   /* Almost white with subtle navy tint */
--gray-100: oklch(0.95 0.01 258);
--gray-200: oklch(0.88 0.015 258);
--gray-300: oklch(0.78 0.02 258);
--gray-400: oklch(0.65 0.025 258);
--gray-500: oklch(0.52 0.03 258);
--gray-600: oklch(0.42 0.035 258);
--gray-700: oklch(0.32 0.04 258);   /* Close to primary dark */
--gray-800: oklch(0.26 0.045 258);  /* Primary dark */
--gray-900: oklch(0.18 0.05 258);   /* Darker than primary */
```

### Semantic Color Tokens

```css
/* Status Colors */
--color-success: oklch(0.75 0.15 142);    /* Verified properties */
--color-warning: oklch(0.82 0.18 95);     /* Pending verification */
--color-error: oklch(0.62 0.2 20);        /* Rejected/Issues */
--color-info: oklch(0.78 0.12 270);       /* Informational */

/* Text Hierarchy */
--text-primary: var(--gray-900);
--text-secondary: var(--gray-600);
--text-muted: var(--gray-500);
--text-disabled: var(--gray-400);
--text-inverse: var(--gray-50);
```

### Color Usage Guidelines

**60% Primary Dark (#242834)**
- Page backgrounds in dark mode
- Navigation headers
- Primary text content
- Main container backgrounds
- Footer areas

**30% Violet Secondary (#7D53FF)**
- Secondary buttons
- Feature highlights
- Gradient overlays
- Progress indicators
- Interactive elements

**10% Neon Accent (#B6FF00)**
- Primary CTAs
- Success states
- Verified badges
- Active states
- Key highlights

## Typography System

### Typeface Hierarchy

```css
/* Font Stack */
--font-display: "Lufga", "Playfair Display", serif;
--font-heading: "Neulis Neue", "Space Grotesk", sans-serif;
--font-body: "Space Grotesk", "Open Sauce Sans", "Inter", sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

### Fluid Typography Scale

```css
/* Responsive Type Scale */
--font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
--font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
--font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
--font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
--font-size-3xl: clamp(2rem, 1.7rem + 1.5vw, 2.5rem);
--font-size-4xl: clamp(2.5rem, 2rem + 2.5vw, 3.5rem);
--font-size-5xl: clamp(3.5rem, 3rem + 2.5vw, 4.5rem);
```

### Typography Usage Patterns

**Display (Lufga):** Hero headings, major brand moments, landing page headlines
**Heading (Neulis Neue):** Page titles, section headers, card titles
**Body (Space Grotesk):** Paragraphs, descriptions, form labels, general content
**Mono (JetBrains Mono):** Property coordinates, IDs, technical data, code

## Component Library Strategy

### Library Decision Matrix

**HeroUI (Primary - 70%)**
- Buttons (all variants)
- Navigation components
- Forms and inputs
- Cards and containers
- Modals and drawers
- Data display components
- Layout components

**UntitledUI (Status & State - 25%)**
- Status badges and chips
- Progress indicators
- Alert banners
- Small pills and tags
- Tooltip components
- Loading states
- Empty states

**Shadcn/UI (Complex Patterns - 5%)**
- Complex data tables
- Advanced form patterns
- Specialized interactions

### Component Customization Standards

```typescript
// Example: Branded HeroUI Button
function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      className="bg-primary-neon hover:bg-primary-neon/90 text-primary-dark font-semibold tracking-tight"
      {...props}
    >
      {children}
    </Button>
  );
}

// Example: Status Badge with UntitledUI
function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const statusConfig = {
    verified: { color: 'success', label: 'Verified' },
    pending: { color: 'warning', label: 'Pending' },
    rejected: { color: 'error', label: 'Rejected' }
  };
  
  return (
    <Badge variant={statusConfig[status].color}>
      {statusConfig[status].label}
    </Badge>
  );
}
```

## Spacing & Layout System

### Spacing Scale

```css
/* Consistent 4px base unit */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Layout Patterns

**Container System:**
- Max-width: 1440px
- Responsive padding: 16px mobile, 24px tablet, 40px desktop
- Center-aligned with auto margins

**Grid Systems:**
- Property listings: 1 column mobile, 2-3 tablet, 3-4 desktop
- Form layouts: Single column mobile, 2-column desktop
- Dashboard: Flexible grid based on content

**Component Spacing:**
- Card internal padding: 24px
- Form element spacing: 16px
- Section spacing: 64px-96px
- Button padding: 16px horizontal, 12px vertical

## Border & Shadow System

### Border Radius

```css
/* Minimal, consistent radius system */
--radius-sm: 6px;     /* Small elements */
--radius-md: 10px;    /* Default buttons, inputs */
--radius-lg: 16px;    /* Cards, modals */
--radius-xl: 24px;    /* Hero sections, major containers */
--radius-full: 9999px; /* Pills, badges */
```

### Shadow System

```css
/* Subtle, layered shadows */
--shadow-xs: 0 1px 2px oklch(0.26 0.08 258 / 0.05);
--shadow-sm: 0 1px 3px oklch(0.26 0.08 258 / 0.1), 0 1px 2px oklch(0.26 0.08 258 / 0.06);
--shadow-md: 0 4px 6px oklch(0.26 0.08 258 / 0.07), 0 2px 4px oklch(0.26 0.08 258 / 0.06);
--shadow-lg: 0 10px 15px oklch(0.26 0.08 258 / 0.1), 0 4px 6px oklch(0.26 0.08 258 / 0.05);
--shadow-xl: 0 20px 25px oklch(0.26 0.08 258 / 0.1), 0 10px 10px oklch(0.26 0.08 258 / 0.04);
```

## UX Writing & Microcopy

### Voice & Tone Principles

- **Confident but not arrogant:** "Find Your Next Move" vs "The Best Properties"
- **Clear and direct:** Avoid jargon, use simple language
- **Supportive and encouraging:** Help users succeed in their property journey
- **Nigerian-aware:** Cultural sensitivity and local market understanding

### CTA Library

**Primary Actions:**
- "Find Your Space"
- "Start Exploring" 
- "Get Verified"
- "View Properties"
- "See Details"
- "Book a Tour"
- "List Your Property"
- "Continue Setup"

**Secondary Actions:**
- "Learn More"
- "View All"
- "Filter Results"
- "Save for Later"
- "Share Property"
- "Contact Owner"
- "Schedule Visit"
- "Update Listing"

### Status Messaging Patterns

```typescript
const statusMessages = {
  verification: {
    pending: "Verification in progress...",
    inReview: "Under review by our team",
    verified: "Property verified ✓",
    rejected: "Verification failed",
  },
  availability: {
    available: "Available now",
    pending: "Application pending", 
    rented: "Currently rented",
    sold: "Sold",
    inactive: "Not available"
  },
  geotag: {
    verified: "Location verified ✓",
    pending: "Location verification pending",
    failed: "Location verification needed"
  }
};
```

### Error and Success Messages

**Error Messages:**
- "Please check your internet connection and try again"
- "This property is no longer available"
- "Please fill in all required fields"
- "Something went wrong. We're working to fix it"

**Success Messages:**
- "Property successfully listed!"
- "Verification documents submitted"
- "Your inquiry has been sent"
- "Property saved to your favorites"

## State & Status Design Patterns

### Badge Component System

```typescript
type BadgeVariant = 'verified' | 'pending' | 'available' | 'rented' | 'new' | 'featured';

function StatusBadge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  const styles = {
    verified: 'bg-success text-white',
    pending: 'bg-warning text-gray-900', 
    available: 'bg-primary-neon text-primary-dark',
    rented: 'bg-gray-500 text-white',
    new: 'bg-primary-violet text-white',
    featured: 'bg-gradient-to-r from-primary-violet to-primary-neon text-white'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
```

### Progress Indicators

```typescript
function VerificationProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const progress = (step / totalSteps) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-primary-neon h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

## Responsive Design Patterns

### Breakpoint System

```css
/* Mobile-first breakpoints */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Responsive Component Patterns

**Property Card Grid:**
```css
.property-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .property-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .property-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .property-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Nigerian Market Specific Patterns

### Location & Geographic Features

- **States and LGAs:** Support for Nigerian administrative divisions
- **Landmarks:** Integration with local landmarks for better location description
- **Transportation:** Access to BRT, Keke, Okada routes
- **Infrastructure:** Power, water, internet availability indicators

### Cultural Considerations

- **Family-oriented messaging:** Emphasize community and family-friendly features
- **Security focus:** Highlight gated communities, security features
- **Accessibility:** Consider varying levels of digital literacy
- **Local language:** Optional Pidgin English or local language support

### Property Types Specific to Nigeria

- **Boys Quarters (BQ):** Separate accommodation units
- **Duplex vs Bungalow:** Clear architectural distinctions
- **Estate vs Individual houses:** Community vs standalone properties
- **Face-me-I-face-you:** Shared accommodation patterns

## Animation & Interaction Guidelines

### Animation Tokens

```css
/* Timing functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Common Interaction Patterns

**Card Hover Effects:**
```css
.property-card {
  transition: transform var(--duration-normal) var(--ease-out), 
              box-shadow var(--duration-normal) var(--ease-out);
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
```

**Button Interactions:**
```css
.button-primary {
  transition: all var(--duration-fast) var(--ease-out);
}

.button-primary:hover {
  background-color: oklch(from var(--primary-neon) l c h / 0.9);
  transform: translateY(-1px);
}
```

## Accessibility Standards

### Color Contrast Requirements

All color combinations must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- UI elements: 3:1 contrast ratio minimum

### Keyboard Navigation

- All interactive elements must be reachable via keyboard
- Focus indicators must be clearly visible
- Logical tab order throughout the interface
- Skip links for main content areas

### Screen Reader Support

- Proper semantic HTML structure
- ARIA labels for complex interactions
- Image alt text for all meaningful images
- Status updates announced to screen readers

## Performance Guidelines

### Image Optimization

- WebP format with fallbacks
- Responsive image sizing
- Lazy loading for below-the-fold content
- Compressed images for listings (max 1MB per image)

### Code Splitting

```typescript
// Lazy load heavy components
const PropertyMap = lazy(() => import('../components/PropertyMap'));
const VirtualTour = lazy(() => import('../components/VirtualTour'));

// Use Suspense for loading states
<Suspense fallback={<MapSkeleton />}>
  <PropertyMap properties={properties} />
</Suspense>
```

### Font Loading Strategy

```css
/* Preload critical fonts */
<link rel="preload" href="/fonts/SpaceGrotesk-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/NeulisNeue-Regular.woff2" as="font" type="font/woff2" crossorigin>

/* Font display strategy */
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Variable.woff2') format('woff2');
  font-display: swap;
}
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up design tokens in CSS custom properties
- [ ] Configure HeroUI with custom theme
- [ ] Implement base typography styles
- [ ] Create color utility classes
- [ ] Set up responsive breakpoints

### Phase 2: Core Components (Week 2-3)
- [ ] Migrate key components to HeroUI
- [ ] Implement UntitledUI for status components
- [ ] Create branded button variants
- [ ] Build property card component
- [ ] Implement status badge system

### Phase 3: Layout & Navigation (Week 4-5)
- [ ] Build responsive navigation header
- [ ] Create property listing layouts
- [ ] Implement search and filter UI
- [ ] Build dashboard layouts
- [ ] Create footer component

### Phase 4: Advanced Patterns (Week 6-7)
- [ ] Build property detail page
- [ ] Implement verification flow UI
- [ ] Create onboarding sequences
- [ ] Build admin dashboard components
- [ ] Implement map integration

### Phase 5: Polish & Optimization (Week 8)
- [ ] Add microinteractions and animations
- [ ] Implement loading states and skeletons
- [ ] Optimize performance and accessibility
- [ ] Complete responsive design testing
- [ ] Finalize brand applications

## Quality Checklist

Before implementing any new component, ensure:

- [ ] Follows established color palette and usage guidelines
- [ ] Uses appropriate typography hierarchy
- [ ] Implements proper spacing from the design system
- [ ] Includes all necessary states (hover, focus, disabled, etc.)
- [ ] Meets accessibility standards (contrast, keyboard nav, ARIA)
- [ ] Is responsive across all breakpoints
- [ ] Uses semantic HTML elements
- [ ] Includes appropriate loading and error states
- [ ] Follows established animation patterns
- [ ] Is optimized for performance

## File Structure

```
/components
  /ui
    /heroui         # Customized HeroUI components
    /untitledui     # UntitledUI status components  
    /custom         # Completely custom components
  /layout           # Layout components
  /forms           # Form-specific components
  /property        # Property-related components
  /dashboard       # Dashboard-specific components
  /maps            # Map and location components

/styles
  /tokens          # Design tokens and CSS custom properties
  /components      # Component-specific styles
  /utilities       # Utility classes
  /animations      # Animation definitions

/lib
  /theme           # Theme configuration
  /utils           # Utility functions
  /constants       # Design system constants
```

## Design System Governance

### Decision Tree for Component Choice

1. **Is it a complex, interactive component?** → Use HeroUI
2. **Is it a status indicator or small UI element?** → Use UntitledUI
3. **Is it a unique pattern specific to RealEST?** → Build custom component
4. **Does it exist in HeroUI but need heavy customization?** → Wrap HeroUI component

### Design Review Process

1. **Design Token Compliance:** Verify all colors, spacing, and typography use system tokens
2. **Accessibility Review:** Check contrast ratios, keyboard navigation, screen reader support
3. **Performance Check:** Ensure images are optimized, code is efficiently structured
4. **Cross-platform Testing:** Test on various devices and browsers
5. **Brand Consistency:** Verify component aligns with RealEST brand guidelines

## Success Metrics

- **Design Consistency:** 95%+ of components use design system tokens
- **Accessibility Score:** WCAG 2.1 AA compliance across all components
- **Performance:** Page load times under 3 seconds on 3G
- **Developer Productivity:** 50% reduction in component development time
- **User Experience:** Improved task completion rates and user satisfaction scores

This context file should be referenced for all design and development decisions in the RealEST project. It ensures consistency, maintainability, and alignment with brand goals while supporting the Nigerian property marketplace use case.

## Zed IDE Configuration

This project is configured for use with Zed IDE and its AI assistant features. The following configuration enables context-aware development:

### Context File Integration
- **Location**: `docs/zed-context-realest-design-system.md`
- **Purpose**: Provides comprehensive design system context to Zed's AI assistant
- **Auto-detection**: This file is automatically referenced by Zed when providing code suggestions and assistance

### Project Setup for Zed
1. **Language Servers**: TypeScript, Tailwind CSS, and React language servers are configured
2. **Formatting**: Prettier integration with project-specific rules
3. **Linting**: ESLint configuration aligned with Next.js and React best practices
4. **Extensions**: HeroUI and Supabase-specific tooling support

### AI Assistant Guidelines
When using Zed's AI assistant:
- Reference this context file for all design decisions
- Consult HeroUI MCP for component implementations
- Use Supabase MCP for backend functionality
- Follow the established file structure and naming conventions
- Ensure all new code adheres to the design system principles outlined above

### Development Workflow
1. **Context Awareness**: Zed AI will automatically reference this design system when suggesting code
2. **Component Creation**: New components should follow the established patterns and use appropriate libraries
3. **Consistency Checks**: The AI will help maintain design system compliance across the codebase
4. **Performance Optimization**: Suggestions will align with the performance guidelines specified above