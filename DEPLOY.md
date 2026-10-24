# Production deployment

The app runs as one hardened Next.js container. Its JSON datastore lives in a named Docker volume, so no separate database service is required.

## Requirements

- A Linux server with Docker Engine 23+ and Docker Compose v2
- A reverse proxy with TLS for internet-facing deployments

## Start the stack

```bash
git clone <repository-url> namechooser
cd namechooser
cp .env.example .env
# Edit .env if port 3000 is unavailable.
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:3000/api/health
```

By default the app is available only at `127.0.0.1:3000`. Set `APP_PORT` to change the host port. Set `APP_HOST=0.0.0.0` only when the application must be reached directly from another machine and the server firewall is configured accordingly.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_HOST` | `127.0.0.1` | Host interface on which Compose publishes the app |
| `APP_PORT` | `3000` | Published host port |
| `IMAGE_TAG` | `local` | Local image tag used by Compose |

`DATA_FILE_PATH` is set inside Compose to `/app/data/names.json` and normally should not be changed.

## Persistent data and backups

The `namechooser-data` volume contains `names.json`. Container recreation and `docker compose down` preserve it. Do not run `docker compose down --volumes` unless you intentionally want to erase all saved names.

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

## Reverse proxy

Keep `APP_HOST=127.0.0.1` and proxy HTTPS traffic to `http://127.0.0.1:3000`. A minimal Nginx location is:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Terminate TLS at Nginx, Caddy, Traefik, or another trusted proxy. The app has no account system because it is intended for Cindy and Florian; add reverse-proxy authentication or restrict network access before publishing it to the public internet. The management and mutation API routes are otherwise reachable by anyone who can access the app.

## Upgrade

```bash
git pull
docker compose up -d --build
docker compose ps
```

The container health check uses `/api/health`. Review `docker compose logs app` if its status is not `healthy`.
