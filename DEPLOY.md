# LeBabyName Coolify production deployment

The stack contains a standalone Next.js application and PostgreSQL 17. Coolify terminates HTTPS and routes the public domain to the app's internal port 3000. PostgreSQL is private to the Compose network and stores authentication, per-user name lists, votes, tournaments, and results.

## Owner setup checklist

### 1. Configure Google OAuth

In Google Cloud Console:

1. Create or select a project.
2. Configure the OAuth consent screen.
3. Create an **OAuth 2.0 Client ID** with application type **Web application**.
4. Add this authorized JavaScript origin:

   `https://name-chooser.54.36.101.144.sslip.io`

5. Add this exact authorized redirect URI:

   `https://name-chooser.54.36.101.144.sslip.io/api/auth/callback/google`

6. Copy the generated client ID and client secret into Coolify environment variables. Never commit either value.

### 2. Configure Coolify

Create a resource from this repository, choose the **Docker Compose** build pack, and select `docker-compose.yml`. Set:

| Variable | Required value |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Web client secret |
| `AUTH_SECRET` | Random secret generated with `openssl rand -base64 32` |
| `AUTH_URL` | `https://name-chooser.54.36.101.144.sslip.io` |
| `SERVICE_PASSWORD_POSTGRES` | Let Coolify generate this value, or provide a long random password |
| `DATABASE_URL` | Optional override; Compose defaults to the internal PostgreSQL service URL |
| `DATABASE_SSL` | Leave unset for the bundled database; set `true` only for an external database requiring TLS |

The effective default database URL is:

`postgresql://namechooser:<SERVICE_PASSWORD_POSTGRES>@db:5432/namechooser`

`AUTH_URL` is the public origin, not the callback. Auth.js appends `/api/auth/callback/google`.

### 3. Deploy

Deploy from Coolify. The app container:

1. waits for PostgreSQL to pass `pg_isready`;
2. runs the idempotent SQL migration in `scripts/migrate.mjs`;
3. starts the standalone Next.js server;
4. becomes healthy after `/api/health` confirms database connectivity.

`SERVICE_URL_APP_3000` and `SERVICE_FQDN_APP_3000` tell Coolify to route the generated or assigned domain to internal port 3000. There is intentionally no host `ports:` mapping.

## Persistent data

The `postgres-data` named volume contains all application and Auth.js data. Coolify redeployments and container recreation preserve it. Do not remove the storage or run `docker compose down --volumes` unless all users, lists, votes, and results should be permanently erased.

The previous JSON datastore is no longer used. Every Google account receives a private copy of the official INSEE 2025 top 50 names per sex on first use.

## Backup and restore

Create a database backup:

```bash
docker compose exec -T db pg_dump -U namechooser -d namechooser -Fc > namechooser.dump
```

Restore during a maintenance window:

```bash
docker compose stop app
docker compose exec -T db pg_restore -U namechooser -d namechooser --clean --if-exists < namechooser.dump
docker compose start app
```

## Updates and troubleshooting

Use **Redeploy** in Coolify after merging. Migrations are safe to run again and execute on every app startup.

- Check the `db` service health if startup waits.
- Check app logs for migration or OAuth errors.
- Confirm `AUTH_URL` exactly matches the HTTPS origin.
- Confirm the Google redirect URI exactly matches the callback above, including `/api/auth/callback/google`.
- Confirm `/api/health` returns `{"status":"ok","database":"connected"}`.
