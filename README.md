# Prénom

A private, multi-user baby-name tournament. Sign in with Google, start from the official French 2025 rankings or enter a shortlist, then choose between two or three names at a time until one favorite remains.

## Features

- Google sign-in with private per-user data
- Official 2025 French default dataset: INSEE ranks 1–50 by sex (100 names total)
- Custom name lists with persistent additions and removals
- Persisted tournament votes, rollback, winners, and private result history
- Shareable Story and square result images with native mobile sharing and social fallbacks
- Tokenized invitations that let another signed-in user take the same tournament and compare results
- Compact mobile layouts with large tap targets
- PostgreSQL persistence with automatic startup migrations
- Production health endpoint at `/api/health`

## Official name data

The default dataset comes directly from the [INSEE national first-name file](https://www.insee.fr/fr/statistiques/8595130), released July 16, 2026 and covering births registered in France in 2025. The app uses the official national `rang` values 1–50 for each sex. Counts in the source are rounded by INSEE; ranking is calculated from unrounded values.

## Local development

Requires Node.js 22+, Docker, and a Google OAuth 2.0 Web application.

```bash
cp .env.example .env
# Fill GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and AUTH_SECRET.
docker compose up -d db
npm ci
node scripts/migrate.mjs
npm run dev
```

Open <http://localhost:3000>. For local OAuth, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI and change `AUTH_URL` accordingly.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Coolify

The production Compose stack builds the app, runs migrations before startup, exposes the application only to Coolify's network, and persists PostgreSQL in a named volume. See [DEPLOY.md](DEPLOY.md) for the exact environment variables, Google Cloud setup, callback URL, backups, and deployment procedure.
