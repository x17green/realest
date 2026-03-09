# Nigerian Market Localization Guide

## Cultural & Market Context

RealEST is specifically designed for the **Nigerian real estate market**, requiring deep localization beyond simple translation. This guide covers cultural considerations, infrastructure realities, and market-specific features.

## Core Nigerian Market Principles

### 1. Trust Is Paramount
**Context**: Nigerian real estate suffers from fraud, duplicate listings, and fake landlords.

**RealEST Solution**:
- Acid Green "RealEST Verified ✓" badge everywhere
- Physical vetting process prominently displayed
- ML document validation transparency
- Geotag verification showcased

**Design Impact**:
- Green = Trust (national flag color)
- Conservative professional palette
- Verification badges on every property card
- "How We Verify" sections on every page

### 2. Infrastructure Challenges
**Reality**: Power (NEPA), water, internet are not guaranteed.

**Must-Have Property Features**:
```typescript
interface NigerianPropertyFeatures {
  // Power
  nepa_status: 'stable' | 'intermittent' | 'poor' | 'none' | 'generator_only'
  has_generator: boolean
  has_inverter: boolean
  solar_panels: boolean
  
  // Water
  water_source: 'borehole' | 'public_water' | 'well' | 'water_vendor' | 'none'
  water_tank_capacity: number  // liters
  has_water_treatment: boolean
  
  // Internet
  internet_type: 'fiber' | 'starlink' | '4g' | '3g' | 'none'
  internet_providers: string[] // MTN, Airtel, Glo, 9Mobile, Spectranet
  
  // Roads
  road_condition: 'paved' | 'tarred' | 'untarred' | 'bad'
  road_accessibility: 'all_year' | 'dry_season_only' | 'limited'
}
```

**UI Implementation**:
```tsx
<InfrastructureIndicators>
  <Badge variant={nepaStatus === 'stable' ? 'success' : 'warning'}>
    ⚡ NEPA: {nepaStatus}
  </Badge>
  <Badge variant="info">
    💧 Water: Borehole Available
  </Badge>
  <Badge variant="success">
    📡 Internet: Fiber
  </Badge>
  <Badge variant={roadCondition === 'paved' ? 'success' : 'warning'}>
    🚗 Road: {roadCondition}
  </Badge>
</InfrastructureIndicators>
```

### 3. Security Concerns
**Context**: Gated communities, security posts, and CCTV are major selling points.

**Security Features**:
```typescript
interface SecurityFeatures {
  security_type: (
    | 'gated_community'
    | 'security_post'
    | 'cctv'
    | 'perimeter_fence'
    | 'security_dogs'
    | 'estate_security'
  )[]
  security_hours: '24/7' | 'day_only' | 'night_only' | 'none'
  has_security_levy: boolean
  security_levy_amount: number // Monthly in Naira
}
```

### 4. Extended Family Living
**Context**: Boys Quarters (BQ) are essential for extended family, staff, or rental income.

**BQ Features**:
```typescript
interface BoysQuarters {
  has_bq: boolean
  bq_type: 'self_contained' | 'room_and_parlor' | 'single_room' | 'multiple_rooms'
  bq_bathrooms: number
  bq_kitchen: boolean
  bq_separate_entrance: boolean
  bq_condition: 'excellent' | 'good' | 'fair' | 'needs_renovation'
}
```

**Terminology**:
- **BQ** (Boys Quarters): Separate living space on property
- **Self-contained**: Studio apartment (bed/kitchen/bath in one space)
- **Room and Parlor**: 1 bedroom + living room
- **Face-me-I-face-you**: Rooms facing each other in a corridor

## Nigerian States & LGAs

### Complete State List (36 + FCT)
```typescript
export const NIGERIAN_STATES = [
  { code: 'AB', name: 'Abia', capital: 'Umuahia', zone: 'South East' },
  { code: 'AD', name: 'Adamawa', capital: 'Yola', zone: 'North East' },
  { code: 'AK', name: 'Akwa Ibom', capital: 'Uyo', zone: 'South South' },
  { code: 'AN', name: 'Anambra', capital: 'Awka', zone: 'South East' },
  { code: 'BA', name: 'Bauchi', capital: 'Bauchi', zone: 'North East' },
  { code: 'BY', name: 'Bayelsa', capital: 'Yenagoa', zone: 'South South' },
  { code: 'BE', name: 'Benue', capital: 'Makurdi', zone: 'North Central' },
  { code: 'BO', name: 'Borno', capital: 'Maiduguri', zone: 'North East' },
  { code: 'CR', name: 'Cross River', capital: 'Calabar', zone: 'South South' },
  { code: 'DE', name: 'Delta', capital: 'Asaba', zone: 'South South' },
  { code: 'EB', name: 'Ebonyi', capital: 'Abakaliki', zone: 'South East' },
  { code: 'ED', name: 'Edo', capital: 'Benin City', zone: 'South South' },
  { code: 'EK', name: 'Ekiti', capital: 'Ado-Ekiti', zone: 'South West' },
  { code: 'EN', name: 'Enugu', capital: 'Enugu', zone: 'South East' },
  { code: 'FC', name: 'FCT', capital: 'Abuja', zone: 'North Central' },
  { code: 'GO', name: 'Gombe', capital: 'Gombe', zone: 'North East' },
  { code: 'IM', name: 'Imo', capital: 'Owerri', zone: 'South East' },
  { code: 'JI', name: 'Jigawa', capital: 'Dutse', zone: 'North West' },
  { code: 'KD', name: 'Kaduna', capital: 'Kaduna', zone: 'North West' },
  { code: 'KN', name: 'Kano', capital: 'Kano', zone: 'North West' },
  { code: 'KT', name: 'Katsina', capital: 'Katsina', zone: 'North West' },
  { code: 'KE', name: 'Kebbi', capital: 'Birnin Kebbi', zone: 'North West' },
  { code: 'KO', name: 'Kogi', capital: 'Lokoja', zone: 'North Central' },
  { code: 'KW', name: 'Kwara', capital: 'Ilorin', zone: 'North Central' },
  { code: 'LA', name: 'Lagos', capital: 'Ikeja', zone: 'South West' },
  { code: 'NA', name: 'Nasarawa', capital: 'Lafia', zone: 'North Central' },
  { code: 'NI', name: 'Niger', capital: 'Minna', zone: 'North Central' },
  { code: 'OG', name: 'Ogun', capital: 'Abeokuta', zone: 'South West' },
  { code: 'ON', name: 'Ondo', capital: 'Akure', zone: 'South West' },
  { code: 'OS', name: 'Osun', capital: 'Osogbo', zone: 'South West' },
  { code: 'OY', name: 'Oyo', capital: 'Ibadan', zone: 'South West' },
  { code: 'PL', name: 'Plateau', capital: 'Jos', zone: 'North Central' },
  { code: 'RI', name: 'Rivers', capital: 'Port Harcourt', zone: 'South South' },
  { code: 'SO', name: 'Sokoto', capital: 'Sokoto', zone: 'North West' },
  { code: 'TA', name: 'Taraba', capital: 'Jalingo', zone: 'North East' },
  { code: 'YO', name: 'Yobe', capital: 'Damaturu', zone: 'North East' },
  { code: 'ZA', name: 'Zamfara', capital: 'Gusau', zone: 'North West' }
] as const
```

### Lagos LGAs (Example - Most Active Market)
```typescript
export const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
  'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
]
```

### Popular Neighborhoods (Lagos Focus)
```typescript
export const LAGOS_NEIGHBORHOODS = {
  lekki: ['Lekki Phase 1', 'Lekki Phase 2', 'Ajah', 'Chevron', 'VGC'],
  ikoyi: ['Ikoyi', 'Banana Island', 'Parkview Estate'],
  vi: ['Victoria Island', 'Oniru', 'Eko Atlantic'],
  mainland: ['Yaba', 'Surulere', 'Ikeja GRA', 'Maryland', 'Gbagada'],
  ikorodu: ['Ikorodu', 'Igbogbo', 'Ibeshe', 'Ebute']
}
```

## Currency & Pricing

### Naira Formatting
```typescript
export function formatNaira(amount: number, includeDecimals = false): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(amount)
  
  return formatted // ₦2,500,000
}

// Usage in components
<span className="font-heading text-2xl">
  {formatNaira(property.price)}
  <span className="text-sm text-muted-foreground">/{property.price_frequency}</span>
</span>
```

### Pricing Context
```typescript
interface PricingInfo {
  amount: number
  frequency: 'sale' | 'annual' | 'monthly' | 'nightly'
  includes_service_charge: boolean
  service_charge_amount?: number
  includes_agency_fee: boolean
  agency_fee_percentage?: number  // Usually 10%
  caution_deposit_required: boolean
  caution_deposit_amount?: number  // Usually 1-2 years rent
  lawyer_fee_included: boolean
}

// Typical pricing patterns
const PRICING_PATTERNS = {
  sale: {
    negotiable: true,
    payment_plans: ['cash', 'installment_6months', 'installment_12months']
  },
  rent: {
    payment: 'annual',  // Most common in Nigeria
    caution_deposit: 1,  // Multiplier of annual rent
    agency_fee: 0.1,     // 10% of annual rent
    legal_fee: 50000     // Fixed amount (₦50k)
  }
}
```

## Phone Number Validation

### Nigerian Phone Format
```typescript
export function formatNigerianPhone(phone: string): string {
  // Input: 08012345678 or +2348012345678
  // Output: +234 801 234 5678
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('234')) {
    // +234 format
    const match = cleaned.match(/^(234)(\d{3})(\d{3})(\d{4})$/)
    return match ? `+${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone
  } else if (cleaned.startsWith('0')) {
    // 0 format - convert to +234
    const without0 = cleaned.substring(1)
    const match = without0.match(/^(\d{3})(\d{3})(\d{4})$/)
    return match ? `+234 ${match[1]} ${match[2]} ${match[3]}` : phone
  }
  
  return phone
}

// Validation regex
export const NIGERIAN_PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/

// Zod schema
export const nigerianPhoneSchema = z.string()
  .regex(NIGERIAN_PHONE_REGEX, 'Invalid Nigerian phone number')
  .transform(formatNigerianPhone)
```

### Network Providers
```typescript
export const NIGERIAN_NETWORKS = [
  { name: 'MTN', prefixes: ['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906'] },
  { name: 'Glo', prefixes: ['0805', '0807', '0811', '0815', '0905'] },
  { name: 'Airtel', prefixes: ['0802', '0808', '0812', '0901', '0902', '0907'] },
  { name: '9Mobile', prefixes: ['0809', '0817', '0818', '0908', '0909'] }
]

export function getNetwork(phone: string): string | null {
  const prefix = phone.substring(0, 4)
  const network = NIGERIAN_NETWORKS.find(n => n.prefixes.includes(prefix))
  return network?.name ?? null
}
```

## Language & Communication

### Tone & Voice
- **Professional but warm**: Not corporate-cold, but not casual
- **Direct and clear**: Avoid jargon, complex sentences
- **Reassuring**: Address trust concerns proactively
- **Action-oriented**: Clear CTAs, benefit-focused

### Pidgin English Considerations
While UI is in standard English, customer support should understand:
- "How e be?" = How are you?
- "Wetin dey happen?" = What's happening?
- "I dey find house" = I'm looking for a house
- "Oga/Madam" = Sir/Ma'am (respectful address)

### Property Descriptions Style
```typescript
// Good Nigerian property description
const goodDescription = `
Modern 3-bedroom flat in serene Lekki environment. 
Features: All rooms ensuite, fitted kitchen, 24/7 power from estate, 
borehole water, gated community with security, good road network.
Suitable for family living.
`

// Avoid overly formal/foreign style
const avoid = `
Exquisite residential unit featuring contemporary amenities 
within an exclusive enclave...
`
```

## Property Types (Nigerian Context)

### Residential Types
```typescript
export const NIGERIAN_PROPERTY_TYPES = {
  residential: [
    { value: 'duplex', label: 'Duplex', description: '2-story house' },
    { value: 'bungalow', label: 'Bungalow', description: 'Single-story house' },
    { value: 'flat', label: 'Flat/Apartment', description: 'Unit in building' },
    { value: 'self_contained', label: 'Self-Contained', description: 'Studio apartment' },
    { value: 'mini_flat', label: 'Mini Flat', description: '1 bedroom with parlor' },
    { value: 'room_and_parlor', label: 'Room and Parlor', description: '1 bed + living' },
    { value: 'single_room', label: 'Single Room', description: 'Shared facilities' },
    { value: 'penthouse', label: 'Penthouse', description: 'Top-floor luxury' },
    { value: 'terrace', label: 'Terrace/Townhouse', description: 'Row houses' },
    { value: 'detached_house', label: 'Detached House', description: 'Standalone house' }
  ],
  commercial: [
    { value: 'shop', label: 'Shop', description: 'Retail space' },
    { value: 'office', label: 'Office Space', description: 'Commercial office' },
    { value: 'warehouse', label: 'Warehouse', description: 'Storage facility' },
    { value: 'showroom', label: 'Showroom', description: 'Display space' }
  ],
  event: [
    { value: 'event_center', label: 'Event Center', description: 'Party/wedding venue' },
    { value: 'hotel', label: 'Hotel', description: 'Hospitality property' },
    { value: 'restaurant', label: 'Restaurant', description: 'Food service' }
  ],
  land: [
    { value: 'residential_land', label: 'Residential Land', description: 'For housing' },
    { value: 'commercial_land', label: 'Commercial Land', description: 'For business' },
    { value: 'mixed_use_land', label: 'Mixed Use Land', description: 'Flexible zoning' },
    { value: 'farmland', label: 'Farmland', description: 'Agricultural use' }
  ]
}
```

## Legal & Document Types

### Required Documents (Nigerian Law)
```typescript
export const NIGERIAN_PROPERTY_DOCUMENTS = [
  {
    type: 'certificate_of_occupancy',
    name: 'Certificate of Occupancy (C of O)',
    required: true,
    description: 'Government-issued proof of land ownership',
    issuer: 'State Government'
  },
  {
    type: 'deed_of_assignment',
    name: 'Deed of Assignment',
    required: true,
    description: 'Transfer document from seller to buyer',
    issuer: 'Lawyer/Court'
  },
  {
    type: 'survey_plan',
    name: 'Survey Plan',
    required: true,
    description: 'Licensed surveyor-prepared land measurement',
    issuer: 'Licensed Surveyor'
  },
  {
    type: 'tax_receipt',
    name: 'Tax Clearance/Ground Rent',
    required: true,
    description: 'Proof of property tax payment',
    issuer: 'State Revenue Service'
  },
  {
    type: 'building_approval',
    name: 'Building Approval',
    required: false,
    description: 'For developed properties - construction permit',
    issuer: 'State Physical Planning Authority'
  }
]
```

## Search & Discovery Patterns

### Nigerian Search Behaviors
Users commonly search by:
1. **Neighborhood/Estate** (not just LGA)
2. **Price range** (budget-conscious)
3. **NEPA status** (power is critical)
4. **Has BQ** (extended family)
5. **Gated community** (security)
6. **New/Old property** (condition matters)

### Search UI Implementation
```tsx
<SearchFilters>
  <Select label="State" items={NIGERIAN_STATES} />
  <Select label="LGA" items={getLGAs(selectedState)} />
  <Input label="Estate/Neighborhood" placeholder="e.g., Lekki Phase 1" />
  
  <PriceRange
    min={0}
    max={100000000}
    label="Price Range"
    formatter={formatNaira}
  />
  
  <Select label="Power Status">
    <option value="stable">24/7 Power</option>
    <option value="intermittent">Intermittent Power</option>
    <option value="generator_only">Generator Only</option>
  </Select>
  
  <Checkbox label="Gated Community" />
  <Checkbox label="Has BQ (Boys Quarters)" />
  <Checkbox label="Borehole/Water" />
</SearchFilters>
```

## Date & Time Localization

### Nigerian Time Zone
```typescript
// West Africa Time (WAT) = UTC+1
export const NIGERIAN_TIMEZONE = 'Africa/Lagos'

export function formatNigerianDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    timeZone: NIGERIAN_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatNigerianDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    timeZone: NIGERIAN_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true  // Nigerians use 12-hour format
  }).format(new Date(date))
}

// Example: "May 15, 2024 at 3:30 PM"
```

## Seasonal Considerations

### Rainy Season (March - October)
- Road accessibility questions more important
- Flooding concerns in certain areas
- Drainage system becomes key feature

### Harmattan Season (November - February)
- Dust concerns
- Air quality mentions
- Window/AC maintenance

### Moving Patterns
- Most relocations: January (new year), September (school term)
- Rental market peaks: November-December (year-end)
- Sales market: Year-round but slower in rainy season

## Marketing Copy Examples

### Property Headlines (Nigerian Style)
✅ Good:
- "3-Bedroom Flat in Lekki with 24/7 Power"
- "Duplex with BQ in Gated Estate, Ajah"
- "Self-Contained Apartment with Borehole, Yaba"

❌ Avoid:
- "Luxurious Urban Retreat" (too vague)
- "Premium Living Space" (not specific)
- "Contemporary Residence" (too formal)

### CTA Copy
✅ Nigerian Market:
- "View Property"
- "Contact Owner"
- "Schedule Inspection"
- "Send Inquiry"

❌ Foreign Market:
- "Book a Tour" (too casual)
- "Request Information" (too formal)
- "Add to Cart" (inappropriate for real estate)

## Reference Files

- **Location Data**: `lib/constants/nigerian-locations.ts`
- **Phone Validation**: `lib/utils/phone-validation.ts`
- **Currency Utils**: `lib/utils/currency.ts`
- **Property Types**: `lib/constants/property-types.ts`
- **Infrastructure Components**: `components/untitledui/infrastructure-indicators.tsx`
