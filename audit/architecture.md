# Architecture Summary — WedPlanAI

## Application Type
Self-hosted, open-source wedding planning web application with a full UI dashboard and REST API v1.

## Users
- **Wedding Planners** (admin role) — full access, manage multiple weddings
- **DIY Couples** — manage their own wedding
- **Team members** (user role) — wedding-scoped access
- **Clients** (client role) — guests + showcase only
- **Guests** — public showcase, RSVP via ?code= param
- **External apps** — REST API via x-api-key

## Tech Stack
- Next.js 16.2.9 (App Router, Server Components, Server Actions)
- React 19.2.4, Tailwind CSS v4, shadcn/ui
- PostgreSQL 17 + pgvector, Drizzle ORM 0.45.2
- Better Auth 1.6.18 (email/password only, no OAuth)
- Zod validation, date-fns
- Docker Compose (port 3044), Coolify deployment
- Node 22-bookworm-slim (runs as root in container)

## Trust Model
- **Anonymous**: landing page, login, signup, public showcase
- **Session-authenticated** (cookie): dashboard routes, server actions
- **API key-authenticated** (x-api-key header, SHA-256 hashed): REST API v1
- **Guest code** (?code=XXX, 6-char alphanumeric): filtered showcase view

## Access Control
- role-based (admin/user/client) enforced in dashboard layout, server actions, sidebar
- API keys scoped per-wedding (except traditions & categories — global tables)
- Registration locks after first user; subsequent users created by admin only

## Input Surfaces
- 19 REST API v1 route files (CRUD on 10 resource groups)
- 11 server action files (auth, wedding, guests, tasks, vendors, catering, calendar, api-keys, profile, onboarding, users)
- Public pages: /wedding/:id (showcase), / (landing), /login, /signup
- CSV upload for guest import (client-side + server-side)
- Base64 image data (logo, hero) stored in DB

## Dangerous Sinks
- SQL: Drizzle ORM (parameterized) — no raw SQL except TRUNCATE in reset.ts
- HTML: `dangerouslySetInnerHTML` in DynamicTheme.tsx (CSS injection via color values), layout.tsx (static script), page.tsx (static JSON-LD)
- URLs: showcaseGiftUrl rendered as `<a href>`, showcaseHeroUrl as `<img src>`
- JSON parse: tradition seedTasks/seedCeremonies parsed from DB
- No eval, no shell exec, no dynamic imports with user input

## Baseline Comparable
SaaS wedding planners (The Knot, Zankyou, Joy, Aisle Planner), Trello/Asana for task boards. Key difference: self-hosted, multi-tradition, open-source.

## Key File Paths
- Auth config: src/lib/auth.ts, src/lib/auth-server.ts, src/lib/auth-client.ts
- API auth: src/app/api/v1/auth-helper.ts
- DB schema: src/db/schema.ts (14 tables)
- Core actions: src/app/actions/wedding.ts, src/app/actions/guests.ts, src/app/actions/kanban.ts
- API routes: src/app/api/v1/ (10 resource groups)
- Public showcase: src/app/wedding/[id]/page.tsx
- CSS injection: src/components/theme/DynamicTheme.tsx (line 61-87)
- Dashboard layout (auth gate): src/app/dashboard/layout.tsx
- Sidebar access control: src/components/dashboard/SidebarShell.tsx
- Startup: src/instrumentation.ts
