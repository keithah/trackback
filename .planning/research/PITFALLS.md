# Pitfalls Research

**Domain:** Music collaboration app with Git-backed versioning and audio processing
**Researched:** 2026-02-05
**Confidence:** LOW

## Critical Pitfalls

### Pitfall 1: Timestamped feedback drifts from audio reality

**What goes wrong:**
Timeline comments and playback markers no longer line up after re-encoding, tempo changes, or replacement of the underlying audio asset. Users lose trust because feedback is attached to the wrong moment.

**Why it happens:**
Teams treat timestamps as absolute seconds without anchoring to a specific audio version or timebase. Audio pipelines often normalize sample rates or trim silence, which shifts alignment.

**How to avoid:**
Anchor all annotations to immutable audio revisions and store a stable timebase (sample index or timecode). When audio is replaced, prompt to remap or invalidate annotations. Maintain a clear version-to-annotation linkage in the session model.

**Warning signs:**
Users report comments that "point to the wrong moment" or ask which version feedback applies to. Multiple silent re-encodes occur without updates to annotation references.

**Phase to address:**
Phase 1 (Core upload + session model) and Phase 2 (Timeline + playback).

---

### Pitfall 2: Git-backed versioning explodes storage and performance

**What goes wrong:**
Binary audio revisions balloon storage costs, slow session loads, and make history operations unusable. "Save Session" becomes slow or fails under larger files.

**Why it happens:**
Git semantics are applied directly to large binary assets without chunking, deduplication, or content addressing. Audio history isn't separated from metadata history.

**How to avoid:**
Store audio blobs in object storage with content hashes and treat Git history as metadata pointers. Add deduplication by hash and aggressive caching for derived assets. Implement pruning policies for redundant renders.

**Warning signs:**
Session save times increase linearly with file size; repeated saves upload full files. Storage bills spike even with small user counts.

**Phase to address:**
Phase 1 (Storage architecture + versioning model).

---

### Pitfall 3: Synchronous audio processing blocks collaboration

**What goes wrong:**
Uploads or edits stall the UI while waveform generation, transcoding, and metadata extraction run, causing timeouts and abandoned sessions.

**Why it happens:**
Pipelines are implemented inline with API requests instead of asynchronous jobs. Derived asset generation is treated as required to show the session.

**How to avoid:**
Use async job queues for transcode/waveform. Show the session immediately with placeholders and progressive asset availability. Persist raw uploads first, then fan out processing.

**Warning signs:**
API request durations exceed tens of seconds; uploads "complete" but sessions do not appear until processing finishes.

**Phase to address:**
Phase 1 (Upload + processing pipeline) and Phase 2 (Playback UX).

---

### Pitfall 4: Collaboration conflicts lead to silent data loss

**What goes wrong:**
Two users edit notes or session metadata concurrently, and one update overwrites the other. Users assume Git provides safety, but conflict resolution is hidden.

**Why it happens:**
Hidden Git history masks merge conflicts. Teams implement "last write wins" for simplicity without surfacing collisions.

**How to avoid:**
Add optimistic concurrency controls and conflict detection for session edits. Provide a visible conflict resolution UI for notes and track metadata. Keep Git history internal but expose conflict events.

**Warning signs:**
Users report "my changes disappeared" or repeated edits reappear after refresh. Server logs show frequent simultaneous writes.

**Phase to address:**
Phase 2 (Collaboration model + UI).

---

### Pitfall 5: Hybrid Git hosting causes identity and permission mismatches

**What goes wrong:**
When users connect their own Git hosting later, history mapping fails, permissions drift, or ownership doesn't align with app roles. Exported history is confusing or incomplete.

**Why it happens:**
Early models assume app-managed history and do not define a stable mapping to external repositories, authorship, and access controls.

**How to avoid:**
Define a canonical internal identity map (user → author identity) and an export model early. Treat external sync as a projection, not the source of truth. Test export/import on day-one data.

**Warning signs:**
Exported repos show anonymous authors, missing sessions, or duplicated commits. Users ask why Git history doesn't match in-app sessions.

**Phase to address:**
Phase 1 (Versioning model) and Phase 3 (Export/sharing).

---

### Pitfall 6: External links create broken or private-by-default failures

**What goes wrong:**
Sessions rely on third-party links that expire or change access rules. Playback fails or exposes private demos in public.

**Why it happens:**
External links are treated as first-class media without validation, freshness checks, or permission boundaries.

**How to avoid:**
Validate external links on creation and on a schedule. Cache a preview or snapshot when allowed. For private projects, require signed links or explicit opt-in to public hosting.

**Warning signs:**
Playback errors cluster around linked assets. Users report "it worked yesterday" or "I shared by accident."

**Phase to address:**
Phase 2 (Media ingestion rules) and Phase 3 (Sharing/export).

---

### Pitfall 7: Browser playback and timeline sync drift

**What goes wrong:**
Waveform, playhead, and comments drift across devices or browsers, breaking collaboration during listening sessions.

**Why it happens:**
Audio decoding uses different sample rates and codecs per browser, and playback is not scheduled against a stable clock. Multi-track mixes drift when each track uses its own clock.

**How to avoid:**
Normalize sample rates in the pipeline. Use Web Audio scheduling with a single master clock. Keep timeline markers keyed to sample index, not UI time.

**Warning signs:**
Reports of drift after several minutes, or discrepancies between mobile and desktop playback positions.

**Phase to address:**
Phase 2 (Playback engine + timeline).

---

### Pitfall 8: Privacy defaults are undermined by share links or CDN caching

**What goes wrong:**
Private collaborations leak via cacheable URLs, shared previews, or mistaken "export" settings. Trust breaks quickly in creative communities.

**Why it happens:**
Teams treat media files as static public assets and rely on obscurity instead of access controls. CDN caching rules are not aligned with privacy semantics.

**How to avoid:**
Use signed URLs with short TTLs for private audio. Enforce access checks on waveform and metadata endpoints. Separate "preview/share" artifacts from core storage.

**Warning signs:**
Users find old URLs still work after revocation, or shared links appear in search results.

**Phase to address:**
Phase 1 (Storage + access model) and Phase 3 (Sharing).

---

### Pitfall 9: Audio metadata integrity and attribution gets lost

**What goes wrong:**
Stems, contributor credits, and session notes disappear during transcoding or exports. Rights disputes and confusion follow.

**Why it happens:**
Metadata is stored only in audio files or only in app DB, and the pipeline overwrites or strips tags. Export tooling doesn't merge app metadata back into files.

**How to avoid:**
Maintain a canonical metadata store and explicitly map to file tags on export. Preserve original metadata snapshots for audit and recovery.

**Warning signs:**
Users report missing credits or notes after export. Metadata appears inconsistent between player and download.

**Phase to address:**
Phase 2 (Metadata model) and Phase 3 (Export).

---

### Pitfall 10: Demo-scale upload UX doesn't survive real studio usage

**What goes wrong:**
Large multi-minute WAV/AIFF uploads fail, resume is unavailable, or mobile networks time out. Artists abandon the app after a few failures.

**Why it happens:**
MVP assumes small files and stable networks. Chunked/resumable uploads are deferred.

**How to avoid:**
Implement chunked uploads with resumable sessions from the start. Provide clear upload status, retries, and integrity checks.

**Warning signs:**
Support tickets about stuck uploads; logs show repeated retries or partial objects.

**Phase to address:**
Phase 1 (Upload pipeline).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing audio revisions in the same table as metadata | Fast to implement | Hard to dedupe or manage retention | Only for prototype with non-paying users |
| Synchronous transcoding in request flow | Simple pipeline | Timeouts, failed uploads, poor UX | Never for >25 MB files |
| "Last write wins" on session edits | Avoids merge UI | Lost notes and mistrust | Only for single-user private sessions |
| Public, permanent URLs for audio | Easy playback | Privacy leaks, no revocation | Only for explicit public releases |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Backblaze B2 or similar object storage | Treating uploads as atomic without resumable support | Use multipart/chunked uploads and verify checksums |
| Waveform/FFmpeg workers | Running heavy processing on the web tier | Isolate workers and queue jobs with retries |
| External audio links | Assuming long-lived access | Validate on creation, re-check periodically, handle expiry |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Regenerating waveforms on every session load | Slow UI, CPU spikes | Cache derived assets by content hash | >1k sessions or >100 concurrent users |
| Streaming from origin without edge caching rules | Buffering and high egress costs | Use CDN with signed URLs and cache control | >10 TB/month egress |
| Loading all revision history on page load | Large payloads, slow UI | Paginate and lazy-load history | >200 revisions per project |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Using guessable media URLs for private demos | Unauthorized access and leaks | Signed URLs + access checks |
| Open invites without audit trail | Abuse, unauthorized access | Require invite tokens + audit logs |
| Exporting Git history with private notes by default | Accidental disclosure | Explicit export scopes + preview |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No "version context" in feedback threads | Confusion about which take is referenced | Display audio revision and allow switching |
| Hidden processing states | Users think uploads failed | Show a processing timeline and partial availability |
| Timeline controls not mobile-safe | Can’t annotate on phone | Mobile-first timeline and coarse-grained markers |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Upload pipeline:** Often missing resumable support — verify mid-upload network drop recovery
- [ ] **Timeline comments:** Often missing version binding — verify annotation stays correct after re-encode
- [ ] **Session save:** Often missing conflict detection — verify simultaneous edits prompt resolution
- [ ] **Private sharing:** Often missing revocation — verify link expires and access is removed

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Timestamp drift | MEDIUM | Rebuild annotation map from version snapshots, prompt users to re-anchor |
| Storage bloat | HIGH | Migrate blobs to content-addressed storage and rebuild history pointers |
| Lost edits from conflicts | MEDIUM | Restore from Git history, add conflict markers, notify users |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Timestamped feedback drifts from audio reality | Phase 1-2 | Re-encode an asset and confirm annotation alignment |
| Git-backed versioning explodes storage and performance | Phase 1 | Save 10 revisions and confirm dedupe + storage growth |
| Synchronous audio processing blocks collaboration | Phase 1-2 | Upload large file and confirm session loads before processing completes |
| Collaboration conflicts lead to silent data loss | Phase 2 | Simulate concurrent edits and ensure conflict UI appears |
| Hybrid Git hosting causes identity and permission mismatches | Phase 1-3 | Export a repo and verify authorship + permissions mapping |
| External links create broken or private-by-default failures | Phase 2-3 | Expire a link and verify UX + fallback behavior |
| Browser playback and timeline sync drift | Phase 2 | 10-minute playback test across devices with consistent playhead |
| Privacy defaults are undermined by share links or CDN caching | Phase 1-3 | Revoke access and confirm all cached URLs fail |
| Audio metadata integrity and attribution gets lost | Phase 2-3 | Export assets and verify metadata + credits preserved |
| Demo-scale upload UX doesn't survive real studio usage | Phase 1 | Simulate flaky network and confirm resumable upload works |

## Sources

- Project context provided by orchestrator
- General domain experience with audio collaboration tools (LOW confidence)

---
*Pitfalls research for: music collaboration app with Git-backed versioning*
*Researched: 2026-02-05*
