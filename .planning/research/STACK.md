# Stack Research

**Domain:** Music collaboration web app with Git-backed session history and audio processing
**Researched:** 2026-02-05
**Confidence:** MEDIUM

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5.12 | Web app framework (SSR/ISR/API routes) | Standard 2025 React meta-framework for web-first apps; tight integration with React Server Components and routing. Confidence: HIGH (GitHub releases). |
| React | 19.2.4 | UI rendering layer | Current stable React release with server component support; aligns with Next.js defaults. Confidence: HIGH (GitHub releases). |
| TypeScript | 5.9.3 | Type safety across UI and backend | Dominant typing standard for JS/TS apps; ecosystem support across tooling. Confidence: HIGH (GitHub releases). |
| Node.js (LTS) | 24.13.0 | Server runtime | Active LTS for production workloads; wide library compatibility. Confidence: HIGH (nodejs.org release table). |
| PostgreSQL | 17.7 | Primary relational database | Standard OLTP choice for collaboration apps; strong JSONB, indexing, and transaction semantics. Confidence: HIGH (postgresql.org release notes). |
| Redis | 8.4.0 | Realtime fanout, caching, queues | Standard low-latency store for realtime presence, pub/sub, and job queues. Confidence: HIGH (GitHub releases). |
| FFmpeg | 8.0.1 | Audio transcoding, waveform, previews | De facto standard for audio pipeline (wav/aiff/flac to streaming formats). Confidence: HIGH (ffmpeg.org download page). |
| Git | 2.53.0 | Under-the-hood version history | Stable CLI version; enables real Git object store and history without exposing Git UX. Confidence: HIGH (git-scm.com install page). |
| Backblaze B2 (S3-compatible) | n/a (managed) | Object storage for audio assets | Cost-effective S3-compatible storage; fits current project context. Confidence: MEDIUM (vendor-managed). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Prisma | 7.3.0 | Type-safe ORM and migrations | Standard TS ORM; use for core data model and migrations. |
| Socket.IO | 4.8.2 | Realtime comments and presence | Use for timeline comment streaming and lightweight collaboration events. |
| BullMQ | 5.67.3 | Background job queue | Use for audio transcoding, waveform generation, and metadata extraction. |
| AWS SDK for JS v3 | 3.984.0 | S3-compatible storage client | Use for Backblaze B2 via S3 API; works with presigned URLs. |
| isomorphic-git | 1.36.3 | Git operations in JS | Use when you need Git ops without shelling out (e.g., serverless). Otherwise prefer Git CLI. |
| wavesurfer.js | 7.12.1 | Waveform rendering in UI | Use for waveform display and region selection in the timeline UI. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Docker | Local parity for Postgres/Redis | Use official images for consistent dev/prod behavior. |
| Playwright | E2E testing for upload/playback flows | Focus on audio upload, timeline comments, and playback sync. |

## Installation

```bash
# Core
npm install next react react-dom

# Supporting
npm install prisma @prisma/client socket.io bullmq @aws-sdk/client-s3 isomorphic-git wavesurfer.js

# Dev dependencies
npm install -D typescript
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js | Remix | If you want a more explicit server/runtime boundary and primarily rely on web standards over framework abstractions. |
| PostgreSQL | MySQL | If your team has deep MySQL operational expertise and no need for advanced JSONB/CTE features. |
| Socket.IO | Ably/Pusher | If you need hosted realtime with minimal infra and are willing to accept vendor lock-in. |
| BullMQ | Temporal | If you need long-running, fault-tolerant workflows with rich orchestration and observability. |
| Git CLI | libgit2 | If you need embedded Git and want C library bindings instead of shelling out. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Storing audio binaries in PostgreSQL | Blows up DB size, backup/restore times, and I/O costs | Object storage (Backblaze B2/S3) + DB metadata |
| Firebase/Firestore as primary DB | Hard to model Git-like history and relational collaboration data | PostgreSQL with migrations |
| WebRTC for timeline comments | Overkill for text-based realtime comments; adds complexity | WebSockets via Socket.IO |

## Stack Patterns by Variant

**If you need browser-based multi-track live sync:**
- Use WebRTC + LiveKit for low-latency audio
- Because WebRTC handles synchronized streaming better than HLS

**If you need serverless deployment:**
- Use isomorphic-git + object storage + serverless queues
- Because Git CLI and FFmpeg binaries can be hard to run in minimal runtimes

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.5.12 | React 19.2.4 | Align React/Next major versions to avoid runtime warnings. |
| BullMQ 5.67.3 | Redis 8.4.0 | BullMQ relies on Redis features; keep Redis on current GA. |

## Sources

- https://github.com/vercel/next.js/releases — Next.js 15.5.12
- https://github.com/facebook/react/releases — React 19.2.4
- https://github.com/microsoft/TypeScript/releases — TypeScript 5.9.3
- https://nodejs.org/en/about/previous-releases — Node.js 24.13.0 (Active LTS)
- https://www.postgresql.org/docs/release/ — PostgreSQL 17.7
- https://github.com/redis/redis/releases — Redis 8.4.0
- https://ffmpeg.org/download.html — FFmpeg 8.0.1
- https://git-scm.com/install/ — Git 2.53.0
- https://github.com/prisma/prisma/releases — Prisma 7.3.0
- https://github.com/socketio/socket.io/releases — Socket.IO 4.8.2
- https://github.com/taskforcesh/bullmq/releases — BullMQ 5.67.3
- https://github.com/aws/aws-sdk-js-v3/releases — AWS SDK v3.984.0
- https://github.com/isomorphic-git/isomorphic-git/releases — isomorphic-git 1.36.3
- https://github.com/katspaugh/wavesurfer.js/releases — wavesurfer.js 7.12.1

---
*Stack research for: music collaboration app with Git-backed versioning*
*Researched: 2026-02-05*
