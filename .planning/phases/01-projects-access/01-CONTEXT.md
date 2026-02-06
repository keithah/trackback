# Phase 1: Projects & Access - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Create projects/tracks and controlled collaboration. This phase covers project and track creation, dashboard presentation, track status visibility, and invite access. Uploads, timeline feedback, and version history are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Project/Track Creation Flow
- Project creation is project-first; after create, show an empty state that opens an add-track modal immediately.
- Project creation requires: project name and a default track status.
- Default track status is **Demo**.
- Track creation requires: track name plus optional notes.
- Track names must be unique within a project.
- Track creation is single-track at a time (no batch add).
- After creating a track, user lands on the track page.

### Dashboard Layout & Density
- Dashboard uses a card grid layout.
- Track cards show: name, status, last updated (no additional metadata in v1).
- Tracks are grouped into **Active** and **Finished** sections.
- Ordering within sections is by most recent activity.

### Claude's Discretion
- None specified for this phase.

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-projects-access*
*Context gathered: 2026-02-05*
