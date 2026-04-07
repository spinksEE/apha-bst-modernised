#!/bin/sh
set -e

echo "Applying database migrations..."
pnpm --filter backend exec prisma migrate deploy

echo "Seeding database..."
pnpm --filter backend run prisma:seed

echo "Starting application..."
exec pnpm --filter backend run start:dev
