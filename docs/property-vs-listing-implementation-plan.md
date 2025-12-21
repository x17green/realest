# Property vs Listing Route Implementation Plan

## Analysis Summary

### Current State

**Property Page Location**: `app/(public)/property/[id]/page.tsx` (639 lines)

**Key Implementation Details**:
- **Framework**: React client component ("use client")
- **Data Fetching**: Supabase query in useEffect hook
- **Query Pattern**: `.from("properties").select(...).eq("id", propertyId).eq("status", "active").single()`
- **Relations**: Joins to `property_details`, `property_media`, and `owner:profiles`
- **Contact**: Inquiry form targeting owner (user_email field seems deprecated - should use inquiry table)
- **UI Structure**: Image gallery (thumbnails) → Main details grid → Sidebar with contact form + owner info
- **Components Used**: HeroUI Card, Button, Chip, Avatar, Input, TextArea; Lucide icons

**Listing Route Status**: `app/(public)/listing/[id]/` folder exists but is **empty** - needs full implementation

**Database Support**: 
- ✅ Migration applied: `agents` table created with license_number, specialization[], verified, rating
- ✅ `properties.agent_id` foreign key added
- ✅ `properties.listing_source` column added ('owner' | 'agent')
- ⚠️ Current property page query **does not filter by listing_source** - will show both owner and agent listings

---

## Implementation Strategy

### Phase 1: Refactor Property Page (5-10 mins)

**File**: `app/(public)/property/[id]/page.tsx`

**Changes**:
1. Add `.eq("listing_source", "owner")` filter to Supabase query
2. Keep everything else identical

**Current Query**:
```typescript
const { data, error } = await supabase
  .from("properties")
  .select(`
    *,
    property_details (*),
    property_media (*),
    owner:profiles!properties_owner_id_fkey (
      id,
      full_name,
      email,
      phone,
      avatar_url
    )
  `)
  .eq("id", propertyId)
  .eq("status", "active")
  .single();
```

**Updated Query**:
```typescript
const { data, error } = await supabase
  .from("properties")
  .select(`
    *,
    property_details (*),
    property_media (*),
    owner:profiles!properties_owner_id_fkey (
      id,
      full_name,
      email,
      phone,
      avatar_url
    )
  `)
  .eq("id", propertyId)
  .eq("listing_source", "owner")  // ← ADD THIS LINE
  .eq("status", "active")
  .single();
```

**Risk**: None - this is additive filtering, won't break existing functionality

---

### Phase 2: Create Listing Page (20-30 mins)

**File**: `app/(public)/listing/[id]/page.tsx` (NEW)

**Strategy**: Copy property page, adapt for agent listings

**Key Changes**:

#### 1. Update Query to Join Agents Table
```typescript
const { data, error } = await supabase
  .from("properties")
  .select(`
    *,
    property_details (*),
    property_media (*),
    agent:agents!properties_agent_id_fkey (
      id,
      profile_id,
      license_number,
      agency_name,
      specialization,
      verified,
      rating,
      agent_profile:profiles!agents_profile_id_fkey (
        id,
        full_name,
        email,
        phone,
        avatar_url
      )
    )
  `)
  .eq("id", propertyId)
  .eq("listing_source", "agent")  // ← Agent listing filter
  .eq("status", "active")
  .single();
```

#### 2. Update TypeScript Interface
```typescript
interface AgentListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  // ... keep all other fields same as Property interface
  
  // Replace owner with agent
  agent: {
    id: string;
    license_number: string;
    agency_name: string;
    specialization: string[];
    verified: boolean;
    rating: number;
    agent_profile: {
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
      avatar_url: string | null;
    };
  };
  // Remove owner field
  // owner: { ... };
}
```

#### 3. Update Sidebar Contact Section
**Current (lines 450-530)**:
- Shows "Contact Property Owner" form
- Target: owner email in inquiry table

**Change to**:
- Show "Contact Agent" form
- Display agency name + license number
- Target: agent email in inquiry table (or new inquiry routing)

#### 4. Update Owner Info Section
**Current (lines 530+)**:
- Shows owner avatar, name, phone, email
- Shows "Listed by" heading

**Change to**:
- Show agent profile photo
- Display agency name and license number
- Show specialization badges
- Show rating/reviews (if available)
- Keep "Listed by" or use "Agency" heading

---

## Implementation Details

### What to Keep Identical
- Image gallery (thumbnail selector)
- Property details grid (bed/bath/sqft/parking)
- Description section
- Amenities section
- Location map section
- Form validation and submission logic
- Loading and error states
- CSS/styling and responsive breakpoints

### What to Modify
- Supabase query filters and joins
- Owner info sidebar → Agent info sidebar
- Contact form target (owner email → agent email)
- TypeScript interface (owner → agent)
- Section headings ("Contact Property Owner" → "Contact Agent")

### Error Cases
1. **Property not found**: Same as property page
2. **Wrong listing_source**: If user visits `/listing/[id]` for owner property, returns "Property Not Found"
3. **Agent not found**: If agent is deleted but agent_id still references old ID, show "Agent information unavailable"

---

## Code Duplication Assessment

**Current Duplication**: ~90% identical between property and listing pages (expected)

**Reusable Components**:
1. **PropertyHeader** (property title, price, location, type badges)
2. **PropertyDetailsGrid** (bed/bath/sqft/parking/year_built)
3. **InquiryForm** (generic contact form, parameterized for owner/agent)
4. **ContactInfoCard** (avatar, name, contact details - adaptable)

**Recommendation**: Skip component extraction for now since:
- Pages are similar but not identical enough to justify shared component complexity
- Maintenance is simpler with separate, self-contained pages
- Can refactor to components in Phase 2 if more similar pages are added

---

## Testing Checklist

### Property Page (/property/[id])
- [ ] Loads owner-listed property with correct data
- [ ] Filters out agent-listed properties (returns 404)
- [ ] Displays owner contact info in sidebar
- [ ] Inquiry form submits correctly
- [ ] Loading states work
- [ ] Verification badge displays correctly

### Listing Page (/listing/[id])
- [ ] Loads agent-listed property with correct data
- [ ] Filters out owner-listed properties (returns 404)
- [ ] Displays agent contact info in sidebar
- [ ] Shows agency name and license number
- [ ] Inquiry form submits correctly
- [ ] Loading states work
- [ ] Verification badge displays correctly

### Cross-Route Testing
- [ ] No overlap: /property shows owner listings, /listing shows agent listings
- [ ] Navigating to wrong type returns 404
- [ ] Both routes handle missing properties gracefully

---

## Database Query Validation

### Property Route Query
```sql
SELECT *,
  property_details (*)
  property_media (*)
  owner:profiles!properties_owner_id_fkey (id, full_name, email, phone, avatar_url)
FROM properties
WHERE id = $1
  AND listing_source = 'owner'
  AND status = 'active'
LIMIT 1
```

### Listing Route Query
```sql
SELECT *,
  property_details (*)
  property_media (*)
  agent:agents!properties_agent_id_fkey (
    id, license_number, agency_name, specialization, verified, rating,
    agent_profile:profiles!agents_profile_id_fkey (id, full_name, email, phone, avatar_url)
  )
FROM properties
WHERE id = $1
  AND listing_source = 'agent'
  AND status = 'active'
LIMIT 1
```

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `app/(public)/property/[id]/page.tsx` | Add `.eq("listing_source", "owner")` filter | HIGH |
| `app/(public)/listing/[id]/page.tsx` | Create new file, adapt property page for agents | HIGH |
| `lib/supabase/types.ts` | Add AgentListing type (optional, use inline for now) | LOW |
| `docs/route-alignment-analysis.md` | Update with implementation notes | LOW |

---

## Estimated Effort

- **Phase 1 (Property refactor)**: 5 minutes
- **Phase 2 (Listing creation)**: 20-30 minutes
- **Testing**: 10 minutes
- **Documentation**: 5 minutes
- **Total**: ~45-55 minutes for complete implementation

---

## Success Criteria

1. ✅ Property page only shows owner-listed properties
2. ✅ Listing page only shows agent-listed properties
3. ✅ Both pages display correct contact info (owner vs agent)
4. ✅ Inquiry forms submit successfully
5. ✅ No type errors or warnings
6. ✅ Loading and error states work correctly
7. ✅ Responsive design maintained on mobile/tablet/desktop

---

## Next Steps (Deferred to Phase 2)

Once both pages are implemented:
1. Create `/explore` route for category discovery
2. Build admin verification dashboard
3. Implement agent analytics and ratings
4. Add real inquiry routing logic
5. Integrate Mapbox for interactive locations

