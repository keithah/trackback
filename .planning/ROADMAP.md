# Roadmap: Trackback

## Overview

Trackback ships a web-first workflow that lets collaborators move from demo upload to contextual feedback to durable version history without losing context. The roadmap delivers project foundations first, then media ingestion and timeline feedback, followed by version history and collaborative notes.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Projects & Access** - Create projects/tracks and control collaborator access
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
**Plans**: 7 plans

Plans:
- [x] 01-01-PLAN.md — Decide v1 authentication method
- [x] 01-02-PLAN.md — Scaffold Next.js app with Tailwind baseline
- [x] 01-03-PLAN.md — Add Prisma schema and Auth.js configuration
- [x] 01-04-PLAN.md — Implement project/track/invite API routes
- [x] 01-05-PLAN.md — Create Phase 1 UI shell and sign-in
- [x] 01-06-PLAN.md — Build project dashboard, tracks, and invites UI
- [x] 01-07-PLAN.md — Close Phase 1 version gap (model + delete + UI)

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
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Add version media model + upload/link APIs
- [x] 02-02-PLAN.md — Build upload UI with progress + version list
- [x] 02-03-PLAN.md — Add waveform playback + metadata UI

### Phase 3: Timeline Feedback
**Goal**: Users can review demos in context with chronological, realtime feedback
**Depends on**: Phase 2
**Requirements**: TL-01, TL-02, TL-03, TL-04
**Success Criteria** (what must be TRUE):
  1. User can view a per-track timeline of demos and comments in chronological order.
  2. User can leave a comment at a specific timestamp on a demo.
  3. User can see new comments appear in realtime without refresh.
  4. User can read the full message history for a track.
**Plans**: 3 plans

Plans:
- [x] 03-01-PLAN.md — Add comment model + APIs
- [x] 03-02-PLAN.md — Timeline UI + timestamped composer
- [x] 03-03-PLAN.md — Realtime-ish updates via polling

### Phase 4: Version History & Sessions
**Goal**: Users can understand and manage version history with trusted comparisons
**Depends on**: Phase 3
**Requirements**: VERS-01, VERS-02, VERS-03, VERS-04
**Success Criteria** (what must be TRUE):
  1. User can see a clear version list with names and dates.
  2. User can compare two versions with synced playback.
  3. User can mark a previous version as the current working version.
  4. User can click "Save Session" to create a session milestone in history.
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Add current version + session metadata
- [x] 04-02-PLAN.md — Version list + compare UI
- [x] 04-03-PLAN.md — Session milestones API + UI

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
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Chat model + API
- [x] 05-02-PLAN.md — Chat UI panel on project page
- [x] 05-03-PLAN.md — Production notes generator + editor

### Phase 6: Hosting & Media Storage
**Goal**: Production hosting and media storage are configured with deployment automation and upload pathways.
**Depends on**: Phase 2
**Requirements**: DEPLOY-01, DEPLOY-02, STORAGE-01, STORAGE-02
**Success Criteria** (what must be TRUE):
  1. The app is deployed to a managed platform with environment variables and database configured.
  2. Media uploads store files in B2 (or compatible object storage) and return playable URLs.
  3. Deployments are reproducible from the repository with documented steps.
**Plans**: 3 plans

Plans:
 - [x] 06-01-PLAN.md — B2 storage integration for uploads
 - [x] 06-02-PLAN.md — Self-host deployment with Docker Compose
 - [ ] 06-03-PLAN.md — Ops docs + env template

### Phase 7: Advanced Audio Analysis (Essentia.js)
**Goal**: Rich audio analysis features are derived from uploads using Essentia.js for deeper insights.
**Depends on**: Phase 2
**Requirements**: AUDIO-01, AUDIO-02, AUDIO-03
**Success Criteria** (what must be TRUE):
  1. Uploaded audio is analyzed via Essentia and stored with the version.
  2. Users can view advanced audio analysis fields in the track view.
  3. Analysis runs asynchronously without blocking uploads.
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Projects & Access | 7/7 | Complete | 2026-02-06 |
| 2. Media Ingest & Playback | 3/3 | Complete | 2026-02-06 |
| 3. Timeline Feedback | 3/3 | Complete | 2026-02-06 |
| 4. Version History & Sessions | 3/3 | Complete | 2026-02-06 |
| 5. Chat & Production Notes | 3/3 | Complete | 2026-02-06 |
| 6. Hosting & Media Storage | 2/3 | In progress | - |
| 7. Advanced Audio Analysis (Essentia) | 0/TBD | Not started | - |
