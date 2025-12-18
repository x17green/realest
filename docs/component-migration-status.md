# Component Library Migration Status (Hybrid Approach)

## Current vs Target (Dec 2025)
- **Current adoption:** ~20% HeroUI • ~5% UntitledUI • ~75% Shadcn (components/ui/* dominates)
- **Target (70-25-5):** 70% HeroUI • 25% UntitledUI • 5% Shadcn (complex patterns only)
- **Theme system:** HeroUI CSS variables already mapped in components/providers/realest-theme-provider.tsx
- **Risk:** Dual libraries increase bundle size and maintenance overhead

## Priorities (next 6-8 weeks)
1) Increase HeroUI adoption toward 70%: migrate high-traffic pages (auth, search, dashboards) to HeroUI wrappers; replace Shadcn where possible
2) Grow HeroUI wrappers: **DONE** for inputs, text areas, selects, dialogs; add table strategy (current table is hybrid using Card + native table)
3) Expand UntitledUI: infrastructure/status indicators are **DONE**; integrate into property cards and search filters for Nigerian market
4) Constrain Shadcn: keep command/combobox/context-menu/data-table; avoid new Shadcn usage elsewhere
5) Add lint/PR checks: **DONE** (warns on non-allowlist Shadcn imports)

## Phased Migration Plan
- **Phase A (Weeks 1-2): Documentation + Guardrails**
  - Update docs (**done**) to reflect current vs target
  - Add ESLint rule or lint script to warn on new Shadcn imports outside allowlist **(done)**
  - Create HeroUI wrapper stubs for Input, Select, TextArea, Dialog, Table **(inputs/selects/dialogs done; table hybrid exists)**
- **Phase B (Weeks 3-6): Adoption in new work**
  - Require HeroUI for all new forms/buttons/cards/navigation
  - Introduce UntitledUI status/infrastructure components into dashboards **(components done; integration in progress)**
  - Begin refactoring high-traffic pages (auth/public/search/dashboards) to HeroUI wrappers
- **Phase C (Weeks 7-12): Refactor existing surfaces**
  - Swap Shadcn primitives in admin/owner dashboards to HeroUI equivalents
  - Limit Shadcn to command palette, combobox, context menu, data table only
  - Track bundle size deltas and runtime perf

## Completed

- Domain component reorganization: **complete** (owner, property, marketing, layout, shared)
- Legacy theme-provider removed; active provider: `components/providers/realest-theme-provider.tsx`
- Infrastructure indicators implemented (power, water, security, internet, BQ)

## Allowlist (Shadcn kept)
- Command palette
- Combobox / location search
- Context menu on property cards
- Data table (until HeroUI replacement exists)

## Tracking
- **Metrics to watch:** % of files importing @heroui/react vs components/ui/*, bundle size, lighthouse perf
- **Reporting cadence:** Weekly status in PR descriptions; update this doc monthly
- **Decision gate:** If HeroUI coverage <50% by end of Phase B, escalate scope/owners
