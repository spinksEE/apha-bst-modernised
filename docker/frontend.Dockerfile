# Frontend Dockerfile — multi-stage build for Vite dev server
# WORKDIR /workspace preserves monorepo structure for pnpm workspace resolution

# ---------- base ----------
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apk add --no-cache curl chromium

ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN if [ ! -f /usr/bin/chromium-browser ] && [ -f /usr/bin/chromium ]; then \
      ln -s /usr/bin/chromium /usr/bin/chromium-browser; \
    elif [ ! -f /usr/bin/chromium ] && [ -f /usr/bin/chromium-browser ]; then \
      ln -s /usr/bin/chromium-browser /usr/bin/chromium; \
    fi

WORKDIR /workspace

# Copy workspace root files first (layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy all referenced workspace member package.json files
# pnpm install --frozen-lockfile fails if any workspace member is missing
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/frontend/ apps/frontend/
RUN touch /workspace/apps/frontend/src/hooks/useSessionBootstrap.ts
COPY packages/shared/ packages/shared/

EXPOSE 3000

# ---------- development ----------
FROM base AS development

CMD ["pnpm", "--filter", "frontend", "run", "dev", "--", "--host"]
