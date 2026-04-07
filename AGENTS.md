# AGENTS.md

APHA Brainstem Training Schedule (BST) — a modernised web app for the Animal and Plant Health Agency to manage training records for TSE/BSE surveillance. POC stage, not production-ready.

## Commands

```bash
# Start all services (recommended)
pnpm run dev

# Rebuild and start
docker compose up --build

# Stop (keeps data) / stop and wipe
pnpm run stop
pnpm run clean
```

All test and lint commands run inside Docker containers:

```bash
# Backend
docker compose exec backend pnpm test          # unit tests
docker compose exec backend pnpm test:e2e      # e2e tests
docker compose exec backend pnpm lint

# Frontend
docker compose exec frontend pnpm test         # unit tests
docker compose exec frontend pnpm exec playwright test  # acceptance tests
docker compose exec frontend pnpm type-check
```

Database:

```bash
pnpm run prisma:migrate       # run migrations
pnpm run prisma:seed          # seed data
pnpm run prisma:studio        # visual editor at localhost:5555
```

## Architecture rules

- Monorepo: `apps/frontend`, `apps/backend`, `packages/shared`
- Backend modules live in `apps/backend/src/modules/` — each module co-locates its controller, service, and DTOs
- Prisma schema: `apps/backend/prisma/schema.prisma`
- Shared TypeScript types go in `packages/shared` to keep the API boundary type-safe
- Frontend state: TanStack Query for server state, Zustand for client state — no Redux/Context
- UI: Mantine components themed to GOV.UK Design System principles
- Auth: static credential + JWT (POC only) — see @rules/architecture.md for details

## Detailed rules

- rules/typescript-rules.md
- rules/react-rules.md
- rules/nestjs.md
- rules/vite.md
- rules/domain-driven-design.md
- rules/clean-code.md
- rules/acceptance-testing.md
- rules/architecture.md
- rules/docker-setup.md
- rules/gds-design-system.md

## Ports

| Service    | Port |
|------------|------|
| Frontend   | 3000 |
| Backend    | 3001 |
| PostgreSQL | 5432 |

## Git workflow

- Use the `/commit` skill for all commits — the user prefers fine-grained, incremental commits over large batched ones
- If the `/commit` skill is unavailable, fall back to fine-grained conventional commit messages (e.g. `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)

## Gotchas

- All commands run inside Docker — don't run `pnpm test` on the host
- Postgres must pass its health check before the backend starts (handled by `depends_on`)
- Hot reload sometimes stalls — `docker compose up --build` to fix
- Hot reload not working in Docker → add `usePolling: true` to Vite `server.watch` config
- Migrations auto-apply on container start via `prisma migrate deploy`
- `docker compose down -v` deletes all data — use `pnpm run stop` to preserve it
- Port already in use → `lsof -i :<port>` to identify the process
- Database migrations failed → `prisma migrate reset` or `prisma migrate resolve --applied <name>`
- Environment variables not loaded → restart containers after `.env` changes
- Permission denied on node_modules → remove host `node_modules` dirs, rebuild containers
