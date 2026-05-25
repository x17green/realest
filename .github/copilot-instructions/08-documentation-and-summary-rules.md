---
name: documentation-and-summary-rules
version: 1.0.0
category: Output & Artifact Management
applies_to: "**/*.md, **/docs/**, **/*.ts, **/*.tsx"
trigger: task-completion, documentation, summary-creation
---

# 📋 STRICT DOCUMENTATION & SUMMARY FILE RULES

**Status:** ✅ MANDATORY & ENFORCED  
**Violation Impact:** Commit rejection, task re-assignment

> **GOLDEN RULE:** One piece of information, one file. No duplication. No redundancy.

---

## ❌ PROHIBITED BEHAVIORS

### 1. Creating Duplicate/Similar Summary Files

**PROHIBITED:**
```
docs/api-documentation-setup.md
docs/api-documentation-setup-guide.md       ← ❌ DO NOT CREATE
docs/api-documentation-complete.md           ← ❌ DO NOT CREATE
docs/api-auto-update-implementation-complete.md ← ❌ DO NOT CREATE
```

**WHY:** Creates confusion, breaks DRY principle, makes docs unsearchable

**CORRECT APPROACH:**
- Update existing file: `docs/api-documentation.md`
- OR consolidate into: `docs/01-api-setup.md` (ordered naming)
- Never create new files for same topic

### 2. Creating Per-Task Summary Documents

**PROHIBITED:**
```
docs/session-completion-summary.md
docs/ml-validation-implementation-checklist.md
docs/property-form-refactoring-complete.md
docs/referral-waitlist-rewards-implementation-spec.md
```

**WHY:** 
- Each task creates NEW file instead of updating existing docs
- Docs folder becomes unusable garbage heap
- Team can't find information

**CORRECT APPROACH:**
- Update the SPECIFIC feature documentation, not create a summary
- Example: Working on property form? Update `docs/form-patterns.md`
- Example: ML validation? Update `docs/ml-validation.md` (single source of truth)
- No new files allowed per task

### 3. Creating Multiple Variations of Same Topic

**PROHIBITED:**
```
docs/openapi-endpoint-template.md
docs/api-workflow-add-new-endpoint.md
docs/auto-document-apis.md
docs/auto-documentation-system-overview.md
docs/api-documentation-complete.md
```

**WHY:** 5 files about same topic = team doesn't know which to read

**CORRECT APPROACH:**
Create ONE master file with sections:
- `docs/api-documentation.md` with:
  - `## Quick Start` (template)
  - `## Workflow` (step-by-step)
  - `## System Overview` (how it works)
  - `## Common Patterns` (examples)

---

## ✅ CORRECT DOCUMENTATION PATTERNS

### Pattern 1: Ordered Topic Files

```
docs/
  01-getting-started.md          (onboarding)
  02-authentication.md            (auth patterns)
  03-database-schema.md           (DB structure)
  04-api-documentation.md         (API setup, workflow, templates, examples - ALL IN ONE)
  05-component-library.md         (components)
  ROADMAP.md                      (project timeline)
  README.md                       (overview)
```

**Rule:** Prefix with number for organization. One topic = one file.

### Pattern 2: Existing File Updates

When task affects existing documentation:
```
Task: "Add new API endpoint documentation workflow"

WRONG:
- Create docs/api-workflow-add-new-endpoint.md (NEW FILE)
- Create docs/api-documentation-setup-guide.md (NEW FILE)

CORRECT:
- Find: docs/api-documentation.md (existing)
- Update: Add "## Workflow" section
- Update: Add "## Templates" section
- Commit: Single file change
```

### Pattern 3: Cross-Cutting Concerns

When a task spans multiple systems:
```
Task: "Setup API documentation for entire project"

WRONG:
- docs/api-setup.md
- docs/api-workflow.md
- docs/api-templates.md
- docs/api-complete.md

CORRECT:
- Ensure: docs/api-documentation.md is COMPLETE
- Sections:
  1. Setup/Installation
  2. Workflow
  3. Templates
  4. Examples
  5. Troubleshooting
```

### Pattern 4: Ordered Architecture Docs

```
copilot-instructions/
  00-architecture-overview.md     (start here)
  01-design-system.md             (UI/styling)
  02-component-library.md         (components)
  03-typescript-types.md          (type safety)
  04-authentication.md            (auth)
  05-nigerian-market.md           (localization)
  07-api-documentation.md         (APIs)
  META-COGNITIVE-SYSTEM.md        (reasoning system)
  AI-COMMIT-RULES.md              (commit rules)
  PROMPTS.md                      (prompt templates)
```

**Rule:** Numbered 00-09 for ordered reading. Special files at end.

---

## 🚫 RED FLAGS (Commit Will Be Rejected)

**Agent creates file when it should update existing?**
```bash
# ❌ This will be rejected:
- Created: docs/new-summary-about-task.md

# ✅ This will be accepted:
- Updated: docs/existing-feature.md
```

**Checklist before committing:**

```
☐ No duplicate files about same topic
☐ One topic = one file
☐ Updated existing docs instead of creating new?
☐ No "summary" or "complete" files
☐ No "implementation" files for already-documented features
☐ No per-task documentation files
☐ Files use consistent naming: ordered numbers or descriptive names
☐ Cross-referenced from README.md or index
☐ Consolidated similar content
```

---

## 📁 Docs Cleanup Guide

**Current State (CLUTTERED):**
```
docs/
  api-documentation-setup.md
  api-documentation-setup-guide.md          ← Duplicate!
  api-documentation-complete.md             ← Duplicate!
  api-auto-update-implementation-complete.md ← Duplicate!
  auto-document-apis.md                     ← Duplicate!
  auto-documentation-system-overview.md     ← Duplicate!
  api-workflow-add-new-endpoint.md          ← Duplicate!
  openapi-endpoint-template.md              ← Duplicate!
  ... [40+ more files, many redundant]
```

**Target State (ORGANIZED):**
```
docs/
  README.md                       (overview)
  01-getting-started.md           (onboarding)
  04-api-documentation.md         (setup + workflow + templates + examples)
  05-form-patterns.md             (forms - consolidated)
  ROADMAP.md                      (timeline)
  design/
    realest-ng-design-architecture.md
    theme-system.md
  deprecated/
    [old files moved here]
```

**Action Steps:**
1. For each "summary" file, identify what feature it covers
2. Find the main feature doc (e.g., `04-api-documentation.md`)
3. Merge content into main doc
4. Delete the summary file
5. Update cross-references
6. Commit: "refactor: consolidate docs"

---

## 🎯 Task Completion = Update Docs, Don't Create New Ones

### Example 1: API Documentation Task

**Task:** "Implement auto-documentation for new API endpoints"

**WRONG Outcome:**
- Created: `docs/api-documentation-setup.md`
- Created: `docs/api-workflow-add-new-endpoint.md`
- Created: `docs/api-auto-update-implementation-complete.md`
- Created: `docs/API-DOCUMENTATION-DEPLOYMENT-READY.md`

**RIGHT Outcome:**
- Updated: `docs/04-api-documentation.md` with:
  - `## Getting Started`
  - `## Workflow`
  - `## Templates`
  - `## Testing`
  - `## Troubleshooting`

### Example 2: Component Task

**Task:** "Create new form component for property verification"

**WRONG Outcome:**
- Created: `docs/property-form-refactoring-complete.md`
- Created: `docs/property-form-implementation-spec.md`

**RIGHT Outcome:**
- Updated: `docs/05-form-patterns.md` with:
  - New section: "## Property Verification Form"
  - Include: pattern, example code, validation rules

---

## 🔐 Enforcement Rules

### For Agents:

**Before creating ANY .md file:**
```
1. Does this documentation already exist?
   - Search docs/ folder
   - Check copilot-instructions/
   - Check README.md references
   
2. If existing, UPDATE it
   - Add new section
   - Expand explanation
   - Add examples
   
3. If NOT existing, CREATE only if:
   - Core new feature (not a task variation)
   - Multiple teams need it
   - Can't fit in existing docs
   
4. Use naming convention:
   - Ordered: 00-name.md
   - Descriptive: feature-name.md
   - NO summaries, NO "complete", NO "implementation"
```

### For Commit Reviews:

**Reject if:**
- New file duplicates existing topic
- "summary" or "complete" in filename
- More than 1 doc file per feature
- Docs folder has >30 files
- Files aren't consolidated

**Accept if:**
- Updates existing file
- Ordered/descriptive naming
- Cross-referenced from index
- Consolidates similar content
- Docs folder stays clean (<25 files for core docs)

---

## ✅ CURRENT DOCS ORGANIZATION

After cleanup, target structure:

```
docs/
  README.md                           (Start here)
  01-getting-started.md               (Onboarding)
  02-architecture.md                  (System design)
  03-design-system.md                 (UI/Styling)
  04-components.md                    (Component library)
  05-api-documentation.md             (APIs - complete)
  06-forms.md                         (Form patterns)
  07-authentication.md                (Auth)
  08-database.md                      (Database schema)
  09-deployment.md                    (Deployment)
  ROADMAP.md                          (Project timeline)
  references/
    nigerian-market.md
    type-reference.md
    color-tokens.md
  examples/
    property-form-example.md
    api-endpoint-example.md
  deprecated/
    [old files archived here]
```

**Benefits:**
- ✅ Clear navigation
- ✅ No duplication
- ✅ Easy to find information
- ✅ Scales with project
- ✅ Team productivity +40%

---

## 🚀 Implementation

**For New Tasks:**
1. Read this file before starting
2. Search existing docs for related content
3. Update instead of create
4. Link from README.md
5. Consolidate before committing

**For Existing Docs:**
1. Move files to `docs/deprecated/` (don't delete)
2. Consolidate content into main files
3. Update cross-references
4. Commit: `refactor: consolidate documentation`

---

## 📞 Questions?

| Question | Answer |
|----------|--------|
| "Should I create a new file?" | Update existing file instead |
| "This is a new topic!" | Still, find closest existing doc and add section |
| "I need to document my task completion" | Update the feature docs, not create task summary |
| "Multiple files for same topic?" | CONSOLIDATE into one |

---

**Status:** ✅ ACTIVE ENFORCEMENT  
**Violation Result:** Commit rejection + re-work  
**Last Updated:** May 24, 2026
