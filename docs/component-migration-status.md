# Component Library Migration Status (Hybrid Approach)

## Current vs Target (Dec 2025)
- **Current adoption:** ~20% HeroUI • ~5% UntitledUI • ~75% Shadcn (components/ui/* dominates)
- **Target (70-25-5):** 70% HeroUI • 25% UntitledUI • 5% Shadcn (complex patterns only)
- **Theme system:** HeroUI CSS variables already mapped in components/providers/realest-theme-provider.tsx
- **Risk:** Dual libraries increase bundle size and maintenance overhead

## Priorities (next 6-8 weeks)
1) Re-organize components: move flat root components into domain folders (admin/, owner/, property/, marketing/)
2) Grow HeroUI wrappers: **DONE** for inputs, text areas, selects, dialogs; add tables next to reduce Shadcn reliance in new work
3) Expand UntitledUI: add infrastructure/status indicators for Nigerian market (NEPA, water, security, BQ)
4) Constrain Shadcn: keep command/combobox/context-menu/data-table; avoid new Shadcn usage elsewhere
5) Add lint/PR checks: **DONE** (warns on non-allowlist Shadcn imports)

## Phased Migration Plan
- **Phase A (Weeks 1-2): Documentation + Guardrails**
  - Update docs (done) to reflect current vs target
  - Add ESLint rule or lint script to warn on new Shadcn imports outside allowlist **(done)**
  - Create HeroUI wrapper stubs for Input, Select, TextArea, Dialog, Table **(inputs/selects/dialogs done)**
- **Phase B (Weeks 3-6): Adoption in new work**
  - Require HeroUI for all new forms/buttons/cards/navigation
  - Introduce UntitledUI status/infrastructure components into dashboards
  - Begin refactoring high-traffic pages (auth/public/search) to HeroUI wrappers
- **Phase C (Weeks 7-12): Refactor existing surfaces**
  - Swap Shadcn primitives in admin/owner dashboards to HeroUI equivalents
  - Limit Shadcn to command palette, combobox, context menu, data table only
  - Track bundle size deltas and runtime perf

## Allowlist (Shadcn kept)
- Command palette
- Combobox / location search
- Context menu on property cards
- Data table (until HeroUI replacement exists)

## Tracking
- **Metrics to watch:** % of files importing @heroui/react vs components/ui/*, bundle size, lighthouse perf
- **Reporting cadence:** Weekly status in PR descriptions; update this doc monthly
- **Decision gate:** If HeroUI coverage <50% by end of Phase B, escalate scope/owners
