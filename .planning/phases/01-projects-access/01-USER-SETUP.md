# Phase 1: User Setup Required

**Generated:** 2026-02-06
**Phase:** 01-projects-access
**Status:** Incomplete

Complete these items for the integration to function. Claude automated everything possible; these items require human access to external dashboards/accounts.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `RESEND_API_KEY` | Resend Dashboard -> API Keys | `.env.local` |
| [ ] | `RESEND_FROM` | Resend Dashboard -> Domains (verified sender) | `.env.local` |
| [ ] | `GITHUB_CLIENT_ID` | GitHub Developer Settings -> OAuth Apps | `.env.local` |
| [ ] | `GITHUB_CLIENT_SECRET` | GitHub Developer Settings -> OAuth Apps | `.env.local` |

## Dashboard Configuration

- [ ] **Add callback URL**
  - Location: GitHub OAuth App -> Authorization callback URL
  - Set to: `http://localhost:3000/api/auth/callback/github`

## Verification

After completing setup, verify with:

```bash
# Check env vars are set
grep RESEND .env.local
grep GITHUB_ .env.local
```

Expected results:
- Both Resend and GitHub environment variables are present in `.env.local`.
- GitHub OAuth callback URL matches the app route.

---

**Once all items complete:** Mark status as "Complete" at top of file.
