# Trackback Self-Hosted Deployment

Self-host Trackback on a VPS using Docker Compose with Postgres.

## Prerequisites

- Docker and Docker Compose (v2+)
- A domain or public IP for production (for `NEXTAUTH_URL`)

## Environment Variables

Create `deploy/.env` with the required values:

```bash
# App
APP_PORT=3000
NEXTAUTH_URL=https://trackback.your-domain.com
NEXTAUTH_SECRET=replace-with-strong-secret
AUTH_SECRET=optional-fallback-secret
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

# Email (optional, for invite emails)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM=Trackback <no-reply@your-domain.com>

# Database
POSTGRES_DB=trackback
POSTGRES_USER=trackback
POSTGRES_PASSWORD=trackback
POSTGRES_PORT=5432
DATABASE_URL=postgresql://trackback:trackback@db:5432/trackback?schema=public

# Backblaze B2
B2_KEY_ID=your-b2-key-id
B2_APPLICATION_KEY=your-b2-application-key
B2_BUCKET_ID=your-b2-bucket-id
B2_BUCKET_NAME=your-b2-bucket-name
```

Notes:

- `NEXTAUTH_URL` must be the public URL for your deployment.
- `NEXTAUTH_SECRET` should be a long, random string.
- `DATABASE_URL` must match your Postgres credentials and database.

## Build and Run

From the repo root:

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

Run database migrations:

```bash
docker compose -f deploy/docker-compose.yml run --rm app npx prisma migrate deploy
```

The app will be available at `http://localhost:3000` (or `APP_PORT`).

## Updating

```bash
git pull
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml run --rm app npx prisma migrate deploy
```

## Stopping

```bash
docker compose -f deploy/docker-compose.yml down
```
