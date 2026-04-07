# Backend Dockerfile — multi-stage build for NestJS API
# WORKDIR /workspace preserves monorepo structure for pnpm workspace resolution

# ---------- base ----------
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apk add --no-cache curl openssl

WORKDIR /workspace

# Copy workspace root files first (layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy all referenced workspace member package.json files
# pnpm install --frozen-lockfile fails if any workspace member is missing
COPY apps/backend/package.json apps/backend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend/ apps/backend/
COPY packages/shared/ packages/shared/

# Generate Prisma client
RUN pnpm --filter backend exec prisma generate

EXPOSE 3001

# ---------- development ----------
FROM base AS development

COPY docker/backend-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
