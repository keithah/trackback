---
phase: 03-timeline-feedback
plan: 01
subsystem: api
tags: [prisma, nextjs]

# Dependency graph
requires:
  - phase: 02-media-ingest-playback
    provides: Track + version media data
provides:
  - Comment model with timestamp support
  - Comment create/list/delete APIs
affects: [timeline feedback]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zod validation for comment payloads
    - Comment authorization via membership + owner checks

key-files:
  created:
    - src/app/api/projects/[projectId]/tracks/[trackId]/comments/route.ts
    - src/app/api/projects/[projectId]/tracks/[trackId]/comments/[commentId]/route.ts
  modified:
    - prisma/schema.prisma

key-decisions:
  - Comment ordering uses timestampSeconds then createdAt for timeline

patterns-established:
  - Comments associated to track + optional version

# Metrics
duration: 28 min
completed: 2026-02-06
---

# Phase 3 Plan 1: Comment Model + API Summary

**Added comment schema and APIs for timestamped feedback with permission checks.**

## Performance

- **Duration:** 28 min
- **Started:** 2026-02-06T20:25:00Z
- **Completed:** 2026-02-06T20:53:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Added Comment model linked to Track, Version, and User.
- Implemented comment create/list endpoints with validation.
- Implemented delete endpoint with author/owner permissions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add comment model with timestamp** - Not committed (user did not request commits)
2. **Task 2: Create comment API** - Not committed (user did not request commits)
3. **Task 3: Add delete endpoint for comment cleanup** - Not committed (user did not request commits)

**Plan metadata:** Not committed (user did not request commits)

## Files Created/Modified
- `prisma/schema.prisma` - Added Comment model and relations.
- `src/app/api/projects/[projectId]/tracks/[trackId]/comments/route.ts` - GET/POST comments.
- `src/app/api/projects/[projectId]/tracks/[trackId]/comments/[commentId]/route.ts` - DELETE comments.

## Decisions Made
- Timeline ordering is based on timestampSeconds then createdAt.

## Deviations from Plan
None.

## Issues Encountered
None.

## User Setup Required
None.

## Next Phase Readiness
- Ready for timeline UI + composer integration.

---
*Phase: 03-timeline-feedback*
*Completed: 2026-02-06*
