# Architecture Research

**Domain:** Music collaboration app with Git-backed versioning
**Researched:** 2026-02-05
**Confidence:** LOW (no external sources available in this environment)

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Client Layer                              │
├────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Web UI        │  │ Audio Player  │  │ Waveform UI  │  │ Timeline  │ │
│  │ (projects)    │  │ (stream)      │  │ (seek/zoom)  │  │ (comments)│ │
│  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘  └────┬──────┘ │
│          │                  │                │               │        │
├──────────┴──────────────────┴────────────────┴───────────────┴────────┤
│                           API + Realtime Layer                         │
├────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth/API   │  │ Track/Project│  │ Timeline     │  │ Realtime Hub │  │
│  │ Gateway    │  │ Service      │  │ Service      │  │ (WS/SSE)     │  │
│  └─────┬──────┘  └─────┬────────┘  └─────┬────────┘  └─────┬────────┘  │
│        │               │               │                 │            │
├────────┴───────────────┴───────────────┴─────────────────┴────────────┤
│                         Media + Versioning Layer                       │
├────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │ Ingest/Upload │  │ Transcode     │  │ Waveform/Meta │               │
│  │ Service       │  │ Workers       │  │ Extractor     │               │
│  └──────┬────────┘  └──────┬────────┘  └──────┬────────┘               │
│         │                  │                 │                        │
│  ┌──────┴────────┐   ┌─────┴──────┐    ┌──────┴────────┐              │
│  │ Session Save  │   │ Git Store  │    │ Media Packager │              │
│  │ Service       │   │ (hidden)   │    │ (HLS/DASH)     │              │
│  └──────┬────────┘   └─────┬──────┘    └──────┬────────┘              │
├─────────┴─────────────────┴──────────────────┴────────────────────────┤
│                               Data Layer                               │
├────────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ SQL DB     │  │ Object Store │  │ Cache/CDN    │  │ Search Index │  │
│  │ (metadata) │  │ (FLAC + rend)|  │ (stream)     │  │ (tracks)     │  │
│  └────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Web UI + Player | Playback, waveform, timeline UI, upload entry points | SPA with audio playback + waveform rendering |
| Auth/API Gateway | Auth, rate limiting, request routing | API gateway + session/JWT |
| Track/Project Service | Project/track CRUD, access control, invites | Monolith service with DB |
| Timeline Service | Timestamped comments, discussion threads, revisions | Append-only timeline store |
| Realtime Hub | Presence, comment updates, playback position | WebSocket/SSE broker |
| Ingest/Upload Service | Signed upload URLs, validation, checksum | Direct-to-object-store uploads |
| Transcode Workers | Convert wav/aiff/flac to streamable formats | Background workers (queue) |
| Waveform/Metadata | Peak generation, duration, sample rate, tags | Worker tasks + metadata store |
| Session Save Service | Snapshot daily work into Git commit | Background job + git operations |
| Git Store (hidden) | Git-backed history per project | Bare repos on server or libgit2 |
| Media Packager | HLS/DASH manifests, segmenting | ffmpeg/packager pipeline |
| SQL DB | Users/projects/permissions/timeline metadata | Postgres/MySQL |
| Object Store | Audio sources and renditions | Backblaze B2/S3-like |
| Cache/CDN | Stream delivery, waveform assets | CDN + cache |
| Search Index | Track search, comment search | OpenSearch/Meilisearch |

## Recommended Project Structure

```
src/
├── api/                 # HTTP handlers, routing, request validation
│   ├── v1/              # Public API surface
│   └── middleware/      # Auth, rate limiting
├── domain/              # Core models: Project, Track, Session, Comment
├── services/            # Business logic per component
│   ├── projects/        # Project + track operations
│   ├── timeline/        # Timestamped discussion
│   ├── sessions/        # Save Session + Git integration
│   └── media/           # Media metadata, renditions
├── realtime/            # WebSocket/SSE hub and channels
├── workers/             # Background jobs (transcode, waveform)
├── storage/             # Object store, CDN, git store adapters
├── db/                  # Migrations, queries, repositories
├── integrations/        # Email, notifications, external links
└── shared/              # Logging, config, utilities
```

### Structure Rationale

- **services/** keeps core use-cases separate from transport concerns, letting API and workers reuse the same logic.
- **workers/** isolates long-running media tasks from request lifecycle to keep uploads and saves fast.

## Architectural Patterns

### Pattern 1: Asynchronous Media Pipeline

**What:** Direct uploads to object storage, then enqueue processing jobs for transcode, waveform, and metadata extraction.
**When to use:** Any audio ingest that exceeds typical request timeouts.
**Trade-offs:** Requires job orchestration and status tracking; improves reliability and UX.

**Example:**
```typescript
// Pseudocode: enqueue a transcode job after upload
await jobs.enqueue("media.transcode", {
  trackId,
  sourceKey,
  targets: ["flac", "aac", "mp3"],
});
```

### Pattern 2: Append-Only Session Log with Git Snapshots

**What:** Treat timeline edits and session notes as append-only events; periodically snapshot into Git commits.
**When to use:** When you want user-friendly history with a hidden VCS backing store.
**Trade-offs:** Requires reconciliation if events reference media not yet processed.

**Example:**
```typescript
// Pseudocode: commit a session summary to git
await sessionGit.commit({
  projectId,
  sessionId,
  message: `Save Session - ${date}`,
  artifacts: [timelineJson, trackManifest],
});
```

### Pattern 3: Timeline Anchors as Immutable References

**What:** Timestamped comments store a stable media reference (track version + time range).
**When to use:** Any system with playback-linked discussion.
**Trade-offs:** Requires mapping between track versions and current playback targets.

## Data Flow

### Request Flow

```
Upload Demo
    ↓
Client → API Gateway → Ingest Service → Object Store
    ↓                     ↓
Upload Complete → Job Queue → Transcode/Waveform Workers
    ↓                     ↓
Metadata Stored → SQL DB → Client Updates
```

### State Management

```
Client Store
    ↓ (subscribe)
UI Components ←→ Actions → API/Realtime → Client Store
```

### Key Data Flows

1. **Upload + Processing:** Client requests signed upload → uploads raw audio → workers generate renditions + waveform → metadata saved → UI updates.
2. **Timeline Discussion:** Comment with timestamp → timeline service stores event → realtime broadcast → collaborators update UI.
3. **Save Session:** User clicks Save Session → session service gathers project state → writes snapshot to Git store → updates session history.
4. **Playback:** Client requests stream URL → CDN serves HLS/DASH → player syncs waveform and timeline markers.

### Build Order Implications

1. **Core data model + API** must exist before upload or timeline features (projects, tracks, access control).
2. **Media ingest + object storage** comes before waveform/player polish; provides assets to anchor comments.
3. **Timeline + realtime** depends on track identifiers and basic playback capability.
4. **Session save + Git store** depends on stable metadata schemas and timeline events.
5. **Export + external links** should follow once internal storage and versioning are reliable.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith API + worker queue, single object store bucket, basic CDN |
| 1k-100k users | Separate media workers, dedicated queue, CDN tuning, search index |
| 100k+ users | Split media pipeline services, sharded object storage, multi-region CDN |

### Scaling Priorities

1. **First bottleneck:** Media transcoding throughput → add worker autoscaling and queue backpressure.
2. **Second bottleneck:** Stream delivery costs → aggressive CDN caching and format pruning.

## Anti-Patterns

### Anti-Pattern 1: Synchronous Transcoding in Request Path

**What people do:** Convert audio formats inside the upload request.
**Why it's wrong:** Timeouts, fragile uploads, and poor UX.
**Do this instead:** Direct upload + async jobs with status polling.

### Anti-Pattern 2: Storing Raw Audio in the SQL Database

**What people do:** Save audio blobs in relational DB tables.
**Why it's wrong:** Poor performance and expensive storage.
**Do this instead:** Object storage with metadata in SQL.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Object Storage (B2/S3) | Signed URLs + server-side verification | Ensure checksum validation |
| CDN | Signed URLs or tokenized access | Protect private collabs |
| Transcoding (ffmpeg) | Worker jobs with sandboxing | Avoid blocking API nodes |
| Email/Notifications | Job-based outbound | Rate limit invites |
| Git backend | libgit2 or server-side git commands | Keep hidden from end users |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| API ↔ Workers | Job queue | Keep payloads small, store artifacts in object store |
| Timeline ↔ Realtime | Pub/sub | Broadcast only deltas |
| Session Save ↔ Git Store | Internal service call | Treat as idempotent commit jobs |

## Sources

- No external sources consulted. Findings based on general web app and media pipeline patterns. Confidence LOW.

---
*Architecture research for: music collaboration + Git-backed versioning*
*Researched: 2026-02-05*
