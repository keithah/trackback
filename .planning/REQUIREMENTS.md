# Requirements: Trackback

**Defined:** 2026-02-05
**Core Value:** Non-technical collaborators can move from demo to feedback to finalized notes in one place without losing context or versions.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Projects & Tracks

- [ ] **PROJ-01**: User can create a project with name and optional description
- [ ] **PROJ-02**: User can create tracks within a project
- [ ] **PROJ-03**: User can view a multi-track dashboard showing each track’s latest version and status
- [ ] **PROJ-04**: User can set and view track status (demo, mixing, mastered, released)

### Collaboration & Access

- [ ] **COLLAB-01**: User can invite collaborators to a project by email or username
- [ ] **COLLAB-02**: Only the project owner can delete tracks or versions

### Upload & Media

- [ ] **MEDIA-01**: User can upload WAV/AIFF/FLAC files with progress indication
- [ ] **MEDIA-02**: User can access previously uploaded demos across sessions/devices
- [ ] **MEDIA-03**: User can play uploaded demos in the track view
- [ ] **MEDIA-04**: User can view a generated waveform for each demo
- [ ] **MEDIA-05**: User can view extracted audio metadata (duration, sample rate, bitrate)
- [ ] **MEDIA-06**: User can add an external audio link for a version instead of upload

### Timeline & Feedback

- [ ] **TL-01**: User can view a per-track timeline of demos and comments in chronological order
- [ ] **TL-02**: User can leave a comment at a specific timestamp on a demo
- [ ] **TL-03**: User can see new comments appear in realtime without refresh
- [ ] **TL-04**: User can read full message history for a track

### Version History

- [ ] **VERS-01**: User can see a clear version list with names and dates
- [ ] **VERS-02**: User can compare two versions with synced playback
- [ ] **VERS-03**: User can mark a previous version as the current working version (rollback)
- [ ] **VERS-04**: User can click “Save Session” to create a session milestone in history

### Chat & Notifications

- [ ] **CHAT-01**: User can post messages in a project chat thread
- [ ] **CHAT-02**: User can view project chat history
- [ ] **CHAT-03**: User receives in-app notifications for new demos or comments

### Production Notes

- [ ] **NOTE-01**: User can generate production notes from conversation history for a version
- [ ] **NOTE-02**: User can edit generated production notes before saving to the track

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Collaboration & Access

- **COLLAB-03**: User can assign roles/permissions (producer, artist, engineer)

### Production Notes

- **NOTE-03**: User can choose a structured production-notes template

### Export

- **EXPT-01**: User can export project history (notes, messages, versions) as ZIP/markdown

### Mobile

- **MOB-01**: User can use an iOS app with core v1 features
- **MOB-02**: User can use an Android app with core v1 features

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Public sharing site | Private by default; export later |
| AI features | Defer until core workflow is validated |
| Advanced audio analysis | Not required for v1 collaboration loop |
| Electron desktop app | Web-first path; revisit after mobile |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PROJ-01 | Phase 1 | Pending |
| PROJ-02 | Phase 1 | Pending |
| PROJ-03 | Phase 1 | Pending |
| PROJ-04 | Phase 1 | Pending |
| COLLAB-01 | Phase 1 | Pending |
| COLLAB-02 | Phase 1 | Pending |
| MEDIA-01 | Phase 2 | Pending |
| MEDIA-02 | Phase 2 | Pending |
| MEDIA-03 | Phase 2 | Pending |
| MEDIA-04 | Phase 2 | Pending |
| MEDIA-05 | Phase 2 | Pending |
| MEDIA-06 | Phase 2 | Pending |
| TL-01 | Phase 3 | Pending |
| TL-02 | Phase 3 | Pending |
| TL-03 | Phase 3 | Pending |
| TL-04 | Phase 3 | Pending |
| VERS-01 | Phase 4 | Pending |
| VERS-02 | Phase 4 | Pending |
| VERS-03 | Phase 4 | Pending |
| VERS-04 | Phase 4 | Pending |
| CHAT-01 | Phase 5 | Pending |
| CHAT-02 | Phase 5 | Pending |
| CHAT-03 | Phase 5 | Pending |
| NOTE-01 | Phase 5 | Pending |
| NOTE-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after roadmap creation*
