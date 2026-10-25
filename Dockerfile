# syntax=docker/dockerfile:1

FROM node:24.16.0-alpine3.22 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc,required=false \
    --mount=type=cache,target=/root/.npm \
    npm ci

FROM node:24.16.0-alpine3.22 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies --link /app/node_modules ./node_modules
COPY --link . .
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

FROM node:24.16.0-alpine3.22 AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    DATA_FILE_PATH=/app/data/names.json

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

COPY --from=build --link --chown=1001:1001 /app/public ./public
COPY --from=build --link --chown=1001:1001 /app/.next/standalone ./
COPY --from=build --link --chown=1001:1001 /app/.next/static ./.next/static
COPY --link --chown=1001:1001 scripts/migrate.mjs ./scripts/migrate.mjs
COPY --link --chown=1001:1001 scripts/seed-names.mjs ./scripts/seed-names.mjs
COPY --link --chown=1001:1001 data/name-datasets.json ./data/name-datasets.json
COPY --link --chown=1001:1001 --chmod=755 scripts/start.sh ./scripts/start.sh

USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
ENTRYPOINT ["./scripts/start.sh"]
