# Notre prénom

A private baby-name chooser for Cindy and Florian. Start with the curated French name list or enter a shortlist, then choose between two or three names at a time until one favorite remains.

## Features

- Curated girl and boy name lists with persistent additions
- Custom tournaments with optional saving of new names
- Fair handling of odd-sized rounds through three-name choices
- Choice history and rollback to any previous duel
- Searchable name management with guarded deletion
- Responsive, keyboard-accessible interface
- Production health endpoint at `/api/health`

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

The local datastore is `data/names.json`. Override it with `DATA_FILE_PATH=/path/to/names.json` when needed.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Docker

```bash
docker compose up -d --build
docker compose exec app node -e "fetch('http://127.0.0.1:3000/api/health').then(async r => { console.log(await r.text()); process.exit(r.ok ? 0 : 1) })"
```

The Compose service exposes port 3000 to the internal network without publishing a host port. See [DEPLOY.md](DEPLOY.md) for Coolify deployment, persistence, backups, health checks, and proxy guidance.
