# RealEST Form Patterns Documentation

This document provides comprehensive documentation for all form patterns implemented in the RealEST marketplace. These patterns follow the RealEST design system guidelines and are built using HeroUI v3 components with Nigerian market-specific considerations.

## Table of Contents

1. [Overview](#overview)
2. [Form Architecture](#form-architecture)
3. [Component Library](#component-library)
4. [Form Patterns](#form-patterns)
5. [Design Guidelines](#design-guidelines)
6. [Accessibility](#accessibility)
7. [Implementation Examples](#implementation-examples)

## Overview

The RealEST form system consists of 7 main form patterns designed to handle different user interactions across the property marketplace:

- **Property Listing Form** - Multi-step property creation
- **User Registration Form** - Role-based user onboarding
- **Contact Form** - Property inquiry communication
- **Advanced Search Form** - Comprehensive property filtering
- **Profile Settings Form** - User account management
- **Property Verification Form** - Admin verification workflow
- **Review & Rating Form** - User feedback system
- **Quick Inquiry Form** - Streamlined property contact

## Form Architecture

### Design System Integration

All forms follow the RealEST design system:

- **Color System**: OKLCH-based with 60-30-10 rule
  - Primary Dark (#242834) - 60% usage
  - Primary Violet (#7D53FF) - 30% usage  
  - Primary Neon (#B6FF00) - 10% usage
- **Typography**: 4-tier system (Lufga, Neulis Neue, Space Grotesk, JetBrains Mono)
- **Component Strategy**: HeroUI (70%), UntitledUI (25%), Shadcn (5%)

### State Management

Forms use React's `useState` for local state management with the following patterns:

```typescript
const [formData, setFormData] = useState({
  // Form fields with initial values
})

const [isLoading, setIsLoading] = useState(false)
const [validationErrors, setValidationErrors] = useState({})
```

### Nigerian Market Features

All forms include Nigerian-specific elements:
- State and LGA selection dropdowns
- Boys Quarters (BQ) property type
- NEPA/power supply considerations
- Naira (₦) currency formatting
- Local phone number formats (+234)

## Component Library

### Core Components

#### RealEstButton
Primary button component with RealEST styling:
```typescript
<RealEstButton
  variant="primary" | "secondary" | "tertiary" | "ghost" | "danger" | "neon" | "violet"
  size="sm" | "md" | "lg"
  isLoading={boolean}
  loadingText="Loading..."
>
```

#### StatusBadge
Status indication with icons:
```typescript
<StatusBadge
  variant="verified" | "pending" | "rejected" | "available" | "rented" | "sold"
  size="sm" | "md" | "lg"
  interactive={boolean}
>
```

#### LoadingSpinner & ProgressRing
Loading states from UntitledUI components.

## Form Patterns

### 1. Property Listing Form

**Purpose**: Multi-step form for property owners and agents to list properties.

**Features**:
- 6-step wizard (Basic Details, Location, Property Details, Pricing, Features, Media)
- Nigerian property types (Apartment, Duplex, BQ, etc.)
- Infrastructure assessment (NEPA, Water, Road access)
- Geolocation integration
- Draft saving capability

**Usage**:
```typescript
<PropertyListingForm
  onSubmit={(data) => handleSubmit(data)}
  onSaveDraft={(data) => saveDraft(data)}
  initialData={existingProperty}
/>
```

**Key Fields**:
- Property type, purpose (rent/sale)
- Nigerian states and LGAs
- Infrastructure checkboxes (NEPA, water, BQ)
- Pricing with local fees (caution, legal, agent)

### 2. User Registration Form

**Purpose**: Role-based user account creation with type-specific fields.

**Features**:
- Role selection (buyer, owner, agent)
- Progressive disclosure based on user type
- Password strength indicator
- Nigerian location integration
- Professional credentials for agents

**Usage**:
```typescript
<UserRegistrationForm
  onSubmit={(data) => createUser(data)}
  userType="buyer" | "owner" | "agent"
/>
```

**Role-Specific Fields**:
- **Buyer**: Preferences, budget range
- **Owner**: Property portfolio info
- **Agent**: License number, company details

### 3. Contact Form

**Purpose**: Streamlined communication between users and property contacts.

**Features**:
- Inquiry type selection
- Preferred contact method
- Property-specific context
- Availability scheduling

**Usage**:
```typescript
<ContactForm
  propertyId="property-123"
  recipientType="owner" | "agent"
  recipientName="John Doe"
  onSubmit={(data) => sendInquiry(data)}
/>
```

### 4. Advanced Search Form

**Purpose**: Comprehensive property filtering with expandable sections.

**Features**:
- Quick filters (always visible)
- Expandable advanced filters
- Nigerian infrastructure filters
- Search saving functionality
- Price range with Naira formatting

**Usage**:
```typescript
<AdvancedSearchForm
  onSearch={(filters) => searchProperties(filters)}
  onSaveSearch={(filters) => saveSearchCriteria(filters)}
  initialFilters={savedSearch}
/>
```

**Filter Categories**:
- Location (State, LGA, Area)
- Property details (bedrooms, bathrooms, size)
- Nigerian infrastructure (NEPA, water, gated)
- Features and amenities

### 5. Profile Settings Form

**Purpose**: Tabbed interface for comprehensive user account management.

**Features**:
- 5 tab sections (Personal, Professional, Preferences, Security, Privacy)
- Role-based field visibility
- Password strength validation
- Nigerian language support
- Notification preferences

**Usage**:
```typescript
<ProfileSettingsForm
  onSubmit={(data) => updateProfile(data)}
  initialData={userProfile}
  userType="buyer" | "owner" | "agent" | "admin"
/>
```

**Tab Structure**:
- **Personal**: Basic info, contact details
- **Professional**: Business info (agents/owners only)
- **Preferences**: Language, currency, notifications
- **Security**: Password change, 2FA
- **Privacy**: Profile visibility, data sharing

### 6. Property Verification Form

**Purpose**: Admin workflow for property verification with detailed assessment.

**Features**:
- 5-step verification process
- Document status tracking
- Physical inspection checklist
- Infrastructure assessment
- Final recommendation workflow

**Usage**:
```typescript
<PropertyVerificationForm
  propertyId="property-123"
  onSubmit={(data) => approveProperty(data)}
  onReject={(reason) => rejectProperty(reason)}
  initialData={existingVerification}
/>
```

**Verification Sections**:
- **Documents**: Title deed, survey, C of O
- **Physical**: Location accuracy, condition rating
- **Infrastructure**: Power, water, road assessment
- **Security**: Safety features evaluation
- **Assessment**: Final approval/rejection

### 7. Review & Rating Form

**Purpose**: User feedback system for properties, agents, and landlords.

**Features**:
- 5-star rating system with labels
- Category-specific ratings
- Pros and cons lists
- Anonymous posting option
- Recommendation indicator

**Usage**:
```typescript
<ReviewForm
  propertyId="property-123"
  reviewType="property" | "agent" | "landlord"
  onSubmit={(data) => submitReview(data)}
/>
```

**Rating Categories**:
- **Property**: Location, amenities, value
- **Service**: Communication, professionalism, responsiveness

### 8. Quick Inquiry Form

**Purpose**: Compact, sidebar-friendly contact form for immediate inquiries.

**Features**:
- Minimal field count
- Inquiry type selection with icons
- Mobile-optimized layout
- Urgency indicators

**Usage**:
```typescript
<QuickInquiryForm
  propertyId="property-123"
  propertyTitle="3BR Apartment in Lekki"
  onSubmit={(data) => sendQuickInquiry(data)}
/>
```

## Design Guidelines

### Form Layout Principles

1. **Progressive Disclosure**: Complex forms use multi-step or tabbed interfaces
2. **Contextual Grouping**: Related fields are grouped in cards/sections
3. **Clear Hierarchy**: Form titles, section headers, field labels follow typography scale
4. **Responsive Design**: Forms adapt gracefully to mobile screens

### Field Design Standards

#### Input Fields
```css
.form-input {
  @apply w-full px-3 py-2 border border-border rounded-lg;
  @apply focus:ring-2 focus:ring-primary focus:border-transparent;
  @apply transition-colors duration-200;
}
```

#### Selection Controls
- **Radio buttons**: For mutually exclusive options
- **Checkboxes**: For multiple selections
- **Select dropdowns**: For long option lists (states, property types)

#### Button Hierarchy
1. **Primary**: Form submission (RealEstButton variant="primary")
2. **Secondary**: Alternative actions (variant="outline")
3. **Tertiary**: Cancel/reset (variant="ghost")

### Validation & Error Handling

#### Field Validation
- Real-time validation for critical fields
- Clear error messages below fields
- Success states for validated fields

#### Form Submission
- Loading states with spinners
- Success confirmation
- Error handling with retry options

### Nigerian Market Considerations

#### Location Fields
```typescript
const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  // ... complete list
]
```

#### Property Types
```typescript
const propertyTypes = [
  'Apartment', 'Duplex', 'Bungalow', 'Boys Quarters (BQ)',
  'Self-contained', 'Mini Flat', 'Face-me-I-face-you', 'Mansion'
]
```

#### Infrastructure Options
```typescript
const infrastructureOptions = [
  'NEPA/Power Supply', 'Borehole/Water Supply', 'Internet Connectivity',
  'Good Road Network', 'Drainage System', 'Street Lighting'
]
```

## Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation**: All form controls accessible via keyboard
- **Screen Reader Support**: Proper labels, descriptions, and ARIA attributes
- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Focus Management**: Clear focus indicators and logical tab order

### Implementation Examples

#### Required Field Indicators
```typescript
<label className="block text-sm font-medium mb-2">
  Property Title
  <span className="text-error ml-1" aria-label="required">*</span>
</label>
```

#### Error Announcements
```typescript
<input
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
  className={cn(
    "form-input",
    errors.email && "border-error focus:ring-error"
  )}
/>
{errors.email && (
  <p id="email-error" className="text-error text-sm mt-1" role="alert">
    {errors.email}
  </p>
)}
```

#### Loading States
```typescript
<RealEstButton
  type="submit"
  isLoading={isSubmitting}
  disabled={isSubmitting}
  aria-describedby="submit-status"
>
  {isSubmitting ? "Creating Property..." : "List Property"}
</RealEstButton>
```

## Implementation Examples

### Basic Form Structure
```typescript
'use client'

import { useState } from 'react'
import { RealEstButton } from '@/components/heroui/realest-button'
import { cn } from '@/lib/utils'

export function ExampleForm({ onSubmit, className }) {
  const [formData, setFormData] = useState({
    // Initial state
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form content */}
        
        <RealEstButton
          type="submit"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Submit
        </RealEstButton>
      </form>
    </div>
  )
}
```

### Multi-step Form Pattern
```typescript
const [currentStep, setCurrentStep] = useState(1)
const totalSteps = 4

const nextStep = () => {
  if (currentStep < totalSteps) {
    setCurrentStep(currentStep + 1)
  }
}

const prevStep = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1)
  }
}

// Progress indicator
<div className="flex justify-between mb-8">
  {Array.from({ length: totalSteps }, (_, i) => (
    <div
      key={i}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center",
        i + 1 <= currentStep
          ? "bg-primary text-white"
          : "bg-gray-200 text-gray-500"
      )}
    >
      {i + 1}
    </div>
  ))}
</div>
```

### Tabbed Form Pattern
```typescript
const [activeTab, setActiveTab] = useState('personal')

const tabs = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'preferences', label: 'Preferences' }
]

// Tab navigation
<div className="border-b border-border">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        "px-6 py-3 font-medium border-b-2 transition-colors",
        activeTab === tab.id
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground"
      )}
    >
      {tab.label}
    </button>
  ))}
</div>
```

## File Structure

```
components/
├── patterns/
│   └── forms.tsx                 # All form pattern exports
├── heroui/
│   ├── realest-button.tsx        # Primary button component
│   └── realest-card.tsx          # Card layouts
├── untitledui/
│   └── status-components.tsx     # Loading states, progress
└── ui/
    └── status-badge.tsx          # Status indicators
```

## Best Practices

### Performance
- Use React.memo for complex form sections
- Debounce real-time validation
- Lazy load large option lists

### User Experience
- Provide clear progress indicators
- Save draft functionality for long forms
- Contextual help text and examples
- Mobile-first responsive design

### Maintenance
- Consistent naming conventions
- Reusable form field components
- Centralized validation logic
- Comprehensive TypeScript types

---

This documentation provides a complete reference for implementing and maintaining form patterns in the RealEST marketplace, ensuring consistency, accessibility, and adherence to Nigerian market requirements.