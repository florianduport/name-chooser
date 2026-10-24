# Production deployment with Coolify

The app runs as one hardened Next.js container. Its JSON datastore lives in a named Docker volume, so no separate database service is required. `docker-compose.yml` is designed for Coolify's Docker Compose build pack.

## Requirements

- A Coolify destination with Docker Engine 23+ and Docker Compose v2
- A wildcard domain configured in Coolify, or a domain you assign to the `app` service

## Start the stack

1. Create a new Coolify resource from this Git repository.
2. Select the **Docker Compose** build pack and `docker-compose.yml`.
3. Deploy. Coolify reads `SERVICE_FQDN_APP_3000`, creates a domain when a wildcard domain is available, and routes it to port 3000 in the `app` container.
4. In Coolify, confirm the `app` service is healthy and open the generated domain.

The Compose file intentionally has no `ports:` binding. Port 3000 is exposed only to the Compose/Coolify network; Coolify's proxy is the public entrypoint.

## Configuration

| Variable | Managed by | Purpose |
| --- | --- | --- |
| `SERVICE_FQDN_APP_3000` | Coolify | Generates the public hostname and routes it to internal port 3000 |
| `DATA_FILE_PATH` | Compose | Persistent datastore path, `/app/data/names.json` |
| `HOSTNAME` / `PORT` | Compose | Makes Next.js listen on `0.0.0.0:3000` |
| `NODE_ENV` | Compose | Enables the production runtime |

No secret or user-supplied environment variable is required. Assign a custom domain to the `app` service in Coolify if you do not want the generated hostname.

## Persistent data and backups

The named `namechooser-data` volume contains `names.json`. Coolify redeployments and container recreation preserve it. Do not remove this storage from Coolify or run `docker compose down --volumes` unless you intentionally want to erase all saved names.

Create a backup without exposing the datastore:

```bash
docker compose exec -T app cat /app/data/names.json > names-backup.json
```

Restore during a maintenance window:

```bash
docker compose stop app
docker compose run --rm -T --entrypoint sh app -c 'cat > /app/data/names.json' < names-backup.json
docker compose start app
```

## Reverse proxy and access control

Coolify's proxy terminates TLS and forwards the generated/custom domain to the exposed container port. Do not add a host `ports:` mapping; it bypasses this routing and can expose the service directly.

The app has no account system because it is intended for Cindy and Florian. Enable access control at the Coolify proxy or restrict the domain to a private network before public exposure. The management and mutation API routes are otherwise reachable by anyone who can access the app.

## Upgrade

Use **Redeploy** in Coolify after merging or updating the tracked branch. Coolify rebuilds the image and reuses the named volume.

The container health check uses `/api/health`. Review the `app` service logs in Coolify if its status is not `healthy`.

For a non-Coolify smoke test on a Linux server:

```bash
docker compose up -d --build
docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(async r => { console.log(await r.text()); process.exit(r.ok ? 0 : 1) })"
```
