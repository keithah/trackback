# Roadmap: Trackback

## Overview

Trackback ships a web-first workflow that lets collaborators move from demo upload to contextual feedback to durable version history without losing context. The roadmap delivers project foundations first, then media ingestion and timeline feedback, followed by version history and collaborative notes.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Projects & Access** - Create projects/tracks and control collaborator access
- [ ] **Phase 2: Media Ingest & Playback** - Upload demos and make them playable with metadata
- [ ] **Phase 3: Timeline Feedback** - Review demos with timestamped, realtime comments
- [ ] **Phase 4: Version History & Sessions** - Track versions, compare, and capture milestones
- [ ] **Phase 5: Chat & Production Notes** - Coordinate in chat and finalize notes

## Phase Details

### Phase 1: Projects & Access
**Goal**: Users can set up projects, tracks, and controlled collaboration
**Depends on**: Nothing (first phase)
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, COLLAB-01, COLLAB-02
**Success Criteria** (what must be TRUE):
  1. User can create a project with a name and optional description.
  2. User can add tracks to a project and see them on a multi-track dashboard.
  3. User can set and view each track's status (demo, mixing, mastered, released).
  4. User can invite collaborators to a project by email or username.
  5. Only the project owner can delete tracks or versions.
**Plans**: 6 plans

Plans:
- [x] 01-01-PLAN.md — Decide v1 authentication method
- [x] 01-02-PLAN.md — Scaffold Next.js app with Tailwind baseline
- [ ] 01-03-PLAN.md — Add Prisma schema and Auth.js configuration
- [ ] 01-04-PLAN.md — Implement project/track/invite API routes
- [ ] 01-05-PLAN.md — Create Phase 1 UI shell and sign-in
- [ ] 01-06-PLAN.md — Build project dashboard, tracks, and invites UI

### Phase 2: Media Ingest & Playback
**Goal**: Users can upload or link demos and play them with rich audio context
**Depends on**: Phase 1
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04, MEDIA-05, MEDIA-06
**Success Criteria** (what must be TRUE):
  1. User can upload WAV/AIFF/FLAC files with visible progress.
  2. User can access previously uploaded demos across sessions/devices.
  3. User can play uploaded demos in the track view.
  4. User can see a waveform and extracted audio metadata for each demo.
  5. User can add an external audio link for a version instead of uploading.
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: Timeline Feedback
**Goal**: Users can review demos in context with chronological, realtime feedback
**Depends on**: Phase 2
**Requirements**: TL-01, TL-02, TL-03, TL-04
**Success Criteria** (what must be TRUE):
  1. User can view a per-track timeline of demos and comments in chronological order.
  2. User can leave a comment at a specific timestamp on a demo.
  3. User can see new comments appear in realtime without refresh.
  4. User can read the full message history for a track.
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Version History & Sessions
**Goal**: Users can understand and manage version history with trusted comparisons
**Depends on**: Phase 3
**Requirements**: VERS-01, VERS-02, VERS-03, VERS-04
**Success Criteria** (what must be TRUE):
  1. User can see a clear version list with names and dates.
  2. User can compare two versions with synced playback.
  3. User can mark a previous version as the current working version.
  4. User can click "Save Session" to create a session milestone in history.
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Chat & Production Notes
**Goal**: Users can coordinate in chat and turn discussion into saved notes
**Depends on**: Phase 4
**Requirements**: CHAT-01, CHAT-02, CHAT-03, NOTE-01, NOTE-02
**Success Criteria** (what must be TRUE):
  1. User can post messages in a project chat thread.
  2. User can view project chat history.
  3. User receives in-app notifications for new demos or comments.
  4. User can generate production notes from conversation history for a version.
  5. User can edit generated production notes before saving to the track.
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Projects & Access | 2/6 | In progress | 2026-02-06 |
| 2. Media Ingest & Playback | 0/TBD | Not started | - |
| 3. Timeline Feedback | 0/TBD | Not started | - |
| 4. Version History & Sessions | 0/TBD | Not started | - |
| 5. Chat & Production Notes | 0/TBD | Not started | - |
