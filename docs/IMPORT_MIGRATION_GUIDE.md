# Component Import Path Migration Guide

## Quick Reference for Updating Imports

### Layout Components

```typescript
// Old
import Header from '@/components/header'
import Footer from '@/components/footer'

// New - Option A (Recommended)
import { Header, Footer } from '@/components/layout'

// New - Option B (Direct)
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
```

### Marketing Components

```typescript
// Old
import HeroSection from '@/components/hero-section'
import ComingSoonHero from '@/components/coming-soon-hero'

// New - Option A (Recommended)
import { HeroSection, ComingSoonHero } from '@/components/marketing'

// New - Option B (Direct)
import HeroSection from '@/components/marketing/HeroSection'
import ComingSoonHero from '@/components/marketing/ComingSoonHero'
```

### Forms Components

```typescript
// Old
import ListPropertyForm from '@/components/list-property-form'

// New - Option A (Recommended)
import { ListPropertyForm } from '@/components/forms'

// New - Option B (Direct)
import ListPropertyForm from '@/components/forms/ListPropertyForm'
```

### Dashboard Components

```typescript
// Old
import AdminDashboardContent from '@/components/admin-dashboard-content'
import AdminPropertyVerification from '@/components/admin-property-verification'
import AdminDocumentVerification from '@/components/admin-document-verification'

// New - Option A (Recommended)
import { 
  AdminDashboardContent, 
  AdminPropertyVerification, 
  AdminDocumentVerification 
} from '@/components/dashboard'

// New - Option B (Direct)
import AdminDashboardContent from '@/components/dashboard/AdminDashboardContent'
```

### Shared Components

```typescript
// Old
import WaitlistModal from '@/components/waitlist-modal'

// New - Option A (Recommended)
import { WaitlistModal } from '@/components/shared'

// New - Option B (Direct)
import WaitlistModal from '@/components/shared/WaitlistModal'
```

## Files That Still Need Moving

The following components are still in the root `components/` directory and should be moved to appropriate domains:

### Owner Components
- `owner-dashboard-content.tsx` → `components/dashboard/OwnerDashboardContent.tsx`
- `owner-inquiries.tsx` → `components/dashboard/OwnerInquiries.tsx`
- `owner-inquiries-page.tsx` → `components/dashboard/OwnerInquiriesPage.tsx`
- `owner-listings.tsx` → `components/dashboard/OwnerListings.tsx`

### Property Components
- `property-details.tsx` → `components/property/PropertyDetails.tsx`
- `property-documents.tsx` → `components/property/PropertyDocuments.tsx`
- `property-gallery.tsx` → `components/property/PropertyGallery.tsx`
- `featured-properties.tsx` → `components/property/FeaturedProperties.tsx`
- `contact-owner.tsx` → `components/property/ContactOwner.tsx`

### Other Components
- `phase2-demo-content.tsx` → `components/marketing/Phase2DemoContent.tsx`
- `theme-provider.tsx` → `components/providers/ThemeProvider.tsx`

## Search & Replace Guide

If using VS Code Find & Replace (Ctrl+H):

### For Layout Components
```
Find:     from '@/components/header'
Replace:  from '@/components/layout'

Find:     from '@/components/footer'
Replace:  from '@/components/layout'

Find:     from "../header"
Replace:  from "@/components/layout/Header"

Find:     from "../footer"
Replace:  from "@/components/layout/Footer"
```

### For Marketing Components
```
Find:     from '@/components/hero-section'
Replace:  from '@/components/marketing'

Find:     from '@/components/coming-soon-hero'
Replace:  from '@/components/marketing'

Find:     from "../hero-section"
Replace:  from "@/components/marketing/HeroSection"

Find:     from "../coming-soon-hero"
Replace:  from "@/components/marketing/ComingSoonHero"
```

### For Dashboard Components
```
Find:     from '@/components/admin-dashboard-content'
Replace:  from '@/components/dashboard'

Find:     from '@/components/admin-property-verification'
Replace:  from '@/components/dashboard'

Find:     from '@/components/admin-document-verification'
Replace:  from '@/components/dashboard'

Find:     from "../admin-dashboard-content"
Replace:  from "@/components/dashboard/AdminDashboardContent"

Find:     from "../admin-property-verification"
Replace:  from "@/components/dashboard/AdminPropertyVerification"

Find:     from "../admin-document-verification"
Replace:  from "@/components/dashboard/AdminDocumentVerification"
```

## Verification Checklist

After updating imports, verify:

- [ ] All imports resolve without errors
- [ ] Components render correctly in their respective pages
- [ ] Props are passed correctly to components
- [ ] No circular dependencies created
- [ ] All exports are properly defined in index.ts files
- [ ] TypeScript types are correctly imported

## Benefits of This Organization

✅ **Cleaner imports** - Domain-grouped imports are more readable
✅ **Better scalability** - Easy to add new components to domains
✅ **Logical separation** - Components grouped by responsibility
✅ **Type safety** - Proper TypeScript exports from index files
✅ **Convention over configuration** - Follows Next.js best practices

## Questions?

Refer to `COMPONENT_ORGANIZATION.md` for the complete organization structure and benefits.
