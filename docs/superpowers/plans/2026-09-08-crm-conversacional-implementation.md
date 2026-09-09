# CRM Conversacional v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete multi-tenant CRM Conversacional v1.0 described in the design spec.

**Architecture:** Supabase Auth provides identity, PostgreSQL/RLS provides tenant isolation, and Next.js Server Actions/Route Handlers provide the protected application boundary. The UI uses shadcn/ui, Tailwind and dnd-kit with typed domain modules.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, shadcn/ui, dnd-kit, Supabase Auth/Postgres/Realtime, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-08-crm-conversacional-design.md`

## Global Constraints

- No open registration; only Admin Master/Owner can create users.
- Every tenant-owned row contains `workspace_id` and is protected by RLS.
- Leads preserve the 13 fixed PRD fields; Kanban metadata is additive.
- Audit log is append-only.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Evolution API and OpenAI are excluded from v1.

### Task 1: Database foundation

**Files:**
- Modify: `supabase/migrations/20260908120000_initial_schema.sql`
- Create: `supabase/migrations/20260908121000_crm_support_tables.sql`

Add `pipeline_columns`, `dashboard_permissions`, and `lead_assignments`, seed default columns per workspace through a bootstrap function, add foreign keys/indexes, and update RLS policies. Verify by applying both migrations in Supabase SQL Editor and querying `pg_tables` and `pg_policies`.

### Task 2: Supabase clients and domain types

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/domain/types.ts`
- Create: `src/lib/domain/constants.ts`
- Create: `src/lib/domain/validation.ts`
- Modify: `.env.example`

Add typed clients, role/status constants, the 13-field lead schema, webhook schema and filter schema. Add Vitest tests that reject missing name/phone and invalid enum/email values before implementation, then make them pass.

### Task 3: Authentication and access control

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/settings/users/page.tsx`
- Create: `src/app/(dashboard)/settings/password/page.tsx`
- Create: `src/app/api/auth/users/route.ts`
- Create: `src/app/api/auth/password/route.ts`

Implement login/logout/session refresh, protected dashboard layout, user creation/reset for Admin Master/Owner, and current-password verification for ordinary users. Enforce role checks on server routes and add friendly loading/error states.

### Task 4: Lead CRUD and audit service

**Files:**
- Create: `src/lib/services/leads.ts`
- Create: `src/lib/services/audit.ts`
- Create: `src/app/api/leads/route.ts`
- Create: `src/app/api/leads/[id]/route.ts`
- Create: `src/components/leads/lead-form.tsx`
- Create: `src/components/leads/lead-drawer.tsx`
- Create: `src/components/leads/lead-fields.tsx`

Implement create/read/update/delete with server-side validation, tenant scoping, audit entries for all changed fields, and accessible form controls for all 13 fixed fields.

### Task 5: Kanban and Lista dashboards

**Files:**
- Create: `src/app/(dashboard)/leads/page.tsx`
- Create: `src/components/kanban/kanban-board.tsx`
- Create: `src/components/kanban/kanban-column.tsx`
- Create: `src/components/kanban/lead-card.tsx`
- Create: `src/components/leads/lead-table.tsx`
- Create: `src/components/leads/lead-filters.tsx`

Implement view toggle, search, filters, responsive cards/table, dnd-kit drag-and-drop between custom columns, optimistic updates with rollback, and audit logging for moves.

### Task 6: Webhook n8n

**Files:**
- Create: `src/app/api/webhook/route.ts`
- Create: `src/lib/webhook/normalize.ts`
- Create: `src/lib/webhook/normalize.test.ts`

Validate secret, resolve workspace, normalize the 13-field payload, place the lead in the first ordered column, and return stable JSON responses with 401/400/201/500 behavior.

### Task 7: Dashboard configuration

**Files:**
- Create: `src/app/(dashboard)/settings/pipeline/page.tsx`
- Create: `src/app/(dashboard)/settings/dropdowns/page.tsx`
- Create: `src/app/(dashboard)/settings/permissions/page.tsx`
- Create: `src/lib/services/settings.ts`

Allow Owner to manage column names/order/colors, custom dropdown values/colors and dashboard visibility per User. Protect all mutations by role.

### Task 8: Financial dashboard

**Files:**
- Create: `src/app/(dashboard)/finance/page.tsx`
- Create: `src/lib/services/finance.ts`
- Create: `src/components/finance/metric-card.tsx`
- Create: `src/components/finance/finance-filters.tsx`
- Create: `src/components/finance/finance-breakdown.tsx`

Implement global filters for period/source/temperature/priority/Owner/User and metrics: total revenue, expected revenue, debt total and average ticket, with breakdowns by source, temperature and priority.

### Task 9: Realtime, navigation and polish

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/topbar.tsx`
- Create: `src/components/shared/empty-state.tsx`
- Create: `src/components/shared/toast-provider.tsx`

Add Supabase Realtime refresh for leads, navigation by allowed dashboards, responsive layout, empty/error states and Portuguese copy.

### Task 10: Deployment and verification

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`
- Modify: `README.md`

Document local setup, Supabase migrations, environment variables, webhook contract, Docker/Coolify deployment and Admin Master bootstrap. Run `npm run lint`, `npx tsc --noEmit`, `npm test` and `npm run build`.
