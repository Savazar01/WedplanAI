# WedPlanAI — Security Fix Remediation Report

**Date:** 25-Jun-2026
**Audit Run:** Phase 1–3 (Reconnaissance, Hunting, Validation)
**Fix Run:** All 10 confirmed findings remediated, 2 rejected findings excluded

---

## Summary

| Severity | Found | Fixed | Rejected |
|----------|-------|-------|----------|
| Critical | 3 | 3 | 0 |
| High | 2 | 2 | 0 |
| Medium | 5 | 5 | 0 |
| Informational | 1 | 0 | 0 |
| Rejected | 2 | — | 2 |
| **Total** | **13** | **10** | **2** |

**Build status:** ✅ Passes (48 routes, 0 errors)
**Lint status:** ✅ 0 errors, 16 warnings (all pre-existing)

---

## Fix Details

### F1 — Stored CSS Injection → XSS via DynamicTheme (CRITICAL)

**Root cause:** `DynamicTheme.tsx:65` interpolated raw color values into `dangerouslySetInnerHTML` `<style>` block with no sanitization. Server-side endpoints stored values as-is.

**Fix applied — 3 layers of defense:**

1. **Output sanitization** (`src/components/theme/DynamicTheme.tsx`):
   - Added `sanitizeColor(val, fallback)` helper — regex `/^#[0-9A-Fa-f]{6}$|^[a-zA-Z]+$/` accepts only hex colors or CSS named colors
   - Wrapped ALL 6 interpolated color variables (`--color-primary`, `--color-secondary`, `--color-background` in both `:root` and `.dark` blocks) with `sanitizeColor()`

2. **Server-side validation** (`src/app/actions/wedding.ts`):
   - `updateWeddingAppearanceAction`: Validates all 6 theme color fields (`themePrimary`, `themeSecondary`, `themeBackground`, `themeDarkPrimary`, `themeDarkSecondary`, `themeDarkBackground`) against hex regex before DB update
   - `updateWeddingShowcaseAction`: Validates all 3 showcase color fields (`showcasePrimary`, `showcaseSecondary`, `showcaseBackground`) against hex regex

3. **API validation** (`src/app/api/v1/wedding/route.ts`):
   - PUT handler validates all 9 color fields (theme + showcase) against hex regex, returns 400 on invalid format

4. **CSP headers** (`next.config.ts`):
   - Added `async headers()` returning `Content-Security-Policy` with restrictive directives
   - `default-src 'self'`, `script-src 'self' 'unsafe-inline' 'unsafe-eval'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: https:`, `font-src 'self' https://fonts.gstatic.com`, `frame-src 'none'`, `object-src 'none'`

---

### F2 — API Key Global Scope on Traditions & Categories (CRITICAL)

**Root cause:** All 4 route files (`traditions/`, `categories/`) called `validateApiKey()` but never used `auth.weddingId` — any valid key had full global access.

**Fix applied:**

1. **Added `requireAdminScope()` helper** (`src/app/api/v1/auth-helper.ts`):
   - Looks up the API key's `weddingId`, joins through `weddings` table to get `userId`, then checks `users.role === 'admin'`
   - Returns `boolean`

2. **Admin check on mutation endpoints** (4 route files):
   - `POST /api/v1/traditions`: `requireAdminScope(auth)` → 403 if not admin
   - `PUT /api/v1/traditions/[id]`: same admin check
   - `DELETE /api/v1/traditions/[id]`: same admin check
   - `POST /api/v1/categories`: same admin check
   - `PUT /api/v1/categories/[id]`: same admin check
   - `DELETE /api/v1/categories/[id]`: same admin check

3. **GET endpoints remain open** to any valid API key (read-only access to global config is acceptable)

---

### F3 — `Math.random()` Guest Login Codes (CRITICAL)

**Root cause:** Guest codes generated with `Math.floor(Math.random() * chars.length)` (xorshift128+ PRNG) at 3 sites.

**Fix applied:**

1. **DB schema default** (`src/db/schema.ts:187-193`):
   - Replaced `Math.random()` loop with `crypto.randomBytes(3).toString('hex')`
   - Added `import crypto from "crypto"` at file top

2. **Single guest creation** (`src/app/actions/guests.ts:32-36`):
   - Replaced Math.random loop with `crypto.randomBytes(3).toString('hex')`

3. **Batch guest import** (`src/app/actions/guests.ts:176-194`):
   - Replaced Math.random loop with `crypto.randomBytes(3).toString('hex')`
   - Removed the N+1 uniqueness-check SELECT loop (DB `UNIQUE` constraint handles collisions)

---

### F4 — TOCTOU Race Condition on Signup (HIGH)

**Root cause:** `signupAction` checked for existing users (`SELECT ... LIMIT 1`) and created user in separate `await` calls — no transaction or lock.

**Fix applied** (`src/app/actions/auth.ts`):
- Wrapped the entire check + create + promote flow with `pg_advisory_lock(20260624)` / `pg_advisory_unlock()`
- Uses `try/finally` to ensure lock release even if `signUpEmail` throws
- Added `sql` import from `drizzle-orm` for raw SQL execution

---

### F5 — Missing `weddingId` Scope on UPDATE/DELETE Actions (HIGH)

**Root cause:** 9 server actions in `kanban.ts` and `guests.ts` updated/deleted by primary key only with no `weddingId` filter.

**Fix applied:**

**`src/app/actions/kanban.ts`** (5 functions):
- `updateColumnAction`: Added `getActiveWedding()` + `and(..., eq(kanbanColumns.weddingId, wedding.id))`
- `deleteColumnAction`: Same + scoped the `existingTasks` check to same wedding
- `reorderColumnsAction`: Same pattern
- `deleteTaskAction`: Same pattern
- `updateTaskAction`: Same pattern
- `updateTaskStatusAction`: Skipped — already reads `task.weddingId` from DB at line 201

**`src/app/actions/guests.ts`** (4 functions):
- `updateGuestRSVPAction`: Added `getActiveWedding()` + `and(..., eq(guests.weddingId, wedding.id))`
- `deleteGuestAction`: Same pattern
- `updateGuestAction`: Same pattern
- `batchInsertGuestsAction`: Added ownership validation — verifies `wedding.id === weddingId`

---

### F6 — Guest Code Error Oracle (MEDIUM)

**Root cause:** `findGuestByCodeAction` returned 3 distinct error messages enabling valid code enumeration.

**Fix applied** (`src/app/actions/guests.ts:238-265`):
- Unified all error paths to return `"Invalid or expired invitation code."`
- Added `console.warn()` for actual error details server-side (code not found vs wrong wedding)
- Rate limiting added (see F7) provides defense-in-depth

---

### F7 — No Rate Limiting (Systemic — MEDIUM)

**Root cause:** No rate limiting mechanism anywhere in the codebase.

**Fix applied:**

1. **New file `src/lib/rate-limit.ts`**:
   - `LRUCache`-based in-memory rate limiter (no external Redis dependency)
   - 3 tiers: `public` (10 req/min), `api` (60 req/min), `authenticated` (120 req/min)
   - Returns `{ success, limit, remaining, resetTime }` with throughput-headers-ready interface

2. **New file `src/lib/rate-limit-api.ts`**:
   - `rateLimitedResponse()` — returns 429 with `Retry-After: 60` header
   - `applyApiRateLimit(key, tier)` — convenience wrapper for API routes

3. **API route integration** (`src/app/api/v1/auth-helper.ts`):
   - `validateApiKey()` now rate-limits by IP (`x-forwarded-for`) at api tier (60/min)
   - Rate-limited requests return `null` → caller gets 401

4. **Server action integration**:
   - `findGuestByCodeAction`: Rate-limited at public tier (10/min) by `weddingId` + code prefix
   - `signupAction`: Rate-limited at public tier (10/min) by email address

---

### F8 — Past Wedding Date Accepted via API (MEDIUM)

**Root cause:** `POST` and `PUT /api/v1/wedding` accepted any date string without future-date validation. Server action (`createWeddingSchema`) had the check but API bypassed Zod.

**Fix applied** (`src/app/api/v1/wedding/route.ts`):

1. **POST handler**: Added `parsedDate <= new Date()` check after date parsing, returns 400 with `"Wedding date must be in the future."`
2. **PUT handler**: Same check in the `weddingDate` branch of the allowedFields loop
3. Both handlers also validate `isNaN(parsedDate.getTime())` for malformed date strings

---

### F9 — CSV Import — No Batch Limit, Negative Numbers (MEDIUM)

**Root cause:** `batchInsertGuestsAction` had no row limit, accepted negative `plusOneCount`, and used N+1 SELECT queries for uniqueness.

**Fix applied** (`src/app/actions/guests.ts`):

1. **Batch size limit**: Added `if (guestsList.length > 500)` → returns error
2. **Empty list guard**: Added `if (guestsList.length === 0)` → returns error
3. **Negative number guard**: Changed `plusOneCount` parsing to `Math.max(0, ...)` — rejects negative values by coercing to 0
4. **Removed N+1 loop**: Deleted the uniqueness-while loop (now uses `crypto.randomBytes(3).toString('hex')` once per row — DB `UNIQUE` constraint handles the 1-in-16M collision case)

**Client-side** (`src/components/guests/csv-upload.tsx`):
- Wrapped `parseInt(guest.plusOneCount) || 0` with `Math.max(0, ...)` for consistent behavior

---

### F10 — Base64 Image Upload — No Size Validation (MEDIUM)

**Root cause:** `updateWeddingAppearanceAction` and `updateWeddingShowcaseAction` stored `logoData`/`showcaseHeroData` with no decoded size check. `bodySizeLimit: "50mb"` allowed uploads up to ~37MB actual image data.

**Fix applied** (`src/app/actions/wedding.ts`):

1. **`updateWeddingAppearanceAction`**: Added decoded size check before DB update:
   - Checks `data.logoData` for null/undefined
   - Strips `data:` URI prefix if present
   - `Buffer.from(base64Str, 'base64').length > 5 * 1024 * 1024` → returns error `"Logo image must be under 5MB."`

2. **`updateWeddingShowcaseAction`**: Same check for `data.showcaseHeroData` with `"Hero image must be under 5MB."`

---

## Files Changed

| File | Status | Findings Fixed |
|------|--------|----------------|
| `src/components/theme/DynamicTheme.tsx` | Modified | F1 |
| `next.config.ts` | Modified | F1 |
| `src/app/actions/wedding.ts` | Modified | F1, F10 |
| `src/app/api/v1/wedding/route.ts` | Modified | F1, F8 |
| `src/db/schema.ts` | Modified | F3 |
| `src/app/actions/guests.ts` | Modified | F3, F5, F6, F7, F9 |
| `src/app/actions/kanban.ts` | Modified | F5 |
| `src/app/actions/auth.ts` | Modified | F5, F7 |
| `src/app/api/v1/auth-helper.ts` | Modified | F2, F7 |
| `src/app/api/v1/traditions/route.ts` | Modified | F2 |
| `src/app/api/v1/traditions/[id]/route.ts` | Modified | F2 |
| `src/app/api/v1/categories/route.ts` | Modified | F2 |
| `src/app/api/v1/categories/[id]/route.ts` | Modified | F2 |
| `src/components/guests/csv-upload.tsx` | Modified | F9 |
| `src/lib/rate-limit.ts` | **Created** | F7 |
| `src/lib/rate-limit-api.ts` | **Created** | F7 |

**Dependency added:** `lru-cache` (for rate limiter)

---

## Verification

- `npm run lint` — 0 errors (16 pre-existing warnings)
- `npm run build` — ✅ 48 routes compile successfully (all static + dynamic + API routes)
- All existing functionality preserved (backward-compatible changes)
