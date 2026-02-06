# Phase 6: User Setup Required

**Generated:** 2026-02-06
**Phase:** 06-hosting-media-storage
**Status:** Incomplete

Complete these items for the Backblaze B2 integration to function. Claude automated everything possible; these items require human access to external dashboards/accounts.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `B2_KEY_ID` | Backblaze B2 dashboard -> App Keys | `.env.local` |
| [ ] | `B2_APPLICATION_KEY` | Backblaze B2 dashboard -> App Keys | `.env.local` |
| [ ] | `B2_BUCKET_ID` | Backblaze B2 dashboard -> Buckets | `.env.local` |
| [ ] | `B2_BUCKET_NAME` | Backblaze B2 dashboard -> Buckets | `.env.local` |

## Verification

After completing setup, verify with:

```bash
# Check env vars are set
grep B2 .env.local
```

Expected results:
- B2 environment variables are present in `.env.local`

---

**Once all items complete:** Mark status as "Complete" at top of file.
