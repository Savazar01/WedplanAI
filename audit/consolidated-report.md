# WedPlanAI — Security Audit Consolidated Report

**Date:** 24-Jun-2026
**Scope:** Full application (Phase 1 Recon + Phase 2 Hunting across 8 attack classes + Phase 3 Validation)
**Methodology:** Cloudflare Security Audit Skill (automated multi-agent adversarial analysis)
**Repository:** [WedPlanAI](https://github.com/savazar/wedplanai) (self-hosted wedding planning platform)

---

## Executive Summary

The security audit identified **8 confirmed vulnerabilities** across the WedPlanAI codebase — 3 Critical, 2 High, and 3 Medium severity. Two additional findings were rejected as by-design or false alarms. The most severe issues involve **stored XSS via CSS injection** (affects all dashboard + showcase visitors), **cryptographically insecure guest authentication codes**, and **global configuration access via any API key**.

---

## Vulnerability Inventory

### 🔴 Critical (3)

| # | Title | Likelihood | Impact | Overall |
|---|-------|-----------|--------|---------|
| 1 | Stored CSS Injection → XSS via DynamicTheme | High | Critical | **Critical** |
| 2 | API Key Global Scope on Traditions & Categories | High | High | **Critical** |
| 3 | `Math.random()` Guest Login Codes | Medium | Critical | **Critical** |

### 🟠 High (2)

| # | Title | Likelihood | Impact | Overall |
|---|-------|-----------|--------|---------|
| 4 | TOCTOU Race Condition on Signup | Low | High | **High** |
| 5 | Missing `weddingId` Scope on UPDATE/DELETE Actions | Low | High | **High** |

### 🟡 Medium (3)

| # | Title | Likelihood | Impact | Overall |
|---|-------|-----------|--------|---------|
| 6 | Guest Code Error Oracle (Enumeration) | Medium | Medium | **Medium** |
| 7 | No Rate Limiting (Systemic) | Medium | Medium | **Medium** |
| 8 | Past Wedding Date Accepted via API | Low | Low | **Medium** |
| 9 | CSV Import — No Batch Limit, Negative Numbers | Low | Low | **Medium** |
| 10 | Base64 Image Upload — No Size Validation | Low | Low | **Medium** |

### ⚪ Informational (1)

| # | Title | Likelihood | Impact | Overall |
|---|-------|-----------|--------|---------|
| 11 | Hardcoded Default Credentials in Docker Compose / DB Client | Informational | Low | **Informational** |

### ✘ Rejected (2)

| # | Title | Reason |
|---|-------|--------|
| — | Unauthenticated RSVP Actions | By design — guest code IS the auth mechanism for public RSVP flow |
| — | Hardcoded Secrets in Git History | Only defaults/placeholders found; `.env` is gitignored |

---

## Finding Details

---

### FINDING 1: Stored CSS Injection → XSS via DynamicTheme (CRITICAL)

**Root Cause:** `DynamicTheme` in `src/components/theme/DynamicTheme.tsx:65` interpolates raw theme color values into a `dangerouslySetInnerHTML` `<style>` block with no sanitization, while server-side endpoints accept them as-is.

**Attack:** Any authenticated user (admin via `updateWeddingAppearanceAction` or API key via `PUT /api/v1/wedding`) sends:
```json
{ "themePrimary": "</style><script>alert(document.cookie)</script><style>" }
```
Every visitor to any dashboard or showcase page that renders `DynamicTheme` will execute the injected JavaScript.

**Code Trace:**
1. **Entrypoint** `updateWeddingAppearanceAction` / `wedding.ts:458` — stores `data.themePrimary` directly into DB
2. **Propagation** `PUT /api/v1/wedding` / `wedding/route.ts:88` — `updates[field] = body[field]` for all allowed fields
3. **Sink** `DynamicTheme.tsx:65` — ``:root { --color-primary: ${primary}`` in `dangerouslySetInnerHTML`

**Remediation:** Sanitize color fields server-side (e.g., regex `^#[0-9A-Fa-f]{6}$`). Add CSP headers in `next.config.ts`. Encode/cast output in DynamicTheme.

---

### FINDING 2: API Key Global Scope on Traditions & Categories (CRITICAL)

**Root Cause:** Four route files (`traditions/*`, `categories/*`) call `validateApiKey(request)` but never use `auth.weddingId` for scope — any valid API key has full read/write/delete access to all global configuration.

**Attack:** A disgruntled employee's API key (scoped to a single wedding) can `DELETE /api/v1/traditions/{id}` or `POST /api/v1/categories` to corrupt global config for all weddings.

**Code Trace:**
1. **Entrypoint** `GET|POST /api/v1/traditions` / `traditions/route.ts:20` — only checks `if (!auth)`
2. **Propagation** `PUT|DELETE /api/v1/traditions/[id]` / `traditions/[id]/route.ts:15` — same pattern
3. **Sink** All 4 routes — no `WHERE weddingId = auth.weddingId`, tables have no `weddingId` column

**Remediation:** Add an authorization layer: require admin role or a separate "global config" permission. Or add a `createdBy` column and scope reads/writes.

---

### FINDING 3: `Math.random()` Guest Login Codes (CRITICAL)

**Root Cause:** Guest login codes (6-char alphanumeric, `36^6 ≈ 2.2B` combinations) are generated with `Math.floor(Math.random() * chars.length)` — xorshift128+ PRNG, not cryptographically secure.

**Impact:** An attacker who observes a few generated codes can recover the PRNG state and predict all future guest codes. Combined with NO rate limiting (Finding 7), brute-force enumeration is feasible. A valid guest code grants access to RSVP data but not full account access.

**Code Locations:**
- `src/db/schema.ts:188-193` — `$defaultFn` for DB column
- `src/app/actions/guests.ts:34-36` — single guest creation
- `src/app/actions/guests.ts:184-186` — bulk guest creation

**Remediation:** Replace with `crypto.randomBytes(3).toString('hex')` (6 hex chars = 16.7M combos) or `crypto.randomInt(36)` per character. Add rate limiting to `findGuestByCodeAction`.

---

### FINDING 4: TOCTOU Race Condition on Signup (HIGH)

**Root Cause:** `signupAction` in `src/app/actions/auth.ts:20-40` checks for existing users (`SELECT ... LIMIT 1`) and then inserts a new user in separate `await` calls — no transaction, no advisory lock.

**Attack:** Two simultaneous signup requests can both see `0 existing users` and both create admin accounts (with different emails).

**Remediation:** Wrap the check+insert in a Drizzle transaction or use `SELECT ... FOR UPDATE` / `pg_try_advisory_lock()`.

---

### FINDING 5: Missing `weddingId` Scope on UPDATE/DELETE Actions (HIGH)

**Root Cause:** Several server actions (`updateColumnAction`, `deleteColumnAction`, `reorderColumnsAction`, `updateTaskStatusAction`, `deleteTaskAction`, `updateTaskAction`, `updateGuestRSVPAction`, `deleteGuestAction`, `updateGuestAction`, `batchInsertGuestsAction`) target resources by ID only, without adding `WHERE weddingId = authenticatedWeddingId`.

**Attack:** Authenticated user from Wedding A calls `deleteGuestAction("guestId-from-wedding-B")` — the guest is deleted from Wedding B's data because the WHERE clause is `WHERE id = 'guestId-from-wedding-B'` only.

**Contrast:** `createGuestAction`, `createColumnAction`, `createTaskAction` all call `getActiveWedding(session.user.id)` correctly. The UPDATE/DELETE actions skip this check.

**Remediation:** Every UPDATE/DELETE action must join/filter by `weddingId` from `getActiveWedding()`.

---

### FINDING 6: Guest Code Error Oracle (MEDIUM)

**Root Cause:** `findGuestByCodeAction` in `src/app/actions/guests.ts:248-264` returns three distinct error messages depending on whether the code is invalid, belongs to a different wedding, or a server error occurs.

| Condition | Message |
|-----------|---------|
| Code not found | `"Invalid login code. Please check your invitation."` |
| Code exists, wrong wedding | `"This code is for a different wedding."` |
| Server error | `"Failed to verify login code."` |

**Attack:** An attacker sends guess-code `XXXXXX` with wedding `A` → "Invalid" → doesn't exist. Same code with wedding `B` → "different wedding" → code IS valid for some other wedding. Combined with no rate limiting (Finding 7), this enables valid code enumeration.

**Remediation:** Return a uniform message for all error conditions. Add rate limiting.

---

### FINDING 7: No Rate Limiting (Systemic — MEDIUM)

**Root Cause:** No rate limiting exists anywhere — no middleware, no library dependency, no helper function. Confirmed by searching `rateLimit`, `ratelimit`, `throttle`, `429`, `X-RateLimit`, `@upstash/ratelimit`.

**Impact:** Every public endpoint (guest code lookup, API routes, login, signup) and authenticated endpoint is unprotected against brute-force, DoS, and abuse. Worsens findings 3 (guest code) and 6 (oracle).

**Remediation:** Add `@upstash/ratelimit` or similar. Apply to: `POST /api/v1/auth/*`, `findGuestByCodeAction`, `POST /api/v1/*` routes.

---

### FINDING 8: Past Wedding Date Accepted via API (MEDIUM)

**Root Cause:** `POST /api/v1/wedding` (line 146) only checks `if (!weddingDate)` — no future-date validation. `PUT /api/v1/wedding` (line 85-86) has no date check at all. The server action (`wedding.ts:16-18`) HAS a `z.string().refine(...)` future-date check, but the API bypasses Zod entirely.

**Remediation:** Add Zod schema validation to API routes, matching server action validation.

---

### FINDING 9: CSV Import — No Batch Limit, Negative Numbers (MEDIUM)

**Root Cause:** `batchInsertGuestsAction` in `guests.ts:176-224` processes unlimited rows with no cap, performing N individual SELECT queries for login-code uniqueness (N+1 pattern). `plusOneCount` accepts negative values via `parseInt("-5") || 0` → `-5`.

**Remediation:** Add `Math.max(0, ...)` or `z.number().min(0)` guard. Implement batch size limit (e.g., 500 rows max). Use DB-level uniqueness for login codes instead of N SELECTs.

---

### FINDING 10: Base64 Image Upload — No Size Validation (MEDIUM)

**Root Cause:** `next.config.ts:8` sets `bodySizeLimit: "50mb"`. `updateWeddingAppearanceAction` and `updateWeddingShowcaseAction` store `logoData` and `showcaseHeroData` as-is with no size or dimension validation.

**Remediation:** Validate base64 decoded size server-side (e.g., max 5MB). Consider storing images in object storage (S3/R2) instead of DB.

---

### FINDING 11: Hardcoded Default Credentials (Informational)

**Details:**
- `docker-compose.yml:12` uses `${POSTGRES_PASSWORD:-postgres}` — standard safe default
- `src/db/client.ts:6` has `"postgresql://postgres:postgres@localhost:5611/wedding_planner"` fallback — only reached if `DATABASE_URL` is unset
- `docker-compose.yml:30` has hardcoded `postgresql://postgres:postgres@db:5432/wedding_planner` — internal Docker network only

**Risk:** Low. These are local-dev defaults. `.env` is gitignored. Coolify deploys set `DATABASE_URL` via env panel.

**Remediation:** Consider always requiring `DATABASE_URL` (remove fallback) for production deployments.

---

## Attack Surface Summary

| Surface | Count | Notes |
|---------|-------|-------|
| REST API routes | 22 files | 10 resource groups (wedding, ceremonies, tasks, guests, vendors, catering-menus, guest-rsvps, traditions, categories, api-keys) |
| Server action files | 11 | Auth, wedding, guests, tasks, vendors, catering, calendar, api-keys, profile, onboarding, users |
| Public pages | 5 | Landing, login, signup, showcase, guest RSVP |
| Auth mechanisms | 3 | Session cookie (dashboard), API key (REST), Guest code (RSVP) |
| Dangerous sinks | 4 | `dangerouslySetInnerHTML` (DynamicTheme), `<a href>` (showcaseGiftUrl), `<img src>` (showcaseHeroUrl), `JSON.parse` (tradition seeds) |

---

## Recommended Fix Order

1. **F1 — DynamicTheme XSS**: Sanitize color fields server-side + add CSP headers (Critical, affects all users)
2. **F3 — Guest codes**: Switch to `crypto.randomBytes` (Critical, authentication bypass)
3. **F2 — API key scope**: Add authorization to traditions/categories (Critical, global data corruption)
4. **F5 — weddingId scope**: Fix all UPDATE/DELETE actions (High, cross-wedding data access)
5. **F4 — TOCTOU signup**: Add transaction around check+insert (High, multi-admin creation)
6. **F7 — Rate limiting**: Add systemic rate limiting (Medium, multiplies other risks)
7. **F6 — Error oracle**: Unify guest code error messages (Medium, enumeration)
8. **F8 — Past date**: Add Zod validation to API routes (Medium, data integrity)
9. **F9 — CSV limits**: Add batch limit + negative number guard (Medium, abuse)
10. **F10 — Base64 size**: Add image size validation (Medium, resource abuse)

---

## Appendix: Methodology

- **Phase 1 — Reconnaissance**: Architecture document generated via multi-agent analysis of the full codebase
- **Phase 2 — Hunting**: 7 parallel agents across 8 attack classes (Injection, Access Control, Cryptography, Business Logic, Feature Abuse, Obvious Things, Wildcard)
- **Phase 3 — Validation**: 10 adversarial validation agents, each tasked with disproving a specific finding by reading actual source code
- **All findings confirmed against actual source code** — no theoretical or scanner-based findings
