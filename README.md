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
- Indexable localized name profiles and official/thematic name lists with canonical and hreflang metadata
- JSON-LD, localized Open Graph images, `sitemap.xml`, and `robots.txt`
- Consent-gated PostHog funnel analytics and PostgreSQL viral-loop events
- Optional, consent-gated ad slots and configurable sponsored product links
- Private round-by-round histories, final rankings, and shared high-ranking names
- In-app invite-result notifications plus optional standards-based Web Push
- Balanced first-round byes that guarantee a two-name final for every list size
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
| Portugal | 2025 + 2016 | Owner-approved composite: [IRN provisional 2025 top 10](https://rr.pt/especial/pais/2025/12/22/veja-a-lista-dos-nomes-de-bebes-mais-escolhidos-em-portugal-em-2025/452688/) first, then the [archived IRN-derived 2016 ranking](https://cdn.cmjornal.pt/files/2017-01/05-01-2017_16_23_45_bebes_nomes_1.pdf), deduplicated case/accent-insensitively |
| Italy | 2025 | [ISTAT, Conta nomi](https://www.istat.it/dati/calcolatori/contanomi/) |

The tracked seed file is `data/name-datasets.json`; `scripts/seed-names.mjs` idempotently upserts it at container startup.
Curated etymologies are stored separately in `data/name-meanings.json`. Every
meaning has a source URL; names without reliable source material deliberately
omit the meaning and origin sections.

## Public discovery routes

All discovery pages are server-rendered and localized under `/{locale}`:

- Name profiles: `/fr/prenom/leo`, `/en-GB/name/leo`,
  `/es/nombre/leo`, `/pt/nome/leo`, and `/it/nome/leo`
- Country ranking examples: `/fr/top-prenoms-2025-france` and
  `/en-US/top-baby-names-2025-usa`
- Derived lists for short and unisex names, girl/boy rankings, and first letters
- Machine discovery: `/sitemap.xml` and `/robots.txt`

Supported locale prefixes are `fr`, `en-GB`, `en-US`, `es`, `pt`, and `it`.

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

## Optional analytics, ads, and affiliate links

All optional measurement and advertising stays off until the visitor accepts
the shared cookie-consent prompt. PostHog is completely disabled when
`NEXT_PUBLIC_POSTHOG_KEY` is empty. It defaults to the EU endpoint and identifies
signed-in people only by the internal numeric user ID; no email is sent.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | Enables PostHog after consent |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host; defaults to `https://eu.i.posthog.com` |
| `ADS_ENABLED` | Enables the small, dismissible duel ad placeholders; defaults to `false` |
| `ADSENSE_CLIENT_ID` | Optional AdSense client ID loaded after consent |
| `ADSENSE_SLOT_BETWEEN_ROUNDS` | Optional provider slot ID between rounds |
| `ADSENSE_SLOT_BEFORE_RESULT` | Optional provider slot ID before result actions |
| `NEXT_PUBLIC_AFFILIATE_BIRTH_ANNOUNCEMENTS_URL` | Birth-announcement partner URL |
| `NEXT_PUBLIC_AFFILIATE_JEWELRY_URL` | Jewelry partner URL |
| `NEXT_PUBLIC_AFFILIATE_BODYSUITS_URL` | Bodysuit partner URL |
| `NEXT_PUBLIC_AFFILIATE_MUGS_URL` | Mug partner URL |
| `NEXT_PUBLIC_AFFILIATE_POSTERS_URL` | Poster partner URL |

Affiliate URLs may include `{name}`, which is replaced with the URL-encoded
winning or viewed name. Empty affiliate variables show non-clickable elements
marked `Placeholder`; configured links use `rel="sponsored"`.

PostHog captures App Router pageviews plus `duel_started`, `round_completed`,
`duel_finished`, `result_shared`, `invite_sent`, `invite_accepted`,
`invitee_finished`, `signup`, `name_page_viewed`, `affiliate_clicked`, and
`ad_impression`. The `product_events` PostgreSQL table also records invite,
share, shared-result view, and conversion events for first-party loop analysis.

## Coolify

The production Compose stack builds the app, runs migrations before startup, exposes the application only to Coolify's network, and persists PostgreSQL in a named volume. See [DEPLOY.md](DEPLOY.md) for the exact environment variables, Google Cloud setup, callback URL, backups, and deployment procedure.

Web Push is optional. When VAPID variables are configured, users can opt in after
sharing an invitation. On iOS/iPadOS 16.4+, push requires installing LeBabyName
to the Home Screen.
