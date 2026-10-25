#!/bin/sh
set -eu

node scripts/migrate.mjs
node scripts/seed-names.mjs
exec node server.js
