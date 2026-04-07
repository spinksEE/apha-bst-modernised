# APHA Brainstem Training Schedule (BST)

A modernised web application for the Animal and Plant Health Agency to manage training records for personnel performing brain stem sample extraction, supporting TSE/BSE surveillance programmes.

> **Status:** Proof of concept — not production-ready.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9.15+ | `npm install -g pnpm` |
| Docker | 24+ | https://docs.docker.com/get-docker |
| Docker Compose | 2.x+ | Included with Docker Desktop |

## Getting started

```bash
# Clone and install
git clone <repo-url> && cd apha-bst-modernised
pnpm install

# Copy environment config
cp .env.example .env

# Start all services (frontend, backend, postgres)
pnpm run dev
```

Once running:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Prisma Studio | http://localhost:5555 (via `pnpm run prisma:studio`) |

## Running tests

```bash
# Backend
docker compose exec backend pnpm test          # unit tests
docker compose exec backend pnpm test:e2e      # e2e tests

# Frontend
docker compose exec frontend pnpm test         # unit tests
docker compose exec frontend pnpm exec playwright test  # acceptance tests
```

## Stopping

```bash
pnpm run stop    # stop containers, keep data
pnpm run clean   # stop containers and wipe volumes
```
