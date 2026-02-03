# Trackback - Product Specification Document

## Vision
Trackback replaces the fragmented workflow of iMessage + Apple Notes + text files with a unified app for music collaboration backed by Git. It preserves the creative journey of album production while making it easy for non-technical artists to version control their work.

## Core Problem
**Current Pain Points:**
- Demo notes get lost in iMessage scroll
- Hard to find old feedback about specific tracks
- No clear version history or lineage
- Conversation context scattered across apps
- Difficult to trace songs back to origin
- Can't easily share creative journey with world

**Solution:**
A music-first app that combines file sharing, conversation, and version control - with Git working invisibly in the background.

---

## Product Overview

### What It Is
- Real-time collaboration tool for music production
- Track-based conversation threads with embedded audio players
- Automatic Git version control (hidden from users)
- Eventually generates public documentation/website

### What It Replaces
- iMessage (for track discussions)
- Apple Notes (for saving producer notes)
- Text files (for production documentation)
- Manual Git commands (automated in background)
- untitled.stream (self-hosted audio)

---

## Technical Architecture

### Git Structure

```
Repository Root
├─ main (stable releases only)
├─ digital-release (streaming masters)
├─ vinyl-release (vinyl masters)  
├─ physical-release (CD/physical masters)
└─ songs/
    ├─ empire-way/
    │   ├─ v1-initial-demo
    │   ├─ v2-bridge-revision
    │   ├─ v3-final-mix
    │   └─ main (current working version)
    ├─ track-02/
    └─ track-03/
```

**Branch Strategy:**
- Each song gets its own branch tree: `songs/{track-name}/`
- Sub-branches for each version: `songs/{track-name}/v{N}-{name}`
- Working branch: `songs/{track-name}/main`
- When mastered: merge → release branches (digital/vinyl/physical)
- Tag releases: `v1.0-empire-way-digital`

**Commit Strategy:**
- Batch commits daily (or on-demand "Save Session")
- One commit per song per session
- Format: "Session 2026-02-03: Empire Way - bridge revision + conversation"
- Separate commits per song even if worked on same day

**File Structure (per song branch):**
```
tracks/empire-way/
├─ audio/
│   ├─ demos/
│   │   ├─ v1-initial-demo.flac (Git LFS)
│   │   ├─ v2-bridge-revision.flac (Git LFS)
│   │   └─ metadata.json
│   └─ masters/
│       └─ final-digital.flac
├─ notes/
│   └─ production-notes.md
├─ conversation/
│   ├─ 2026-02-03-session.json
│   └─ 2026-02-04-session.json
└─ metadata.json
```

### Audio Storage & Processing

**Storage:**
- Primary: Cloud storage (S3/similar) for streaming
- Backup: Git LFS for version control
- Future: Custom CDN/streaming service

**Upload Flow:**
1. User uploads WAV file (drag/drop or file picker)
2. Server converts: WAV → FLAC (lossless compression ~50% smaller)
3. Generate: MP3/AAC for web streaming
4. Extract metadata: BPM, key, loudness, duration
5. Generate waveform visualization (PNG/SVG)
6. Store: Original FLAC in LFS + streaming formats in cloud
7. Return: URLs + metadata to client

**Supported Formats:**
- Upload: WAV, AIFF, FLAC
- Storage: FLAC (lossless, compressed)
- Streaming: AAC 256kbps (web), AAC 128kbps (mobile)
- Download: Original format + FLAC

### Data Sync

**Real-time Sync (like Google Docs):**
- WebSocket connections for live updates
- Operational Transform (OT) or CRDT for conflict-free editing
- Optimistic UI updates with rollback on conflict
- Presence indicators (who's online, who's typing)

**Conflict Resolution:**
- Audio uploads: timestamp-based (last write wins, but both preserved)
- Messages: append-only (no conflicts possible)
- Metadata: field-level merge with user prompt if conflicting

---

## MVP Feature Set

### Must-Have (Phase 1)

#### 1. Project & Track Management
- [ ] Create album/project (links to Git repo)
- [ ] Invite collaborators (email/username)
- [ ] Create new track
- [ ] Multi-track dashboard view
- [ ] Track status (demo, mixing, mastered, released)

#### 2. Audio Upload & Playback
- [ ] Drag/drop audio file upload (desktop)
- [ ] File picker upload (mobile)
- [ ] Upload progress indicator
- [ ] Audio player with playback controls
- [ ] Waveform visualization
- [ ] Version naming (auto-increment or custom)
- [ ] Audio metadata display (BPM, key, duration)

#### 3. Conversation System
- [ ] Per-track conversation thread
- [ ] Rich text messages
- [ ] Timestamp-based comments on audio
- [ ] File/image attachments
- [ ] Real-time updates
- [ ] Read receipts/presence
- [ ] @mentions for collaborators

#### 4. Version Control
- [ ] Version history timeline
- [ ] Side-by-side audio comparison
- [ ] Waveform diff visualization
- [ ] "Save Session" button (batch commit)
- [ ] Manual "Create Production Notes"
- [ ] Export conversation as text/markdown

#### 5. Git Integration (Hidden)
- [ ] Auto-create repo on project creation
- [ ] Background branch management
- [ ] Automatic LFS configuration
- [ ] Daily batch commits
- [ ] Transparent sync to GitHub/GitLab

#### 6. Desktop App
- [ ] Electron-based desktop app (Mac, Windows, Linux)
- [ ] System tray notifications
- [ ] Drag/drop from Finder/Explorer
- [ ] Local file browsing integration

### Nice-to-Have (Phase 2+)

#### 7. Mobile App
- [ ] iOS app (React Native or Swift)
- [ ] Android app
- [ ] Push notifications
- [ ] Mobile-optimized UI
- [ ] Audio recording from phone

#### 8. AI Features
- [ ] Conversation summarization
- [ ] Auto-generate production notes from conversation
- [ ] Suggest version names based on changes
- [ ] Extract technical details from messages

#### 9. Advanced Audio
- [ ] BPM detection (librosa/essentia)
- [ ] Key detection
- [ ] Loudness analysis (LUFS)
- [ ] Spectral analysis
- [ ] A/B comparison with reference tracks
- [ ] Inline audio editing (trim, fade)

#### 10. Public Sharing
- [ ] Per-track privacy settings
- [ ] Public project website generation
- [ ] Embeddable players
- [ ] Public timeline view
- [ ] Curated release notes

#### 11. Collaboration Features
- [ ] Guest feature artist invites
- [ ] Mixing engineer role
- [ ] Mastering engineer role
- [ ] Role-based permissions
- [ ] Task assignment
- [ ] Approval workflows

---

## User Interface Design

### Main Dashboard (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Trackback          [Project: Empire Way Vol. 1]    [@user ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Active Tracks                          [+ New Track]        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│  │ Empire Way    │ │ Track 02      │ │ Track 03      │     │
│  │ ● 3 new msgs  │ │ ● 1 new demo  │ │               │     │
│  │ Demo v4       │ │ Demo v2       │ │ Demo v1       │     │
│  │ 2 hours ago   │ │ Yesterday     │ │ 3 days ago    │     │
│  └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                               │
│  Recent Activity                                              │
│  • Producer uploaded Demo 4 of Empire Way (2 hours ago)      │
│  • You replied to Track 02 discussion (yesterday)            │
│  • Dakota Camacho joined Track 02 (3 days ago)               │
│                                                               │
│  Finished Tracks                                              │
│  [Empty - no tracks mastered yet]                            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Track View (Conversation Interface)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard          Empire Way           [⚙ Track Settings] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Timeline                                    [Save Session]   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📤 Demo 4 - bridge_revision                           │   │
│ │ Feb 3, 2026 2:45 PM • Uploaded by Producer            │   │
│ │                                                         │   │
│ │ ▶ [Waveform ═══════════╪════════════] 3:24            │   │
│ │    0:00              1:42          3:24               │   │
│ │                                                         │   │
│ │ 📝 "Changed bridge to half-time feel, added brass     │   │
│ │     section. Try around 1:42 for the new part."       │   │
│ │                                                         │   │
│ │ 💬 Conversation (2 messages)          [Show/Hide]     │   │
│ │    └─ You: "Love it! Vocals at 2:15 need to be louder"│   │
│ │       └─ @ 2:15 🔊                                     │   │
│ │    └─ Producer: "Will fix, sending v5 tomorrow"       │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📤 Demo 3 - vocal_harmonies                           │   │
│ │ Feb 2, 2026 10:30 AM • Uploaded by Producer           │   │
│ │ ▶ [Waveform ════════════════════════] 3:22            │   │
│ │ [collapsed - click to expand]                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ [Type a message...                  ]  [📎] [🎤] [Send]│   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Upload Modal

```
┌─────────────────────────────────────────┐
│ Upload New Demo                     [×] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Drag & drop audio file here    │   │
│  │  or click to browse             │   │
│  │                                  │   │
│  │         [📁 Browse Files]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Uploading: empire-way-v4.wav           │
│  [████████░░░░░░░░░░░] 47% (235 MB)    │
│                                         │
│  Version Name:                          │
│  [bridge_revision____________]          │
│  (or leave blank for "Demo 4")          │
│                                         │
│  What changed in this version?          │
│  ┌─────────────────────────────────┐   │
│  │ Changed bridge to half-time,    │   │
│  │ added brass section             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancel]              [Upload & Share] │
└─────────────────────────────────────────┘
```

### Side-by-Side Comparison

```
┌─────────────────────────────────────────────────────────────┐
│ Compare Versions                                        [×] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Demo 3 (Feb 2)                Demo 4 (Feb 3)                │
│  ┌─────────────────────┐      ┌─────────────────────┐       │
│  │▶ [Waveform─────]    │      │▶ [Waveform─────]    │       │
│  │   3:22              │      │   3:24              │       │
│  └─────────────────────┘      └─────────────────────┘       │
│                                                               │
│  Waveform Diff:                                               │
│  ┌───────────────────────────────────────────────────┐       │
│  │ [Diff visualization showing changed regions]       │       │
│  │  Green = added, Red = removed, Yellow = modified  │       │
│  └───────────────────────────────────────────────────┘       │
│                                                               │
│  Changes:                                                     │
│  • Duration: 3:22 → 3:24 (+2s)                               │
│  • BPM: 92 → 92 (unchanged)                                  │
│  • Peak level: -6.2 dB → -5.8 dB                             │
│  • Regions modified: 1:40-2:10 (bridge section)              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Create Production Notes

```
┌─────────────────────────────────────────┐
│ Create Production Notes             [×] │
├─────────────────────────────────────────┤
│                                         │
│  This will create a structured markdown│
│  document from this track's history.   │
│                                         │
│  Include:                               │
│  ☑ Recording sessions (3 sessions)     │
│  ☑ Mix decisions (from messages)       │
│  ☑ Reference tracks mentioned          │
│  ☑ Collaborators                        │
│  ☐ Full conversation transcript        │
│                                         │
│  Template:                              │
│  ◉ Standard (like empire-way example)  │
│  ○ Minimal (just sessions & credits)   │
│  ○ Detailed (everything)               │
│                                         │
│  [Preview]           [Generate & Save]  │
└─────────────────────────────────────────┘
```

---

## Data Models

### Project
```json
{
  "id": "uuid",
  "name": "Empire Way Vol. 1",
  "created_at": "2026-01-15T00:00:00Z",
  "updated_at": "2026-02-03T14:45:00Z",
  "git_repo_url": "https://github.com/user/empire-way-vol-1",
  "default_privacy": "private",
  "collaborators": [
    {
      "user_id": "uuid",
      "role": "owner",
      "permissions": ["all"]
    },
    {
      "user_id": "uuid", 
      "role": "collaborator",
      "permissions": ["upload", "comment", "create_notes"]
    }
  ],
  "settings": {
    "auto_save_interval": "daily",
    "notification_preferences": {...}
  }
}
```

### Track
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "name": "Empire Way",
  "slug": "empire-way",
  "status": "demo",
  "created_at": "2025-06-29T00:00:00Z",
  "updated_at": "2026-02-03T14:45:00Z",
  "git_branch": "songs/empire-way/main",
  "metadata": {
    "bpm": 92,
    "key": "E minor",
    "duration": 204,
    "collaborators": ["Producer", "Artist", "Dakota Camacho"]
  },
  "privacy": "private",
  "current_version": "v4-bridge-revision",
  "version_count": 4
}
```

### Version (Demo)
```json
{
  "id": "uuid",
  "track_id": "uuid",
  "version_number": 4,
  "version_name": "bridge_revision",
  "display_name": "Demo 4 - bridge_revision",
  "created_at": "2026-02-03T14:45:00Z",
  "uploaded_by": "uuid",
  "git_commit": "abc123def456",
  "git_branch": "songs/empire-way/v4-bridge-revision",
  "audio_files": {
    "original": {
      "format": "flac",
      "url": "https://storage/empire-way-v4.flac",
      "size_bytes": 147456000,
      "duration": 204,
      "sample_rate": 48000,
      "bit_depth": 24
    },
    "streaming": {
      "format": "aac",
      "url": "https://cdn/empire-way-v4.m4a",
      "bitrate": 256000
    },
    "waveform": {
      "url": "https://cdn/empire-way-v4-waveform.svg",
      "peaks": [0.2, 0.4, 0.6, ...]
    }
  },
  "metadata": {
    "bpm": 92,
    "key": "E minor",
    "loudness_lufs": -14.2,
    "peak_db": -5.8,
    "detected_key_confidence": 0.87
  },
  "notes": "Changed bridge to half-time feel, added brass section",
  "message_count": 2,
  "parent_version_id": "uuid-of-v3"
}
```

### Message
```json
{
  "id": "uuid",
  "track_id": "uuid",
  "version_id": "uuid",
  "sender_id": "uuid",
  "created_at": "2026-02-03T15:00:00Z",
  "updated_at": "2026-02-03T15:00:00Z",
  "content": "Love it! Vocals at 2:15 need to be louder",
  "content_type": "text",
  "timestamp_reference": 135,
  "attachments": [],
  "mentions": [],
  "reactions": [
    {"user_id": "uuid", "emoji": "👍"}
  ]
}
```

### Session (Daily Batch)
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "date": "2026-02-03",
  "participants": ["uuid1", "uuid2"],
  "tracks_worked_on": ["uuid-empire-way", "uuid-track-02"],
  "versions_created": 2,
  "messages_sent": 8,
  "git_commits": [
    {
      "commit_hash": "abc123",
      "branch": "songs/empire-way/main",
      "message": "Session 2026-02-03: Empire Way - bridge revision + conversation"
    }
  ],
  "summary": "Worked on bridge revision for Empire Way, discussed vocal levels",
  "created_at": "2026-02-03T23:59:00Z"
}
```

---

## User Flows

### Flow 1: Producer Uploads New Demo

1. Producer opens Trackback app
2. Navigates to "Empire Way" track
3. Clicks "Upload New Demo" or drags WAV file into window
4. Upload modal appears
5. Producer enters version name: "bridge_revision"
6. Producer adds notes: "Changed bridge to half-time feel, added brass section"
7. Clicks "Upload & Share"
8. App shows progress bar (upload + processing)
9. Server converts WAV → FLAC, generates streaming formats
10. Server extracts metadata (BPM, key, waveform)
11. Demo appears in track timeline with player
12. Artist gets real-time notification
13. Artist clicks notification → opens to new demo
14. Artist listens, clicks timestamp 2:15, adds comment: "Vocals too quiet here"
15. Comment appears with timestamp marker on waveform
16. Producer sees comment in real-time
17. Producer replies: "Will fix in v5"
18. End of day: User clicks "Save Session"
19. App batches all activity into Git commit
20. Commits to `songs/empire-way/v4-bridge-revision` branch
21. Pushes to remote repo
22. Success notification

### Flow 2: Artist Reviews Multiple Demos

1. Artist opens Trackback app
2. Dashboard shows: "3 new demos across 2 tracks"
3. Artist clicks "Empire Way" card
4. Sees Demo 4 at top of timeline
5. Clicks play on Demo 4 waveform
6. While listening, scrolls down to Demo 3
7. Clicks "Compare" button
8. Side-by-side view opens
9. Sees waveform diff highlighting changed regions
10. Synced playback (both versions play at same time offset)
11. Artist hears the difference in bridge section
12. Closes comparison
13. Adds comment on Demo 4: "This is the one! Let's master it."
14. Producer sees comment, reacts with 👍
15. Artist clicks "Create Production Notes"
16. Modal shows options, artist selects "Standard template"
17. Preview shows generated markdown from conversation history
18. Artist edits, adds manual notes about recording session
19. Clicks "Generate & Save"
20. Production notes saved to `tracks/empire-way/notes/production-notes.md`
21. Git commit created
22. Artist clicks "Move to Mastering"
23. Track status changes from "demo" to "mixing"

### Flow 3: Collaborative Session (Real-time)

**Artist's View:**
1. Artist opens track, sees "Producer is online 🟢"
2. Producer uploads new demo
3. Artist sees real-time notification: "Producer uploaded Demo 5"
4. New demo card slides into timeline (no refresh needed)
5. Artist immediately starts listening
6. While artist is listening, producer types: "Check the vocals at 1:45"
7. Artist sees typing indicator: "Producer is typing..."
8. Message appears in real-time
9. Artist clicks timestamp, jumps to 1:45
10. Artist adds comment at that exact timestamp
11. Producer sees comment appear immediately

**Producer's View:**
1. Producer working in DAW, exports new version
2. Drags file into Trackback (already open)
3. Sees "Artist is online 🟢"
4. Fills in upload notes, clicks share
5. Immediately types message to artist
6. Sees artist's comment appear as they're listening
7. Both collaborate in real-time

---

## Technical Stack Recommendations

### Frontend (Desktop App)
- **Framework:** Electron + React
- **State Management:** Redux or Zustand
- **UI Library:** Tailwind CSS + Headless UI or shadcn/ui
- **Audio Player:** Howler.js or Web Audio API
- **Waveform:** wavesurfer.js or custom canvas
- **Real-time:** Socket.io client
- **Git Integration:** isomorphic-git (in renderer process)

### Frontend (Mobile - Future)
- **Framework:** React Native
- **Same libraries where compatible**

### Backend
- **Runtime:** Node.js (Express or Fastify)
- **Real-time:** Socket.io server
- **Database:** PostgreSQL (main data)
- **Cache:** Redis (sessions, presence)
- **Queue:** Bull or BullMQ (async jobs)
- **File Storage:** S3-compatible (AWS S3, Cloudflare R2, Backblaze B2)
- **Git Operations:** nodegit or simple-git

### Audio Processing
- **Format Conversion:** ffmpeg (via fluent-ffmpeg)
- **Metadata Extraction:** music-metadata
- **Waveform Generation:** audiowaveform or custom ffmpeg
- **Future Analysis:** essentia.js or meyda.js (BPM/key detection)

### Deployment
- **Desktop App:** Electron Builder (cross-platform builds)
- **Backend:** Docker + Kubernetes or simpler VPS
- **Database:** Managed PostgreSQL (Heroku, Railway, Render)
- **File Storage:** Cloudflare R2 (cheap, fast)
- **Git Hosting:** GitHub/GitLab (user's account)

---

## Development Phases

### Phase 1: Core MVP (2-3 months)
**Goal:** Replace iMessage + Apple Notes workflow

**Sprint 1: Foundation (2 weeks)**
- Project/track data models
- Basic Electron app shell
- User authentication
- Database schema
- Git repo creation

**Sprint 2: Audio Upload (2 weeks)**
- File upload (drag/drop, file picker)
- WAV → FLAC conversion
- Basic audio player
- Waveform generation
- Version storage

**Sprint 3: Conversation (2 weeks)**
- Message system (text only)
- Real-time updates (Socket.io)
- Presence indicators
- Track timeline UI
- Message persistence

**Sprint 4: Git Integration (2 weeks)**
- Branch management (per song)
- Daily batch commits
- Session tracking
- Push to remote repo
- Basic conflict resolution

**Sprint 5: Production Notes (2 weeks)**
- Manual note creation
- Markdown export
- Conversation export
- Template system
- File organization

**Sprint 6: Polish & Testing (2 weeks)**
- Bug fixes
- Performance optimization
- Desktop app packaging
- Documentation
- Beta testing with real users

### Phase 2: Enhancement (2-3 months)
- Mobile app (iOS/Android)
- Timestamp comments
- Side-by-side comparison
- Waveform diff
- Advanced metadata extraction
- Better notification system

### Phase 3: AI & Automation (1-2 months)
- Conversation summarization
- Auto-generate production notes
- Smart version naming
- BPM/key detection
- Mixing suggestions

### Phase 4: Public Sharing (1-2 months)
- Privacy controls per track
- Public website generation
- Embeddable players
- Social features
- Release management

---

## Success Metrics

### User Engagement
- Daily active users
- Demos uploaded per week
- Messages sent per track
- Sessions saved per day
- Time spent in app

### Product Health
- Audio upload success rate
- Conversion success rate (WAV → FLAC)
- Git sync success rate
- Real-time message delivery latency
- Crash rate

### User Satisfaction
- NPS score
- "Would you recommend?" survey
- Feature request volume
- Bug report volume
- Support ticket volume

### Business Metrics (Future)
- User retention (30-day, 90-day)
- Conversion to paid tier
- Storage usage per user
- Bandwidth usage
- Server costs per user

---

## Open Questions & Decisions Needed

### Before Starting Development:

1. **Authentication:**
   - Email/password only?
   - OAuth (Google, GitHub)?
   - Magic links (passwordless)?

2. **Git Hosting:**
   - Force GitHub only (easier)?
   - Support GitHub + GitLab + Gitea?
   - Self-hosted Git option?

3. **User's Git Account:**
   - User provides their own GitHub account/token?
   - App creates repos on their behalf?
   - App uses its own service account (user never sees Git)?

4. **Pricing Model (Future):**
   - Free tier with limits (storage, tracks, collaborators)?
   - Paid tier for unlimited?
   - Per-project pricing?
   - Open source + self-hosted option?

5. **Audio Quality Defaults:**
   - Always convert to FLAC (50% compression)?
   - Let user choose (original WAV, FLAC, or ALAC)?
   - Automatic based on source quality?

6. **File Size Limits:**
   - Max file size per upload (500MB? 1GB? 2GB?)
   - Max total storage per project (10GB? 50GB? 100GB?)
   - What happens when limit reached?

7. **Export Options:**
   - Can users export entire Git repo?
   - Export as ZIP with all audio?
   - Export specific version only?

8. **Offline Mode:**
   - Should desktop app work offline?
   - Sync when back online?
   - Or require internet always?

### Next Steps:

1. **Decision:** Choose answers to open questions above
2. **Setup:** Create initial repo structure
3. **Prototype:** Build basic Electron app with file upload
4. **Design:** Create detailed UI mockups in Figma
5. **Develop:** Start Sprint 1 foundation work

---

## Appendix: Example Git Commit Messages

**Daily session commit:**
```
Session 2026-02-03: Empire Way - bridge revision + conversation

- Added Demo 4 (bridge_revision)
- 8 messages exchanged
- Technical feedback on vocal levels
- Decision to move to mastering phase

Participants: Producer, Artist
```

**Production notes commit:**
```
Production Notes: Empire Way - February 2026

- Documented recording sessions 1-3
- Added mix chain details
- Listed reference tracks
- Captured final thoughts

Generated from conversation history
```

**Mastering commit (merge to release branch):**
```
Master: Empire Way v1.0 - Digital Release

- Final mix approved
- Mastered by Dume
- Peak: -5.8 dB, LUFS: -14.2
- Ready for streaming platforms

Merged songs/empire-way/v4-bridge-revision → digital-release
```

---

**Document Version:** 1.0  
**Last Updated:** February 3, 2026  
**Status:** Draft for Review
