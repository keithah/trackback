# Project Research Summary

**Project:** Trackback
**Domain:** Web-first music collaboration workspace with Git-backed session history and audio processing
**Researched:** 2026-02-05
**Confidence:** MEDIUM

## Executive Summary

Trackback is a web-first music collaboration workspace focused on upload, playback, and timeline-based feedback with Git-backed session history kept invisible to users. Experts build this kind of product with a web UI + realtime layer on top of a media pipeline that uses async processing, object storage for audio, and a relational database for metadata and access control. The architecture must prioritize upload reliability, playback correctness, and time-anchored comments.

The recommended approach is a Next.js + React + TypeScript stack with Postgres for metadata, object storage for audio (Backblaze B2 via S3 API), Redis for realtime and queues, and FFmpeg + workers for transcoding and waveform generation. Use append-only timeline events and periodic “Save Session” snapshots into a hidden Git store, while keeping large binaries out of Git and using content-addressed object storage.

Key risks center on timestamp drift between comments and audio, storage bloat from naive Git use, synchronous media processing, and privacy leaks from media URLs. Mitigate by anchoring annotations to immutable audio revisions, decoupling metadata from audio blobs, running all heavy media work in background jobs, and using signed URLs with strict access control.

## Key Findings

### Recommended Stack

The research favors a modern web stack with strong TypeScript support and proven media tooling. Next.js 15 + React 19 handle SSR and client UX; Postgres is the source of truth for collaboration metadata; Redis supports realtime fanout and queues; FFmpeg handles transcoding and waveform assets; Git is used internally for session history without exposing Git UX.

**Core technologies:**
- Next.js 15.5.12: web framework (SSR/ISR/API routes) — standard for React 19 server components.
- React 19.2.4: UI layer — aligns with Next.js defaults.
- TypeScript 5.9.3: type safety — ecosystem standard for JS/TS apps.
- Node.js 24.13.0 (LTS): runtime — production LTS support.
- PostgreSQL 17.7: primary DB — strong transactions and JSONB for collaboration data.
- Redis 8.4.0: realtime + queue backend — low latency pub/sub and job control.
- FFmpeg 8.0.1: audio pipeline — standard for transcode and waveform extraction.
- Git 2.53.0: internal history — stable CLI backing store.

### Expected Features

**Must have (table stakes):**
- Invite collaborators + access management — collaboration is the baseline expectation.
- Revision history / version history — required for trust and rollback.
- Cloud project storage — access from any device.
- Timeline comments with timestamps — core review loop.
- Project chat / message history — coordination inside the project.

**Should have (competitive):**
- Git-backed invisible revision graph — robust history without Git UX.
- “Save Session” daily snapshots — intentional milestones over noisy autosave.
- Per-track discussion timeline with synced playback — faster review in context.
- Audio ingest pipeline (wav/aiff/flac to streaming + waveform + metadata).

**Defer (v2+):**
- Real-time co-editing — high complexity, low ROI early.
- Advanced role/permission matrices — defer until enterprise demand is clear.

### Architecture Approach

Use a web client + API/realtime layer + media pipeline backed by Postgres and object storage. Keep media ingestion async via workers, maintain append-only timeline events, and snapshot sessions into a hidden Git store. This isolates large binary assets from metadata history and keeps the UX responsive.

**Major components:**
1. Web UI + Player — upload entry points, playback, waveform, timeline comments.
2. Auth/API Gateway — auth, routing, rate limits.
3. Track/Project Service — project/track CRUD, invites, access control.
4. Timeline Service — append-only comment events with timestamps.
5. Realtime Hub — presence and comment updates via WebSocket/SSE.
6. Ingest/Upload Service — signed URLs, validation, checksum.
7. Transcode + Waveform Workers — background media processing.
8. Session Save Service + Git Store — “Save Session” snapshots into hidden Git history.

### Critical Pitfalls

1. **Timestamped feedback drifts from audio reality** — anchor annotations to immutable audio versions and sample indices.
2. **Git-backed versioning explodes storage/perf** — keep binaries in object storage, Git stores metadata pointers only.
3. **Synchronous audio processing blocks collaboration** — async job queues with progressive availability.
4. **Collaboration conflicts cause silent data loss** — optimistic concurrency + conflict UI for notes/metadata.
5. **Privacy leaks via share links or CDN caching** — signed URLs, short TTLs, explicit share artifacts.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundations (Projects, Storage, Upload)
**Rationale:** All collaboration and timeline features depend on a stable project model, storage, and reliable uploads. This phase addresses the most expensive pitfalls early.
**Delivers:** Project/track model, auth + invites, object storage integration, resumable uploads, async media pipeline scaffolding, basic playback placeholders.
**Addresses:** Project creation + storage, invite collaborators, collaborator list, cloud access.
**Avoids:** Storage bloat, synchronous processing, upload UX failures, privacy leaks.

### Phase 2: Collaboration Loop (Playback, Timeline, Sessions)
**Rationale:** Timeline comments and “Save Session” are the core workflow; they require stable playback, waveform assets, and append-only event tracking.
**Delivers:** Waveform + playback, timeline comments with timestamps, realtime updates, revision history + Save Session snapshots, conflict detection for concurrent edits.
**Addresses:** Timeline comments, revision history, Git-backed snapshots, per-track discussion.
**Avoids:** Timestamp drift, playback/timeline sync issues, silent overwrite conflicts.

### Phase 3: Expansion (Chat, External Links, Export)
**Rationale:** Enhancements and integrations should follow once core collaboration is trusted.
**Delivers:** Project chat/notifications, external storage links per track, export/sharing flows, Git history projection for hybrid hosting.
**Addresses:** Project chat, external storage links, hybrid hosting future path.
**Avoids:** Identity/permission mismatches, broken external links, metadata loss on export.

### Phase Ordering Rationale

- Upload reliability and async media processing are prerequisites for timeline and session history features.
- Timeline + playback must be stable before “Save Session” snapshots can be trusted.
- Export/external links are safest once internal versioning and privacy controls are proven.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Playback sync, waveform correctness, and timestamp anchoring are high-risk and low-sourced.
- **Phase 3:** External link validation and Git export/identity mapping need deeper integration research.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Object storage + async media pipeline + Postgres/Redis stack are well-documented patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official releases and standard industry stack. |
| Features | MEDIUM | Based on competitor docs but still product-specific. |
| Architecture | LOW | Inferred patterns without external sources. |
| Pitfalls | LOW | Derived from domain experience, needs validation. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Playback sync and timebase strategy:** validate sample-accurate anchoring and cross-browser drift mitigation in Phase 2.
- **Git snapshot model + storage dedupe:** confirm content-addressed storage and snapshot sizing before v1 launch.
- **Export + hybrid hosting mapping:** define author identity and permission mapping before external Git sync.

## Sources

### Primary (HIGH confidence)
- https://github.com/vercel/next.js/releases — Next.js 15.5.12
- https://github.com/facebook/react/releases — React 19.2.4
- https://github.com/microsoft/TypeScript/releases — TypeScript 5.9.3
- https://nodejs.org/en/about/previous-releases — Node.js 24.13.0 (Active LTS)
- https://www.postgresql.org/docs/release/ — PostgreSQL 17.7
- https://github.com/redis/redis/releases — Redis 8.4.0
- https://ffmpeg.org/download.html — FFmpeg 8.0.1
- https://git-scm.com/install/ — Git 2.53.0

### Secondary (MEDIUM confidence)
- https://help.bandlab.com/hc/en-us/articles/48010528581529-How-do-I-invite-other-users-to-collaborate — invites
- https://support.soundtrap.com/hc/en-us/articles/6611281939474-Comment-Panel — timeline comments
- https://kb.avid.com/pkb/articles/en_US/faq/What-can-I-do-with-Avid-Cloud-Collaboration-for-Pro-Tools — collaboration expectations

### Tertiary (LOW confidence)
- Architecture and pitfalls derived from domain experience and project context in research docs — requires validation during planning.

---
*Research completed: 2026-02-05*
*Ready for roadmap: yes*
