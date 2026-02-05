# Feature Research

**Domain:** Music collaboration app with Git-backed versioning
**Researched:** 2026-02-05
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Invite collaborators (link/email/username) | Collaboration products consistently support invitations and project-level sharing | MEDIUM | BandLab and Soundtrap both document invite flows and collaborator management | 
| Collaborator list + manage access | Users need to see who has access and remove collaborators | MEDIUM | Soundtrap documents removing collaborators; BandLab exposes collaborators list on project page | 
| Revision history / version history | Music collaboration requires rollback and review of prior versions | MEDIUM | BandLab exposes revision history; Pro Tools Cloud tracks revision history | 
| Cloud project storage + access anywhere | Collaboration implies cloud-hosted projects | MEDIUM | Pro Tools Cloud Collaboration stores project data in cloud; Soundtrap emphasizes autosave across devices | 
| Timeline comments with timestamps | Producers expect time-based feedback on audio | MEDIUM | Soundtrap supports timeline comments tied to timestamps with a comment panel | 
| Project chat / message history | Coordinating changes benefits from in-project messaging | MEDIUM | Pro Tools Cloud Collaboration stores chat logs alongside projects | 

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Git-backed, invisible revision graph | Enables robust history, branching, and auditability without Git UX burden | HIGH | Aligns with Trackback’s “Save Session” model and hidden Git approach | 
| Session-level snapshots with daily “Save Session” | Reduces noise and creates intentional milestones | MEDIUM | Provides human-meaningful checkpoints rather than auto-save noise | 
| Per-track discussion timeline with synced playback | Faster review cycles and clearer feedback context | HIGH | Goes beyond project-level comments by anchoring to track timelines | 
| Hybrid hosting: connect existing storage now, app-managed later | Lowers adoption friction; supports teams with existing storage workflows | MEDIUM | Unique positioning for indie teams and small studios | 
| Audio ingest pipeline (wav/aiff/flac -> flac storage + streaming formats + waveform + metadata) | High-quality audio handling without manual conversion | HIGH | Builds trust in fidelity and review experience | 

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time co-editing of the same audio regions | Feels like “Google Docs for audio” | Conflict resolution, plugin mismatch, and sync instability | Async collaboration with clear ownership and merge-friendly snapshots | 
| Public-by-default collaboration feed | Social discovery and sharing | Violates private-by-default studio workflows | Private projects with optional export/share links | 
| Complex role/permission matrices early | Teams want fine-grained control | Slows onboarding and adds support burden | Simple roles: owner/participants; extend later if needed | 

## Feature Dependencies

```
[Project creation + storage]
    └──requires──> [Invite collaborators]
                      └──requires──> [Collaborator list + manage access]

[Autosave / snapshot engine]
    └──requires──> [Revision history / version history]

[Playback + waveform]
    └──requires──> [Timeline comments with timestamps]

[Asset registry + metadata]
    └──requires──> [External links per track]

[Revision history]
    └──enhances──> [Session-level snapshots with daily “Save Session”]

[Real-time co-editing]
    └──conflicts──> [Snapshot-based collaboration]
```

### Dependency Notes

- **Project creation + storage requires invite flow:** without a persistent project, collaboration has no durable scope.
- **Autosave/snapshot engine requires revision history:** snapshot mechanics are the substrate for version browsing and rollback.
- **Playback + waveform requires timeline comments:** comments are only useful when they can be anchored to playback context.
- **Asset registry + metadata requires external links per track:** linking external files needs a consistent catalog and metadata model.
- **Real-time co-editing conflicts with snapshot-based collaboration:** they imply different synchronization and conflict resolution models.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Project creation + audio upload/streaming — core asset flow for demos
- [ ] Invite collaborators + project link — enables real collaboration
- [ ] Timeline comments with timestamps — review loop MVP
- [ ] Revision history + “Save Session” snapshots — validates Git-backed value

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Project chat / notifications — add once engagement is proven
- [ ] External storage links per track — add when teams request BYO storage

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Real-time co-editing — high complexity, unclear ROI
- [ ] Advanced permissions (role matrix) — only if enterprise teams emerge

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Invite collaborators + project link | HIGH | MEDIUM | P1 |
| Timeline comments with timestamps | HIGH | MEDIUM | P1 |
| Revision history + Save Session snapshots | HIGH | HIGH | P1 |
| Project chat / notifications | MEDIUM | MEDIUM | P2 |
| External storage links per track | MEDIUM | MEDIUM | P2 |
| Real-time co-editing | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | BandLab | Soundtrap | Pro Tools Cloud Collaboration | Our Approach |
|---------|---------|-----------|------------------------------|--------------|
| Invite collaborators | Yes (invite collaborators from library) | Yes (invite link/email) | Yes (invite within Pro Tools) | Simple invite + private by default |
| Revision history | Yes (revision history in project page) | Not confirmed | Yes (revision history) | Git-backed snapshots with human-friendly session labels |
| Timeline comments | Not confirmed | Yes (timeline comments with timestamps) | Not confirmed | Per-track, playback-synced comments |
| Project chat/log | Not confirmed | Not confirmed | Yes (chat log stored with project) | Lightweight session notes + optional chat |

## Sources

- https://help.bandlab.com/hc/en-us/articles/48010528581529-How-do-I-invite-other-users-to-collaborate
- https://help.bandlab.com/hc/en-us/articles/4402292152857-What-is-the-Project-Page
- https://support.soundtrap.com/hc/en-us/articles/360023195053-Invite-users-to-collaborate-on-a-project
- https://support.soundtrap.com/hc/en-us/articles/205660081-How-do-I-remove-a-collaborator
- https://support.soundtrap.com/hc/en-us/articles/6611281939474-Comment-Panel
- https://kb.avid.com/pkb/articles/en_US/faq/What-can-I-do-with-Avid-Cloud-Collaboration-for-Pro-Tools
- https://kb.avid.com/pkb/articles/en_US/faq/If-I-close-and-reopen-a-Project-does-the-Artist-Chat-log-get-stored-so-I-could-view-and-reference-changes-with-collaborators-over-time-and-at-a-later-date
- https://kb.avid.com/pkb/articles/en_US/faq/How-many-discrete-Project-versions-can-be-saved-in-the-Revision-History

---
*Feature research for: music collaboration apps*
*Researched: 2026-02-05*
