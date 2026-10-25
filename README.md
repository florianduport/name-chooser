# LeBabyName

LeBabyName is a private, multi-user baby-name tournament in six locales. Sign in with Google, start from an official country ranking or enter a shortlist, then choose between two or three names at a time until one favorite remains.

## Features

- Google sign-in with private per-user data
- Browser locale detection plus French, UK/US English, Spanish, Portuguese, and Italian
- Switchable official country datasets with 50 ranked names per sex
- Custom name lists with persistent additions and removals
- Persisted tournament votes, rollback, winners, and private result history
- Shareable Story and square result images with native mobile sharing and social fallbacks
- Tokenized invitations that let another signed-in user take the same tournament and compare results
- Compact mobile layouts with large tap targets
- PostgreSQL persistence with automatic startup migrations
- Production health endpoint at `/api/health`

## Official name data

Each seed stores its country, coverage year, source, URL, and version in PostgreSQL. The app uses ranks 1–50 per sex (100 names per country):

| Country | Coverage | Official source |
| --- | --- | --- |
| France | 2025 | [INSEE, Fichier des prénoms](https://www.insee.fr/fr/statistiques/8595130) |
| England & Wales | 2025 | [ONS, Baby names 2025](https://www.ons.gov.uk/releases/babynamesinenglandandwales2025) |
| United States | 2025 | [SSA, Popular Baby Names](https://www.ssa.gov/oact/babynames/) |
| Spain | 2024 | [INE, nombres de recién nacidos](https://www.ine.es/uc/vPHgh7bV) — latest official year available |
| Portugal | 2016 | [Archived reproduction of IRN civil-registry data](https://cdn.cmjornal.pt/files/2017-01/05-01-2017_16_23_45_bebes_nomes_1.pdf) — not government-hosted and requires owner approval; newer official IRN releases expose only partial rankings |
| Italy | 2025 | [ISTAT, Conta nomi](https://www.istat.it/dati/calcolatori/contanomi/) |

The tracked seed file is `data/name-datasets.json`; `scripts/seed-names.mjs` idempotently upserts it at container startup.

## Local development

Requires Node.js 22+, Docker, and a Google OAuth 2.0 Web application.

```bash
cp .env.example .env
# Fill GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and AUTH_SECRET.
docker compose up -d db
npm ci
node scripts/migrate.mjs
node scripts/seed-names.mjs
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
