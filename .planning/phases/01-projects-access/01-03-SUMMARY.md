---
phase: 01-projects-access
plan: 03
subsystem: auth
tags: [prisma, next-auth, github-oauth]

# Dependency graph
requires:
  - phase: 01-01
    provides: Auth method decision for MVP
  - phase: 01-02
    provides: Next.js app scaffold and linting
provides:
  - Prisma schema with project, track, membership, and invite models
  - Auth.js configuration using GitHub OAuth with database sessions
  - Prisma client singleton and session helper for server routes
affects: [api, access-control, ui-auth]

# Tech tracking
tech-stack:
  added: [prisma, @prisma/client, next-auth, @auth/prisma-adapter]
  patterns: [Prisma client singleton, Auth.js with PrismaAdapter database sessions]

key-files:
  created: [prisma/schema.prisma, src/db/prisma.ts, src/auth.ts, src/app/api/auth/[...nextauth]/route.ts, src/lib/auth.ts, .planning/phases/01-projects-access/01-USER-SETUP.md]
  modified: [.planning/PROJECT.md, .env.example, package.json, package-lock.json]

key-decisions:
  - "Confirmed GitHub OAuth via Auth.js for MVP auth"

patterns-established:
  - "Prisma schema enums for track status and membership roles"
  - "Auth.js handler export pattern in App Router"

# Metrics
duration: 3 min
completed: 2026-02-06
---

# Phase 1 Plan 03: Prisma + Auth.js Summary

**Prisma schema for projects/tracks/invites plus Auth.js GitHub OAuth with database sessions and a server-side session guard.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-06T00:55:04Z
- **Completed:** 2026-02-06T00:58:44Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Captured the auth method decision in project documentation
- Defined Prisma models and enums for access control and track status defaults
- Wired Auth.js handlers and a session helper for server-side checks

## Task Commits

Each task was committed atomically:

1. **Task 1: Record the chosen auth method in PROJECT.md** - `81bbf2d` (docs)
2. **Task 2: Define Prisma schema for auth + projects + tracks + invites** - `38ef0e9` (feat)
3. **Task 3: Configure Auth.js for the selected login method** - `ac878d9` (feat)

## Files Created/Modified
- `.planning/PROJECT.md` - Recorded the MVP auth method decision
- `prisma/schema.prisma` - Auth.js adapter models plus project/track/invite schema
- `src/db/prisma.ts` - Prisma client singleton
- `.env.example` - Database and Auth.js environment variables
- `package.json` - Added Prisma and Auth.js dependencies
- `package-lock.json` - Locked dependency updates
- `src/auth.ts` - Auth.js configuration with GitHub provider
- `src/app/api/auth/[...nextauth]/route.ts` - Auth route handlers
- `src/lib/auth.ts` - `requireSession()` helper for server routes
- `.planning/phases/01-projects-access/01-USER-SETUP.md` - Manual setup checklist for Resend and GitHub OAuth

## Decisions Made
- Confirmed GitHub OAuth via Auth.js for MVP authentication (fastest setup, avoids email deliverability risk)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pinned Prisma to v6 for schema validation**
- **Found during:** Task 2 (Define Prisma schema for auth + projects + tracks + invites)
- **Issue:** Prisma v7 rejected `datasource.url` in schema, blocking `prisma validate`.
- **Fix:** Installed Prisma v6 to keep standard schema configuration.
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx prisma validate` succeeds
- **Committed in:** 38ef0e9

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required to validate schema; no scope change.

## Issues Encountered
- Prisma v7 schema validation error required pinning to v6 to proceed.

## User Setup Required

**External services require manual configuration.** See `./01-USER-SETUP.md` for:
- Environment variables to add
- Dashboard configuration steps
- Verification commands

## Next Phase Readiness
- Data model and Auth.js configuration are in place for API route implementation
- Set provider credentials in `.env.local` before testing auth flows

---
*Phase: 01-projects-access*
*Completed: 2026-02-06*
