# RealEST Logo Component Guide

## Overview

The RealEST Logo Component is a centralized, flexible branding solution that provides consistent logo implementation across the entire application. It features a beautiful location pin design with integrated cityscape, representing our geo-verified property marketplace mission.

## Design Philosophy

The logo combines:
- **Location Pin Shape**: Representing precise geo-location and mapping
- **Cityscape Silhouette**: Buildings symbolizing real estate and urban development
- **Verification Checkmark**: Trust and authentication symbol
- **Brand Colors**: Primary green gradient reflecting growth, trust, and verification

## Component API

### Basic Usage

```tsx
import RealEstLogo from '@/components/ui/real-est-logo';

// Basic usage
<RealEstLogo />
```

### Props Interface

```tsx
interface RealEstLogoProps {
  variant?: 'full' | 'icon' | 'text' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  theme?: 'light' | 'dark' | 'auto';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}
```

## Variants

### 1. Full Logo (`variant="full"`)
**Default variant with icon + text + tagline**

```tsx
<RealEstLogo variant="full" size="md" />
```

**Use Cases:**
- Main navigation headers
- Footer branding
- Landing pages
- Marketing materials

**Features:**
- Location pin icon
- "RealEST" wordmark
- "Find Your Next Move" tagline

### 2. Icon Only (`variant="icon"`)
**Just the location pin symbol**

```tsx
<RealEstLogo variant="icon" size="lg" />
```

**Use Cases:**
- Mobile navigation
- Loading screens
- Favicons
- Social media profile pictures
- Compact layouts

**Features:**
- Pure icon representation
- Scalable SVG design
- Maintains brand recognition

### 3. Text Only (`variant="text"`)
**Wordmark and tagline without icon**

```tsx
<RealEstLogo variant="text" size="xl" />
```

**Use Cases:**
- Text-heavy layouts
- Minimalist designs
- Secondary branding areas
- Email signatures

**Features:**
- Gradient text styling
- Typography-focused branding
- Clean, readable design

### 4. Minimal (`variant="minimal"`)
**Icon + wordmark only (no tagline)**

```tsx
<RealEstLogo variant="minimal" size="sm" />
```

**Use Cases:**
- Compact headers
- Side navigation
- Internal dashboards
- Space-constrained areas

**Features:**
- Essential branding elements
- Optimized for small spaces
- Professional appearance

## Sizes

| Size | Icon Dimensions | Text Size | Use Cases |
|------|----------------|-----------|-----------|
| `xs` | 16x16px | text-sm | Breadcrumbs, tiny UI elements |
| `sm` | 24x24px | text-base | Mobile nav, compact headers |
| `md` | 32x32px | text-lg | Standard headers |
| `lg` | 40x40px | text-xl | Main navigation |
| `xl` | 48x48px | text-2xl | Hero sections |
| `2xl` | 64x64px | text-3xl | Landing pages, banners |

## Pre-configured Components

For common use cases, use these specialized components:

### HeaderLogo
```tsx
import { HeaderLogo } from '@/components/ui/real-est-logo';

<HeaderLogo animated onClick={() => router.push('/')} />
```
- Optimized for navigation headers
- Medium size, full variant
- Built-in animation support

### FooterLogo
```tsx
import { FooterLogo } from '@/components/ui/real-est-logo';

<FooterLogo />
```
- Perfect for footer branding
- Small size, full variant
- Subtle, professional appearance

### HeroLogo
```tsx
import { HeroLogo } from '@/components/ui/real-est-logo';

<HeroLogo animated className="mb-8" />
```
- Designed for hero sections and landing pages
- Extra large size, full variant
- Eye-catching, premium feel

### MobileLogo
```tsx
import { MobileLogo } from '@/components/ui/real-est-logo';

<MobileLogo />
```
- Icon-only for mobile interfaces
- Medium size, optimized for touch
- Space-efficient design

### LoadingLogo
```tsx
import { LoadingLogo } from '@/components/ui/real-est-logo';

<LoadingLogo variant="icon" size="lg" />
```
- Includes built-in animation
- Perfect for loading states
- Engaging user experience

## Animation & Interactivity

### Enable Animation
```tsx
<RealEstLogo animated />
```
**Effects:**
- Subtle scale animation on hover
- Smooth transitions
- Enhanced user interaction

### Click Handling
```tsx
<RealEstLogo 
  onClick={() => router.push('/')} 
  animated
  className="cursor-pointer"
/>
```
**Features:**
- Automatic button role and tabIndex
- Keyboard accessibility
- Visual hover feedback

## Theme Support

### Auto Theme (Default)
```tsx
<RealEstLogo theme="auto" />
```
- Adapts to current theme automatically
- Respects system/user preferences

### Light Theme
```tsx
<RealEstLogo theme="light" />
```
- Optimized for light backgrounds
- Enhanced contrast and readability

### Dark Theme
```tsx
<RealEstLogo theme="dark" />
```
- Designed for dark backgrounds
- Maintains brand visibility

## Real-World Usage Examples

### Navigation Header
```tsx
import Link from 'next/link';
import { HeaderLogo } from '@/components/ui/real-est-logo';

function Header() {
  return (
    <header>
      <Link href="/">
        <HeaderLogo animated />
      </Link>
    </header>
  );
}
```

### Loading Screen
```tsx
import { LoadingLogo } from '@/components/ui/real-est-logo';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingLogo variant="full" size="xl" />
      <p>Loading your next move...</p>
    </div>
  );
}
```

### Hero Section
```tsx
import { HeroLogo } from '@/components/ui/real-est-logo';

function HeroSection() {
  return (
    <section className="text-center">
      <HeroLogo animated className="mb-8" />
      <h1>Nigeria's Most Trusted Property Marketplace</h1>
    </section>
  );
}
```

### Mobile Navigation
```tsx
import { MobileLogo } from '@/components/ui/real-est-logo';

function MobileNav() {
  return (
    <nav className="mobile-nav">
      <MobileLogo onClick={() => router.push('/')} />
      {/* Other nav items */}
    </nav>
  );
}
```

## Brand Guidelines

### Color Usage
- **Primary Gradient**: `oklch(0.89 0.24 128)` to `oklch(0.30 0.06 165)`
- **Accent Color**: `#ADF434` (Acid Green)
- **Dark Green**: `#07402F`

### Spacing
- Always maintain adequate whitespace around logo
- Minimum clear space: 0.5x logo height on all sides
- Respect component padding and margins

### Accessibility
- Logo includes proper alt text handling
- Maintains WCAG contrast requirements
- Keyboard navigation support when clickable
- Screen reader friendly implementation

## Technical Implementation

### SVG Structure
The logo is built as an inline SVG component for:
- Perfect scalability
- Full styling control
- Optimal performance
- No external dependencies

### Performance Benefits
- Zero external image requests
- Instant rendering
- Small bundle size impact
- Tree-shakable imports

### Responsive Design
- Fluid sizing based on container
- Maintains aspect ratio
- Adapts to different screen sizes
- Mobile-optimized touch targets

## Migration from Old Logo

### Before (Old Implementation)
```tsx
// Old text-only approach
<div className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
  RealEST
</div>
```

### After (New Logo Component)
```tsx
// New centralized component
<HeaderLogo animated onClick={handleClick} />
```

### Migration Steps
1. Replace existing logo implementations
2. Import appropriate variant component
3. Add animation and click handlers as needed
4. Test across different screen sizes
5. Verify accessibility compliance

## Best Practices

### Do's ✅
- Use pre-configured variants for common cases
- Enable animation for interactive logos
- Maintain consistent sizing within sections
- Use appropriate variant for context
- Include click handlers for navigation logos

### Don'ts ❌
- Don't modify logo colors outside brand palette
- Don't use extremely small sizes for full variant
- Don't stack multiple logo variants together
- Don't use logo without adequate contrast
- Don't implement custom logo versions

## File Structure

```
components/
├── ui/
│   └── real-est-logo.tsx     # Main component
public/
├── realest-logo.svg          # Full logo SVG
└── icon.svg                  # Favicon version
docs/
└── LOGO_COMPONENT_GUIDE.md  # This documentation
```

## Support

For questions about logo usage, implementation, or brand guidelines:

1. Review this documentation
2. Check existing implementations in the codebase
3. Consult the design system documentation
4. Ensure accessibility compliance

---

**Remember**: The logo is often the first brand touchpoint users encounter. Consistent, professional implementation reinforces trust and recognition across the entire RealEST platform.