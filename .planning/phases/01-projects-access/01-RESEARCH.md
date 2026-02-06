# Phase 1: Projects & Access - Research

**Researched:** 2026-02-05
**Domain:** Web-first project/track management, access control, and invitations
**Confidence:** MEDIUM

## Summary

This research focuses on implementing Phase 1: projects, tracks, dashboard grouping, track status, and collaborator invites with owner-only destructive permissions. The standard approach for a web-first v1 is a Next.js App Router app with a PostgreSQL database and Prisma ORM for schema enforcement, plus Auth.js for sessions and a transactional email provider for invite delivery. The primary technical risks are access-control correctness, uniqueness enforcement for track names within a project, and ensuring data freshness for last-updated ordering.

The recommended implementation uses explicit membership and invitation tables, a track-status enum with a default of Demo, and server-side handlers that enforce ownership rules. Route Handlers (App Router) provide straightforward API endpoints, Prisma enforces unique constraints and enums at the schema level, and Auth.js provides session access. Resend is a standard email SDK for invite delivery.

**Primary recommendation:** Use Next.js App Router + Prisma/PostgreSQL with explicit membership and invite tables, enforce track-name uniqueness in the database, and gate destructive actions by owner role in server handlers.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Web app framework (App Router + Route Handlers) | App Router + route handlers are the current standard for server APIs and SSR in Next.js. |
| React | 19.2.4 | UI framework | Standard UI library for Next.js and modern web apps. |
| PostgreSQL | 18.1 | Relational database | Strong relational modeling, constraints, and indexing for access control and uniqueness. |
| Prisma ORM | 7.3.0 | Schema + migrations + typed DB access | Enforces schema constraints, unique indexes, and type-safe access. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Auth.js (next-auth) | 5.0.0-beta+ | Authentication + session access | Required for user identity and access control checks. |
| Resend | 6.9.1 | Transactional email for invites | Send invite emails for collaborators. |
| Zod | 4.3.6 | Input validation | Validate request payloads before DB writes. |
| Tailwind CSS | 4.1.18 | UI styling | Standard utility-first styling for fast UI iteration. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma | Drizzle ORM | Drizzle offers lightweight SQL-first APIs; Prisma has broader schema tooling and type generation. |
| Auth.js | Third-party auth (Clerk/Supabase Auth) | Faster setup but adds vendor dependency and differing session model. |
| Resend | SMTP/Nodemailer | SMTP is more generic but slower to set up and less observable. |

**Installation:**
```bash
npm install next react react-dom @prisma/client prisma next-auth resend zod tailwindcss
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                # Next.js App Router pages and route handlers
├── app/api/            # Route handlers for project/track/invite actions
├── lib/                # auth, permissions, validators
├── db/                 # Prisma client + schema helpers
└── components/         # dashboard and track cards
```

### Pattern 1: Membership-First Access Control
**What:** Represent project membership explicitly and check role on every write action.
**When to use:** All mutations, especially track delete/version delete (owner-only).
**Example:**
```ts
// Source: https://authjs.dev/getting-started/session-management/get-session
import { auth } from "../auth"

export async function requireSession() {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  return session
}
```

### Pattern 2: Database-Enforced Uniqueness
**What:** Enforce track name uniqueness per project at the database level.
**When to use:** Track creation and rename operations.
**Example:**
```prisma
// Source: https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-a-unique-field
model Track {
  id        String   @id @default(uuid())
  projectId String
  name      String

  @@unique([projectId, name])
}
```

### Pattern 3: Route Handlers for Mutations
**What:** Use Next.js Route Handlers to implement create/update actions.
**When to use:** Project/track creation, status updates, invite creation.
**Example:**
```ts
// Source: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(request: Request) {
  const res = await request.json()
  return Response.json({ res })
}
```

### Anti-Patterns to Avoid
- **Client-only access checks:** Always re-check permissions on the server to prevent privilege escalation.
- **App-level uniqueness checks only:** Relying on pre-checks without DB constraints allows race-condition duplicates.
- **Status stored as free text:** Use enums or validated lists so status grouping works reliably.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth/session management | Custom JWT/session store | Auth.js | Correct session handling and provider support. |
| Database migrations | Manual SQL drift | Prisma Migrate | Consistent schema changes with history. |
| Transactional email | Raw SMTP integration | Resend SDK | Faster setup and reliable delivery APIs. |

**Key insight:** Phase 1 depends on data integrity and access control; standard libraries reduce mistakes and security gaps.

## Common Pitfalls

### Pitfall 1: Track name uniqueness collisions
**What goes wrong:** Two users create the same track name in parallel, creating duplicates.
**Why it happens:** App-level uniqueness checks without DB constraints.
**How to avoid:** Add a composite unique index on `(projectId, name)` and handle unique constraint errors.
**Warning signs:** Duplicate track cards or ambiguous URLs.

### Pitfall 2: Owner-only deletes not enforced
**What goes wrong:** Collaborators can delete tracks or versions via API calls.
**Why it happens:** UI-only permission checks.
**How to avoid:** Enforce role checks in server handlers and verify owner role from membership table.
**Warning signs:** Delete requests succeed for non-owners in logs.

### Pitfall 3: Incorrect dashboard ordering
**What goes wrong:** Tracks appear out of order or in wrong group.
**Why it happens:** `updatedAt` not updated on status changes or track edits.
**How to avoid:** Update `updatedAt` for any meaningful change and order by it in queries.
**Warning signs:** Newly edited tracks appear below older ones.

### Pitfall 4: Invite acceptance mismatches
**What goes wrong:** Invite is accepted by a different user than intended.
**Why it happens:** Token validation not bound to email/username.
**How to avoid:** Store invite target (email/username) and validate on accept.
**Warning signs:** Users see projects they were not invited to.

## Code Examples

Verified patterns from official sources:

### Next.js Route Handler (POST)
```ts
// Source: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(request: Request) {
  const res = await request.json()
  return Response.json({ res })
}
```

### Prisma Unique Constraint
```prisma
// Source: https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-a-unique-field
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  name  String?
}
```

### Auth.js Session Access (Server)
```ts
// Source: https://authjs.dev/getting-started/session-management/get-session
import { auth } from "../auth"

export default async function UserAvatar() {
  const session = await auth()
  if (!session?.user) return null
  return <img src={session.user.image} alt="User Avatar" />
}
```

### Resend Email Send
```ts
// Source: https://resend.com/docs/send-with-nodejs
import { Resend } from "resend"

const resend = new Resend("re_xxxxxxxxx")

const { data, error } = await resend.emails.send({
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "Hello World",
  html: "<strong>It works!</strong>",
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages router + API routes | App Router + Route Handlers | Next.js 13+ | Unified server/client routing and simpler request handling. |
| Ad-hoc auth | Auth.js (next-auth v5+) | Auth.js docs (2025) | Consistent session access with adapters/providers. |

**Deprecated/outdated:**
- API Routes (Pages Router) for new apps: App Router + Route Handlers are the current standard in Next.js docs.

## Open Questions

1. **Auth method for v1**
   - What we know: Auth.js supports OAuth, magic links, credentials, and adapters.
   - What's unclear: Which login method is in scope for v1.
   - Recommendation: Choose magic link or OAuth for fastest delivery; update plan accordingly.

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers - Route Handlers API and examples
- https://www.prisma.io/docs/orm/prisma-schema/data-model/models - Schema models and unique constraints
- https://authjs.dev/getting-started - Auth.js docs (notes on next-auth@5.0.0-beta+)
- https://resend.com/docs/send-with-nodejs - Resend Node.js SDK usage
- https://www.postgresql.org/docs/current/ - PostgreSQL 18.1 documentation (current)

### Secondary (MEDIUM confidence)
- https://github.com/vercel/next.js/releases/latest - Next.js 16.1.6 release
- https://github.com/facebook/react/releases/latest - React 19.2.4 release
- https://github.com/prisma/prisma/releases/latest - Prisma 7.3.0 release
- https://github.com/tailwindlabs/tailwindcss/releases/latest - Tailwind CSS 4.1.18 release
- https://github.com/colinhacks/zod/releases/latest - Zod 4.3.6 release
- https://github.com/resend/resend-node/releases/latest - Resend 6.9.1 release

### Tertiary (LOW confidence)
- https://github.com/nextauthjs/next-auth/releases/latest - Auth.js package versioning is fragmented; verify exact package version to pin.

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Versions verified via official releases; auth package versioning needs confirmation.
- Architecture: HIGH - Patterns validated by Next.js/Prisma/Auth.js docs.
- Pitfalls: MEDIUM - Derived from standard multi-tenant access-control issues.

**Research date:** 2026-02-05
**Valid until:** 2026-03-07
