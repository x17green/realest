# Registration Logic Analysis - Agent Support

**Date**: December 19, 2025  
**Status**: ⚠️ INCOMPLETE - Agent signup not fully supported

---

## Executive Summary

The current registration system **does not support agent signup**. The UI only shows two roles (Buyer, Property Owner), and the backend explicitly restricts user_type to three values, excluding 'agent'.

### Key Findings

| Component | Status | Support |
|-----------|--------|---------|
| **UI Role Selection** | ❌ Missing | Only "Buyer" and "Property Owner" |
| **Backend Validation** | ❌ Blocking | `user_type` CHECK constraint excludes 'agent' |
| **Profile Creation** | ✅ Works | Auto-created via database trigger |
| **Agent-Specific Fields** | ❌ Missing | No license_number, agency_name, specialization capture |

---

## Current Registration Flow

### 1. UI - Role Selection (Step 1)

**File**: `app/(auth)/register/page.tsx` (lines 71-104)

```tsx
<button onClick={() => handleRoleSelect("buyer")}>
  <Users className="w-6 h-6" />
  <div>
    <div className="font-medium">Buyer or Renter</div>
    <div className="text-sm text-muted-foreground">
      Find and inquire about properties
    </div>
  </div>
</button>

<button onClick={() => handleRoleSelect("owner")}>
  <Building className="w-6 h-6" />
  <div>
    <div className="font-medium">Property Owner</div>
    <div className="text-sm text-muted-foreground">
      List and manage your properties
    </div>
  </div>
</button>
```

**Problem**: No "Agent" option shown to users

---

### 2. Form Submission - Account Details (Step 2)

**File**: `app/(auth)/register/page.tsx` (lines 35-69)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  try {
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          user_type: formData.userType,  // ← Can be: user, owner, or agent
        },
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      router.push("/register-success");
    }
  }
};
```

**Problem**: No agent-specific fields captured (license_number, agency_name, specialization)

---

### 3. Backend Validation - Auth Function

**File**: `lib/auth.ts` (line 23)

```typescript
export interface UserProfile {
  id: string;
  user_type: "user" | "owner" | "admin";  // ← 'agent' NOT in type
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}
```

**Problem**: UserProfile interface doesn't include 'agent'

Also in `signUpWithPassword` function (line 116):

```typescript
export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string,
  userType: "user" | "owner"  // ← 'agent' NOT accepted
): Promise<AuthResponse>
```

**Problem**: Function signature explicitly excludes 'agent' as valid userType

---

### 4. Database Constraint - Profiles Table

**File**: `scripts/sql/001_create_profiles.sql` (line 5)

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  user_type text not null check (user_type in ('owner', 'user', 'admin')),
  -- ↑ 'agent' NOT in allowed values
  avatar_url text,
  phone text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

**Problem**: CHECK constraint will reject 'agent' value

---

### 5. Auto-Profile Creation - Database Trigger

**File**: `scripts/sql/007_create_profile_trigger.sql`

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, user_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'user_type', 'buyer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
```

**Status**: ✅ WORKS - Reads from auth.users.raw_user_meta_data  
**Problem**: Will fail if user_type='agent' (violates CHECK constraint)

---

## What Gets Stored During Signup

### Currently Captured

```typescript
// These fields go to auth.users
email: "agent@company.com"
password: "SecurePassword123!"

// These go to auth.users.raw_user_meta_data
full_name: "John Smith"
user_type: "owner" | "user"  // Only these two

// Trigger auto-creates profiles record with:
// id, email, user_type
```

### Missing for Agent Signup

```typescript
// These are NOT captured:
license_number: "LICENSE-12345"
agency_name: "Smith Real Estate Inc"
specialization: ["residential", "commercial"]
verified: false  // Initially unverified
```

---

## Data Flow Diagram

### Current Flow (Buyer/Owner Only)

```
User selects "Buyer" or "Property Owner"
         ↓
Form captures: email, password, full_name
         ↓
signUp() calls supabase.auth.signUp()
  → passes user_type in options.data
         ↓
auth.users row created
  → raw_user_meta_data: {full_name, user_type}
         ↓
Trigger fires: handle_new_user()
  → INSERT into profiles (id, email, user_type)
         ↓
Profile created successfully ✅
         ↓
Redirect to /register-success
```

### Attempted Flow for Agent (Will Fail)

```
User tries to select "Agent" (DOESN'T EXIST)
         ↓
Form captures: email, password, full_name
  + license_number, agency_name, specialization
         ↓
signUp() calls supabase.auth.signUp()
  → passes user_type='agent'
         ↓
auth.users row created
  → raw_user_meta_data: {full_name, user_type: 'agent'}
         ↓
Trigger fires: handle_new_user()
  → INSERT into profiles (user_type='agent')
         ↓
❌ CONSTRAINT VIOLATION
    "user_type in ('owner', 'user', 'agent', 'admin')"
         ↓
INSERT fails - profile never created
User stuck in limbo
```

---

## Complete Implementation Checklist

### ✅ Already Done (Database)

- ✅ `agents` table exists with: id, profile_id, license_number, agency_name, specialization[], verified, rating
- ✅ `properties.agent_id` foreign key exists
- ✅ `properties.listing_source` column exists ('owner' | 'agent')
- ✅ `profiles.user_type` constraint needs update

### ❌ MUST DO - Database

```sql
-- 1. Update profiles table CHECK constraint
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_user_type_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_type_check
CHECK (user_type in ('owner', 'user', 'admin', 'agent'));
```

### ❌ MUST DO - Backend (lib/auth.ts)

```typescript
// 1. Update UserProfile interface
export interface UserProfile {
  id: string;
  user_type: "user" | "owner" | "admin" | "agent";  // ← ADD 'agent'
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

// 2. Update signUpWithPassword function signature
export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string,
  userType: "buyer" | "owner" | "agent"  // ← ADD 'agent'
): Promise<AuthResponse>

// 3. Create new signUpWithAgent function (or extend signUpWithPassword)
export async function signUpWithAgent(
  email: string,
  password: string,
  fullName: string,
  licenseNumber: string,
  agencyName: string,
  specialization: string[]
): Promise<AuthResponse> {
  // Calls signUpWithPassword with userType='agent'
  // Then creates agents table record
}
```

### ❌ MUST DO - UI (app/(auth)/register/page.tsx)

```tsx
// 1. Add Agent button to Step 1 (line 104)
<button onClick={() => handleRoleSelect("agent")}>
  <Briefcase className="w-6 h-6 text-primary" />
  <div>
    <div className="font-medium">Real Estate Agent</div>
    <div className="text-sm text-muted-foreground">
      List and manage client properties
    </div>
  </div>
</button>

// 2. Extend formData state
const [formData, setFormData] = useState({
  userType: "",
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  // Agent-specific fields
  licenseNumber: "",
  agencyName: "",
  specialization: [],
});

// 3. Show agent-specific fields in Step 2
{formData.userType === "agent" && (
  <>
    <div className="space-y-2">
      <label htmlFor="licenseNumber">License Number</label>
      <Input
        id="licenseNumber"
        placeholder="e.g., LICENSE-12345"
        value={formData.licenseNumber}
        onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
        required
      />
    </div>
    
    <div className="space-y-2">
      <label htmlFor="agencyName">Agency Name</label>
      <Input
        id="agencyName"
        placeholder="Your real estate agency"
        value={formData.agencyName}
        onChange={(e) => handleInputChange("agencyName", e.target.value)}
        required
      />
    </div>
    
    <div className="space-y-2">
      <label>Specializations</label>
      <div className="space-y-2">
        {["Residential", "Commercial", "Luxury", "Investment"].map(spec => (
          <Checkbox
            key={spec}
            checked={formData.specialization.includes(spec)}
            onChange={() => toggleSpecialization(spec)}
          >
            {spec}
          </Checkbox>
        ))}
      </div>
    </div>
  </>
)}

// 4. Update handleSubmit to call new agent signup path
if (formData.userType === "agent") {
  const result = await signUpWithAgent(
    formData.email,
    formData.password,
    formData.fullName,
    formData.licenseNumber,
    formData.agencyName,
    formData.specialization
  );
}
```

### ❌ MUST DO - Onboarding

After agent signup succeeds, need onboarding flow:
- Create agents table record with profile_id, license_number, agency_name, specialization
- Redirect to `/agent/onboarding` (not yet created)
- Collect additional fields: specialization verification, agency affiliation, etc.

---

## Risk Assessment

### Current State ⚠️

If user somehow passes 'agent' as user_type:
1. **Auth signup succeeds** - Supabase just stores the value in metadata
2. **Profile creation fails** - Database trigger violates CHECK constraint
3. **User account is orphaned** - Auth record exists but no profile record
4. **Dashboard pages crash** - Code assumes profile exists

### Severity

**HIGH** - Broken agent signup would need database fix and user support to recover

---

## Implementation Priority

### Phase 1 - CRITICAL (Enable Agent Signup)

1. Update `001_create_profiles.sql` CHECK constraint
2. Update `lib/auth.ts` types and functions
3. Update `app/(auth)/register/page.tsx` UI
4. Run database migration

**Effort**: 2-3 hours  
**Risk**: Low (additive changes only)

### Phase 2 - IMPORTANT (Complete Agent Experience)

1. Create `lib/auth.ts` signUpWithAgent function
2. Create agents table record after signup
3. Build `/agent/onboarding` page
4. Create `/agent` dashboard
5. Update redirect logic

**Effort**: 4-6 hours  
**Risk**: Medium (new flows)

### Phase 3 - NICE-TO-HAVE (Verification)

1. Admin agent verification page
2. License number validation
3. Agency affiliation lookup
4. Rating system initialization

**Effort**: 3-4 hours  
**Risk**: Low

---

## Testing Plan

### Phase 1 Validation

```
✅ Agent role selection appears in UI
✅ License number & agency fields shown when "Agent" selected
✅ Form validation works (required fields)
✅ Signup succeeds with user_type='agent'
✅ Profile created with user_type='agent'
✅ Redirect to /register-success
✅ Can login after email verification
✅ /agent dashboard accessible
```

### Phase 2 Validation

```
✅ agents table record created
✅ profile_id foreign key set correctly
✅ Specializations stored as JSON array
✅ Onboarding flow works
✅ Agent can create listings with listing_source='agent'
✅ /listing/[id] shows agent info
✅ Inquiry notifications sent to agent
```

---

## Files That Need Changes

| File | Change | Reason |
|------|--------|--------|
| `scripts/sql/001_create_profiles.sql` | Update CHECK constraint | Add 'agent' to allowed values |
| `lib/auth.ts` | Update types and functions | Support 'agent' user_type |
| `app/(auth)/register/page.tsx` | Add agent role & fields | UI for agent signup |
| `lib/auth.ts` | Add signUpWithAgent function | Backend agent creation logic |
| `app/(onboarding)/agent-setup/page.tsx` | NEW | Agent-specific onboarding |
| `app/(dashboard)/agent/page.tsx` | NEW | Agent dashboard (already exists?) |

---

## Summary

**Current Status**: Agent signup is **NOT implemented** despite database infrastructure being ready.

**Quick Fix** (30 mins):
- Update database CHECK constraint
- Update TypeScript types
- Add Agent option to signup UI

**Full Implementation** (4-6 hours):
- Complete signup flow
- Create agents table records
- Build onboarding
- Build agent dashboard

**Recommendation**: Implement Phase 1 immediately to prevent broken signups, then Phase 2 for complete agent experience.

