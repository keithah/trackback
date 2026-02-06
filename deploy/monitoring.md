# Trackback Monitoring & Backup Checklist

Use this checklist to keep production operations predictable.

## Uptime & App Health

- [ ] Verify the app responds over HTTPS at the public `NEXTAUTH_URL`.
- [ ] Check the app container is running and healthy (`docker compose ps`).
- [ ] Review recent application logs for errors or spikes (`docker compose logs --since 1h app`).

## Database Health & Backups

- [ ] Confirm the database container is running (`docker compose ps`).
- [ ] Ensure disk usage has headroom for Postgres data and WAL files.
- [ ] Verify scheduled backups are succeeding (pg_dump or provider snapshots).
- [ ] Test a restore periodically to confirm backup integrity.

## Log Rotation

- [ ] Confirm Docker log size is controlled (log driver or external rotation).
- [ ] Trim or rotate old logs if they exceed expected limits.

## Backblaze B2 Storage

- [ ] Check bucket usage (size, object count) in the B2 dashboard.
- [ ] Confirm new uploads appear and are retrievable by URL.
- [ ] Review B2 account limits and adjust alerts/quotas as needed.

## Routine Cadence

- [ ] Daily: Uptime + error log spot check.
- [ ] Weekly: Backup success + storage usage review.
- [ ] Monthly: Restore test + log retention review.
