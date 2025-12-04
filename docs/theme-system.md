# 🎨 RealEST Theme System Guide

## Overview

RealEST uses a centralized theme system with automatic device theme detection, supporting light mode, dark mode, and system preference following.

## Architecture

```
app/layout.tsx (Global Provider)
├── RealEstThemeProvider (Centralized)
├── CSS Variables (styles/tokens/colors.css)
├── Tailwind Integration (styles/globals.css)
└── Components (theme-aware)
```

## New Brand Colors

| Color | Hex | Usage | Mode |
|-------|-----|-------|------|
| **Off-White** | `#F8F9F7` | Light backgrounds | Light Mode |
| **Acid Green** | `#ADF434` | Primary accent/CTAs | Both Modes |
| **Dark Green** | `#07402F` | Foundation/dark bg | Dark Mode |
| **Deep Neutral** | `#2E322E` | Secondary/text | Both Modes |

## Usage

### 1. Theme Provider (Already Global)

The theme provider is already configured in `app/layout.tsx`:

```tsx
<RealEstThemeProvider defaultTheme="system" enableSystem={true}>
  {children}
</RealEstThemeProvider>
```

### 2. Using Theme Context

```tsx
import { useRealEstTheme } from '@/components/providers/realest-theme-provider'

function MyComponent() {
  const { 
    theme,          // 'light' | 'dark' | 'system'
    effectiveTheme, // 'light' | 'dark' (actual applied theme)
    systemTheme,    // 'light' | 'dark' (device preference)
    setTheme,       // Function to set theme
    toggleTheme     // Function to cycle themes
  } = useRealEstTheme()

  return (
    <div className="bg-background text-foreground">
      <p>Current theme: {effectiveTheme}</p>
      {theme === 'system' && <p>Following system: {systemTheme}</p>}
    </div>
  )
}
```

### 3. Theme Toggle Components

#### Simple Toggle Button
```tsx
import { ThemeToggleCompact } from '@/components/ui/theme-toggle'

<ThemeToggleCompact />
```

#### Dropdown with All Options
```tsx
import { ThemeToggleDropdown } from '@/components/ui/theme-toggle'

<ThemeToggleDropdown showLabel={true} />
```

#### Custom Toggle
```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

<ThemeToggle 
  variant="dropdown" 
  showLabel={true}
  size="lg"
  className="custom-class"
/>
```

### 4. CSS Classes

#### Semantic Colors (Recommended)
```tsx
<div className="bg-background text-foreground">
  <h1 className="text-primary">Acid Green Title</h1>
  <p className="text-muted-foreground">Muted text</p>
  <button className="bg-primary text-primary-foreground">
    Primary Button
  </button>
</div>
```

#### Brand Colors (Direct)
```tsx
<div className="bg-brand-light dark:bg-brand-dark">
  <button className="bg-brand-accent text-brand-dark">
    Acid Green Button
  </button>
  <div className="bg-brand-neutral text-brand-light">
    Deep Neutral Card
  </div>
</div>
```

#### Status Colors
```tsx
<div className="bg-success/10 text-success border border-success/20">
  ✅ Property Verified
</div>
<div className="bg-warning/10 text-warning border border-warning/20">
  ⏳ Pending Review
</div>
<div className="bg-error/10 text-error border border-error/20">
  ❌ Verification Failed
</div>
```

### 5. Dark Mode Classes

```tsx
<!-- Automatic with semantic tokens -->
<div className="bg-background text-foreground">
  Adapts automatically
</div>

<!-- Manual dark mode overrides -->
<div className="bg-white dark:bg-brand-dark text-black dark:text-white">
  Manual dark mode
</div>

<!-- Conditional styling -->
<div className="border-gray-200 dark:border-gray-700">
  Different borders per mode
</div>
```

## Advanced Usage

### 1. Theme-Aware Components

```tsx
function AdaptiveCard({ children }: { children: React.ReactNode }) {
  const { effectiveTheme } = useRealEstTheme()
  
  return (
    <div className={cn(
      "p-6 rounded-xl border transition-colors duration-300",
      effectiveTheme === 'dark' 
        ? "bg-brand-neutral border-gray-700 shadow-dark" 
        : "bg-white border-gray-200 shadow-sm"
    )}>
      {children}
    </div>
  )
}
```

### 2. Programmatic Theme Detection

```tsx
import { getSystemTheme, getThemeFromStorage } from '@/components/providers/realest-theme-provider'

// Get system preference
const systemPreference = getSystemTheme() // 'light' | 'dark'

// Get saved theme
const savedTheme = getThemeFromStorage() // 'light' | 'dark' | 'system' | null
```

### 3. Theme-Specific Animations

```tsx
<div className="transition-all duration-300 ease-out bg-background hover:bg-accent">
  Smooth theme transitions
</div>
```

## CSS Variables Reference

### Core Variables
```css
/* Always use these semantic tokens */
--background          /* Main background */
--foreground          /* Main text */
--card               /* Card backgrounds */
--card-foreground    /* Card text */
--primary            /* Acid Green (#ADF434) */
--primary-foreground /* Dark Green (#07402F) */
--secondary          /* Dark Green (#07402F) */
--secondary-foreground /* Off-White (#F8F9F7) */
--muted              /* Muted backgrounds */
--muted-foreground   /* Muted text */
--border             /* Border colors */
--ring               /* Focus ring (Acid Green) */
```

### Brand Variables
```css
--color-brand-light    /* #F8F9F7 - Off-White */
--color-brand-accent   /* #ADF434 - Acid Green */
--color-brand-dark     /* #07402F - Dark Green */
--color-brand-neutral  /* #2E322E - Deep Neutral */
```

### Status Variables
```css
--color-success       /* Green for verified states */
--color-warning       /* Yellow for pending states */
--color-error         /* Red for error states */
--color-info          /* Blue for info states */
```

## Best Practices

### ✅ Do's
- Use semantic color tokens (`bg-background`, `text-foreground`)
- Use the theme context for programmatic access
- Test both light and dark modes
- Use the provided toggle components
- Let the system handle theme persistence

### ❌ Don'ts
- Don't use hardcoded colors (`bg-white`, `text-black`)
- Don't create your own theme provider
- Don't bypass the CSS variable system
- Don't forget to handle `theme === 'system'` case
- Don't use `onClick` for theme changes (use `setTheme`)

## Device Theme Detection

The theme system automatically:
- ✅ Detects device preference on first visit
- ✅ Saves user choice to localStorage
- ✅ Listens for system theme changes
- ✅ Defaults to 'system' mode
- ✅ Handles localStorage failures gracefully
- ✅ Prevents hydration mismatches

## Testing Themes

### Manual Testing
1. **Light Mode**: Click theme toggle → Light
2. **Dark Mode**: Click theme toggle → Dark  
3. **System Mode**: Click theme toggle → System
4. **System Changes**: Change device theme while in system mode
5. **Persistence**: Refresh page, theme should persist

### Component Testing
```tsx
import { render } from '@testing-library/react'
import { RealEstThemeProvider } from '@/components/providers/realest-theme-provider'

function renderWithTheme(component: React.ReactElement, theme = 'light') {
  return render(
    <RealEstThemeProvider defaultTheme={theme}>
      {component}
    </RealEstThemeProvider>
  )
}
```

## Migration Notes

If you had components using the old system:
- Remove local `RealEstThemeProvider` wrappers (now global)
- Replace `onClick={toggleTheme}` with theme toggle components
- Update `theme === 'light'` checks to handle `'system'` option
- Use `effectiveTheme` for actual light/dark state

## Troubleshooting

### Theme Not Applying
- Check if component is wrapped in theme provider (should be automatic)
- Verify CSS variables are loaded (`styles/globals.css`)
- Check browser console for hydration warnings

### System Theme Not Detecting
- Ensure `enableSystem={true}` in provider
- Check browser supports `prefers-color-scheme`
- Verify `window.matchMedia` is available

### Colors Look Wrong
- Confirm you're using semantic tokens, not hardcoded colors
- Check if custom CSS is overriding theme variables
- Verify new brand colors are loaded from `styles/tokens/colors.css`

## Development Tools

### Theme Indicator (Development Only)
```tsx
import { ThemeIndicator } from '@/components/ui/theme-toggle'

// Shows current theme state in bottom-right corner
<ThemeIndicator />
```

### Browser DevTools
```css
/* Check active theme class */
html.light { /* Light mode styles */ }
html.dark  { /* Dark mode styles */ }

/* Check CSS variables */
:root { --primary: #ADF434; /* etc */ }
```

---

**The theme system is now fully centralized and automatically adapts to device preferences! 🎉**