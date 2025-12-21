# Component Library Strategy & Patterns

## Component Distribution (Current vs Target)

RealEST uses a strategic multi-library approach to balance development speed, consistency, and customization. **Current adoption (Dec 2025) does not match the target.**

```
Current Distribution (observed)
├── ~20% HeroUI v3      → Buttons, cards, some auth/public pages
├── ~5%  UntitledUI     → status-components.tsx only
└── ~75% Shadcn/Custom  → components/ui/* (65+ components) is dominant

Target Distribution (70-25-5)
├── 70% HeroUI v3       → Primary library (forms, buttons, cards, layout)
├── 25% UntitledUI      → Status indicators, progress, alerts, microinteractions
└── 5%  Shadcn/Custom   → Complex patterns, data tables, custom RealEST components
```

**Hybrid plan (Option C):** Keep documenting the target while explicitly calling out current usage and migrate incrementally toward 70-25-5.

### Guardrails for New Code (Dec 2025)
- **HeroUI wrappers**: use `RealEstInput`, `RealEstTextArea`, `RealEstSelect`/`RealEstSelectItem`, `RealEstDialog` (new wrappers) for forms/dialogs instead of Shadcn primitives.
- **Shadcn allowlist only**: `command`, `combobox`, `context-menu`, `data-table`. ESLint warns on other `@/components/ui/*` imports.
- **Status/Infrastructure**: Prefer UntitledUI status components; add Nigerian infrastructure indicators there.

### Why This Strategy?

**HeroUI v3 (Primary)**:
- React 19 Server Component support
- Built-in accessibility (ARIA)
- Customizable via CSS variables (brand integration)
- Composition patterns (`Card.Header`, `Card.Content`)
- Active development & Nigerian developer community

**UntitledUI (Status)**:
- Lightweight, focused micro-components
- Perfect for status badges, progress rings
- Minimal bundle impact
- Complements HeroUI without overlap

**Shadcn/Custom (Specialized)**:
- Complex data tables (admin dashboard)
- Custom RealEST components (Logo, LocationPin)
- Patterns unique to property marketplace

## HeroUI v3 Integration (Target 70% — Current ~20%)

**Reality check (Dec 2025)**: HeroUI wrappers exist but adoption is limited to select pages (auth/public) and two wrappers (`realest-button`, `realest-card`). The majority of components currently use Shadcn primitives from `components/ui/`.

### Theme Provider Integration

**Critical File**: `components/providers/realest-theme-provider.tsx`

The theme provider overrides HeroUI's default colors with RealEST brand tokens:

```typescript
// CSS Variable Overrides in Theme Provider
<style>{`
  :root {
    /* HeroUI Primary → RealEST Acid Green */
    --heroui-primary-50: var(--accent-50);
    --heroui-primary-500: var(--primary-accent);
    --heroui-primary-900: var(--accent-900);
    
    /* HeroUI Secondary → RealEST Dark Green */
    --heroui-secondary-50: var(--green-50);
    --heroui-secondary-500: var(--primary-dark);
    --heroui-secondary-900: var(--green-900);
  }
`}</style>
```

**Result**: All HeroUI components automatically use RealEST colors

### RealEST Button Component

**File**: `components/heroui/realest-button.tsx`

Custom wrapper around HeroUI Button with brand-specific variants:

```tsx
import { Button } from '@heroui/react'

type RealEstButtonVariant = 
  | 'neon'      // Acid Green primary CTA
  | 'dark'      // Dark Green secondary
  | 'neutral'   // Neutral gray
  | 'ghost'     // Transparent with border
  | 'danger'    // Error states

<RealEstButton 
  variant="neon" 
  size="lg"
  className="shadow-accent"
  startIcon={<CheckCircleIcon />}
>
  List Property
</RealEstButton>
```

**Nigerian Market Specific Buttons**:
```tsx
<PayRentButton propertyId={id} />        // Naira formatting
<CheckNEPAButton area={area} />          // Power status checker
<ViewBQButton propertyId={id} />         // Boys Quarters details
```

### RealEST Card System

**File**: `components/heroui/realest-card.tsx`

Composition-based card components with RealEST styling:

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@heroui/react'

<Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
  <CardHeader className="flex justify-between">
    <Badge variant="success">RealEST Verified ✓</Badge>
    <span className="font-mono text-xs text-gray-500">RE-LG-001234</span>
  </CardHeader>
  
  <CardContent className="space-y-4">
    <h3 className="font-heading text-2xl">3 Bedroom Flat in Lekki</h3>
    <p className="font-body text-muted-foreground">
      Modern apartment with backup generator and borehole water...
    </p>
    
    {/* Nigerian Infrastructure Indicators */}
    <div className="flex gap-2">
      <InfrastructureBadge type="nepa" status="stable" />
      <InfrastructureBadge type="water" status="borehole" />
      <InfrastructureBadge type="security" status="gated" />
    </div>
  </CardContent>
  
  <CardFooter className="flex justify-between">
    <span className="font-heading text-xl">₦2,500,000/year</span>
    <RealEstButton variant="neon">View Property</RealEstButton>
  </CardFooter>
</Card>
```

### Property-Specific Card Variants

```tsx
// Standard Property Card
<PropertyCard 
  property={data}
  showVerificationBadge
  showInfrastructure
/>

// Featured Property (Premium Listing)
<FeaturedPropertyCard
  property={data}
  isPremium
  highlightColor="accent"
/>

// Nigerian Property Card (Extended Info)
<NigerianPropertyCard
  property={data}
  showBQ              // Boys Quarters
  showNEPAStatus      // Power status
  showWaterSource     // Water availability
  showSecurityInfo    // Gated, CCTV, etc.
/>
```

### Form Components (HeroUI Primary Usage)

**File**: `components/heroui/realest-form-fields.tsx`

All form inputs use HeroUI with RealEST styling:

```tsx
import { Input, Select, TextArea } from '@heroui/react'

// Standard Text Input
<Input
  label="Property Title"
  placeholder="e.g., 3 Bedroom Flat in Lekki"
  variant="bordered"
  classNames={{
    input: "font-body",
    label: "font-body font-semibold"
  }}
/>

// Nigerian State Select
<Select
  label="State"
  placeholder="Select state"
  items={NIGERIAN_STATES}
>
  {(state) => <SelectItem key={state.code}>{state.name}</SelectItem>}
</Select>

// LGA Select (Cascading)
<Select
  label="Local Government Area"
  placeholder="Select LGA"
  items={getLGAsByState(selectedState)}
  isDisabled={!selectedState}
>
  {(lga) => <SelectItem key={lga.code}>{lga.name}</SelectItem>}
</Select>

// Price Input with Naira
<Input
  label="Annual Rent"
  type="number"
  startContent={<span className="text-gray-500">₦</span>}
  placeholder="0.00"
  classNames={{
    input: "font-mono"
  }}
/>

// Phone Input with +234 Prefix
<Input
  label="Phone Number"
  type="tel"
  startContent={<span className="text-gray-500">+234</span>}
  placeholder="801 234 5678"
  pattern="[0-9]{10}"
/>
```

### Modal & Dialog Patterns

```tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'

<Modal 
  isOpen={isOpen} 
  onClose={onClose}
  size="2xl"
  classNames={{
    base: "bg-background",
    header: "border-b border-border",
    body: "py-6",
    footer: "border-t border-border"
  }}
>
  <ModalContent>
    <ModalHeader className="font-heading text-2xl">
      Contact Property Owner
    </ModalHeader>
    
    <ModalBody className="space-y-4">
      <Input label="Your Name" placeholder="John Doe" />
      <Input label="Email" type="email" placeholder="john@example.com" />
      <TextArea 
        label="Message" 
        placeholder="I'm interested in viewing this property..."
        rows={4}
      />
    </ModalBody>
    
    <ModalFooter className="gap-2">
      <RealEstButton variant="ghost" onPress={onClose}>
        Cancel
      </RealEstButton>
      <RealEstButton variant="neon" onPress={handleSubmit}>
        Send Inquiry
      </RealEstButton>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## UntitledUI Integration (25% Usage)

### Status Badge System

**File**: `components/untitledui/status-components.tsx`

Lightweight status indicators for property states:

```tsx
// Property Verification Status
<StatusBadge status="verified" />      // Green checkmark
<StatusBadge status="pending" />       // Amber clock
<StatusBadge status="rejected" />      // Red X
<StatusBadge status="draft" />         // Gray dot

// Property Availability
<AvailabilityIndicator status="available" />    // Green
<AvailabilityIndicator status="occupied" />     // Gray
<AvailabilityIndicator status="reserved" />     // Amber
```

### Progress Indicators

```tsx
import { ProgressRing, VerificationProgress } from '@/components/untitledui/status-components'

// Circular Progress (ML Validation)
<ProgressRing 
  value={75} 
  size="lg"
  color="accent"
  showLabel
/>

// Multi-Step Verification Progress
<VerificationProgress
  steps={[
    { label: 'Document Upload', status: 'complete' },
    { label: 'ML Validation', status: 'complete' },
    { label: 'Physical Vetting', status: 'in-progress' },
    { label: 'Live on Marketplace', status: 'pending' }
  ]}
/>
```

### Loading States

```tsx
import { LoadingSpinner, LoadingDots } from '@/components/untitledui/status-components'

// Full Page Loader
<LoadingSpinner size="xl" color="accent" />

// Inline Loading (Button)
<RealEstButton disabled>
  <LoadingDots /> Processing...
</RealEstButton>

// Skeleton Loader (Property Card)
<PropertyCardSkeleton />
```

### Alert & Toast System

```tsx
import { AlertBanner, Toast } from '@/components/untitledui/status-components'

// Page-Level Alert
<AlertBanner 
  variant="warning"
  title="Property Pending Verification"
  description="Your property is currently under review by our vetting team."
  action={
    <RealEstButton size="sm" variant="ghost">
      View Status
    </RealEstButton>
  }
/>

// Toast Notifications
<Toast
  variant="success"
  title="Property Listed Successfully"
  description="Your property is now pending ML validation."
  duration={5000}
/>
```

### Nigerian Infrastructure Indicators

**Custom Component for Nigerian Market**:

```tsx
import { InfrastructureIndicator } from '@/components/untitledui/status-components'

// NEPA/Power Status
<InfrastructureIndicator
  type="power"
  status="stable"      // stable | intermittent | none
  label="NEPA: Stable"
  icon={<BoltIcon />}
/>

// Water Source
<InfrastructureIndicator
  type="water"
  status="borehole"    // borehole | public | well | none
  label="Borehole Available"
  icon={<DropletIcon />}
/>

// Internet Connectivity
<InfrastructureIndicator
  type="internet"
  status="fiber"       // fiber | 4g | 3g | none
  label="Fiber Available"
  icon={<WifiIcon />}
/>

// Security Features
<InfrastructureIndicator
  type="security"
  status="gated"       // gated | security-post | cctv | none
  label="Gated Community"
  icon={<ShieldIcon />}
/>
```

## Custom RealEST Components (5%)

### RealEST Logo Component

**File**: `components/ui/real-est-logo.tsx`

Flexible logo with multiple variants:

```tsx
import RealEstLogo from '@/components/ui/real-est-logo'

// Full Logo (Icon + Text + Tagline)
<RealEstLogo variant="full" size="lg" />

// Icon Only (Mobile Nav, Favicon)
<RealEstLogo variant="icon" size="md" />

// Text Only (Wordmark)
<RealEstLogo variant="text" size="xl" />

// Minimal (Icon + Wordmark)
<RealEstLogo variant="minimal" size="sm" />
```

**Theming**:
```tsx
<RealEstLogo theme="light" />  // Dark text on light bg
<RealEstLogo theme="dark" />   // Light text on dark bg
<RealEstLogo theme="auto" />   // Follows system theme
```

**Animation**:
```tsx
<RealEstLogo animated />  // Subtle pulse on hover
```

### Location Pin Component

**File**: `components/realest/location/location-pin.tsx`

Interactive map marker for property locations:

```tsx
import { LocationPin } from '@/components/realest/location'

<LocationPin
  latitude={6.4281}
  longitude={3.4219}
  propertyType="house"
  verificationStatus="verified"
  onClick={() => handlePinClick()}
/>
```

### Verification Badge

**File**: `components/realest/badges/verification-badge.tsx`

Prominent badge for verified properties:

```tsx
import { VerificationBadge } from '@/components/realest/badges'

<VerificationBadge
  status="verified"
  size="lg"
  showCheckmark
  animated
/>
```

**Variants**:
- `verified` - Green with checkmark (Acid Green)
- `pending` - Amber with clock icon
- `in-review` - Blue with eye icon
- `rejected` - Red with X icon

## Component Composition Patterns

### Property Card (Multi-Library Composition)

```tsx
import { Card } from '@heroui/react'                           // 70%
import { VerificationBadge } from '@/components/realest/badges' // 5%
import { InfrastructureIndicator } from '@/components/untitledui' // 25%

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="rounded-xl shadow-md">               {/* HeroUI */}
      <CardHeader>
        <VerificationBadge status={property.status} />    {/* Custom */}
      </CardHeader>
      
      <CardContent>
        <h3 className="font-heading">{property.title}</h3>
        
        {/* Infrastructure Indicators */}
        <div className="flex gap-2">
          <InfrastructureIndicator type="power" status={property.nepa} />  {/* UntitledUI */}
          <InfrastructureIndicator type="water" status={property.water} /> {/* UntitledUI */}
        </div>
      </CardContent>
      
      <CardFooter>
        <RealEstButton variant="neon">View Property</RealEstButton>  {/* HeroUI Wrapper */}
      </CardFooter>
    </Card>
  )
}
```

### Search Results Page (Complex Composition)

```tsx
export function SearchResults() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      {/* Property List (HeroUI Cards) */}
      <div className="space-y-4">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
        
        {/* Loading State (UntitledUI) */}
        {isLoading && <LoadingSpinner />}
      </div>
      
      {/* Map Sidebar (Custom + Mapbox) */}
      <div className="sticky top-4">
        <MapView properties={properties} />
      </div>
    </div>
  )
}
```

## Form Pattern Examples

### Property Listing Form (Multi-Step)

**File**: `components/list-property-form.tsx`

```tsx
import { Input, Select, TextArea } from '@heroui/react'
import { ProgressRing } from '@/components/untitledui'

export function ListPropertyForm() {
  const [step, setStep] = useState(1)
  
  return (
    <form className="space-y-6">
      {/* Progress Indicator */}
      <ProgressRing value={(step / 5) * 100} />
      
      {step === 1 && (
        <>
          <Select label="Property Type" items={PROPERTY_TYPES}>
            {(type) => <SelectItem>{type.label}</SelectItem>}
          </Select>
          
          <Input label="Property Title" placeholder="e.g., 3 Bedroom Flat" />
          
          <TextArea 
            label="Description" 
            rows={4}
            placeholder="Describe your property..."
          />
        </>
      )}
      
      {step === 2 && (
        <>
          <Input label="Street Address" />
          <Select label="State" items={NIGERIAN_STATES} />
          <Select label="LGA" items={getLGAs(selectedState)} />
          
          {/* Map Preview */}
          <LocationPicker onLocationSelect={handleLocationSelect} />
        </>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between">
        <RealEstButton variant="ghost" onClick={handlePrevious}>
          Back
        </RealEstButton>
        <RealEstButton variant="neon" onClick={handleNext}>
          {step === 5 ? 'Submit' : 'Continue'}
        </RealEstButton>
      </div>
    </form>
  )
}
```

## Responsive Design Patterns

### Mobile-First Card Layout

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {properties.map(property => (
    <PropertyCard key={property.id} property={property} />
  ))}
</div>
```

### Adaptive Navigation

```tsx
// Desktop: Full Logo
<RealEstLogo variant="full" size="md" className="hidden lg:block" />

// Mobile: Icon Only
<RealEstLogo variant="icon" size="sm" className="lg:hidden" />
```

## Component Testing Showcase

**Demo Page**: `app/(demo)/phase2-demo/page.tsx`

View all components with live interactions:
- Button variants and states
- Card compositions
- Form patterns
- Status indicators
- Infrastructure badges
- Loading states
- Nigerian market components

## Component Reference Files

- **HeroUI Buttons**: `components/heroui/realest-button.tsx`
- **HeroUI Cards**: `components/heroui/realest-card.tsx`
- **Status Components**: `components/untitledui/status-components.tsx`
- **Logo**: `components/ui/real-est-logo.tsx`
- **Location Components**: `components/realest/location/`
- **Badges**: `components/realest/badges/`
- **Component Index**: `components/index.ts`
