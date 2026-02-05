# Trackback

## What This Is

Trackback is a web-first music collaboration workspace that replaces the iMessage + Notes + text-file workflow with a unified timeline per track. It lets non-technical artists and producers upload demos, discuss changes in context, and automatically capture a clean version history backed by Git (kept invisible to users).

## Core Value

Non-technical collaborators can move from demo to feedback to finalized notes in one place without losing context or versions.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Users can upload a demo and see it in a per-track timeline with playback
- [ ] Users can discuss a demo in context and “Save Session” to capture the day’s work
- [ ] Version history is clear and trustworthy without exposing Git concepts

### Out of Scope

- Native mobile apps — web-first in v1
- Public sharing site — private now, export later
- AI features — defer to later phases
- Advanced audio analysis — BPM/key/spectral beyond v1
- Roles/permissions — v1 is invite-anyone, only author can delete

## Context

- Inspiration comes from the structured, Git-backed album repo at `/Users/keith/src/empire-way-vol-1`, including demo metadata, production notes, and commit-message narratives
- The workflow mirrors real sessions: producer uploads, artist comments, revisions loop, “Save Session” batches work into a durable history
- Git is a behind-the-scenes integrity layer; users never need to learn Git
- Audio storage should support Trackback-managed storage (Backblaze B2 initially) with optional external links per track

## Constraints

- **Platform**: Web-first for v1 — desktop app later, mobile after web
- **User Experience**: Git must be invisible; collaboration should feel like a music-native workflow
- **Privacy**: Collaboration is private by default; public journey is exportable later

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web-first in v1 | Fastest path to replace iMessage/Notes workflow | — Pending |
| Git hidden, hybrid hosting | Ship fastest with user-connected repos now; migrate to app-managed later | — Pending |
| Notes auto-generated from conversation in v1 | Reduce manual overhead and capture decisions reliably | — Pending |
| Private collaboration now, export later | Avoid premature public exposure while keeping future option | — Pending |
| Minimal permissions in v1 | Reduce complexity; only author deletes, invites are open | — Pending |

---
*Last updated: 2026-02-05 after initialization*
