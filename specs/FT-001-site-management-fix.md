# FT-001-FIX: Database Schema Migration & Dev Seeding

## Metadata

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Fix ID**         | FT-001-FIX                                     |
| **Relates To**     | FT-001 Site Management                         |
| **Priority**       | Must (blocks all manual QA and Playwright E2E) |
| **Last Updated**   | 2026-04-07                                     |

---

## 1. Problem Statement

The `public.sites` table is never created in the running PostgreSQL instance. The backend Dockerfile runs `prisma generate` (which only produces TypeScript client code) but never applies the schema to the database. There is also no SQL init script mounted into the Postgres container. As a result, every write to the `sites` table fails with `relation "public.sites" does not exist` at runtime.

Additionally, there is no Prisma migration history — the project has been operating with ad-hoc `prisma db push` invocations. This means there is no repeatable, version-controlled path from an empty database to a correctly-structured one.

## 2. Assumptions

- The database is always empty on a fresh `docker compose up`. No pre-existing tables need to be preserved.
- There is no existing Prisma migration history (`prisma/migrations/` does not exist).
- The fix must be non-interactive and fully automated — no manual `exec` into containers.
- The backend unit tests and E2E tests mock Prisma (they are unaffected by this fix).
- The Playwright acceptance tests run on the host against the live Docker stack — they require real data in the DB.

## 3. Scope

### In Scope

- Creating a Prisma migration file that captures the current schema as the initial baseline.
- Modifying the backend container startup to apply pending migrations before the NestJS app starts.
- Adding a small, fast dev seed (10–20 realistic sites) that runs automatically after a fresh schema is applied.
- Preserving the existing 10,000-record performance seed as a separately-invocable script for NFR-001 testing.

### Out of Scope

- Changes to any NestJS source code, DTOs, services, or controllers.
- Changes to the frontend.
- Production migration strategy (CI/CD pipeline).

---

## 4. Implementation

### 4.1 Create the Initial Prisma Migration

Generate a migration file from the current `schema.prisma` state. This creates a versioned, reproducible SQL file under `apps/backend/prisma/migrations/`.

```bash
# Run on the host, not inside Docker
cd apps/backend
pnpm exec prisma migrate dev --name init_site_management
```

This produces `prisma/migrations/<timestamp>_init_site_management/migration.sql` containing the `CREATE TABLE` DDL for both `HealthCheck` and `Site`. The file must be committed to version control.

> **Note:** Running `prisma migrate dev` for the first time will prompt for confirmation if it detects schema drift — accept and proceed. The result is a clean baseline migration.

### 4.2 Replace the `seed` Script with a Dev Seed

The existing `prisma/seed.ts` generates 10,000 records — it is a performance fixture, not a developer ergonomics seed. Replace the script registered under `prisma.seed` in `package.json` with a new small dev seed. Move the 10k script to a separate invocable command.

**New `prisma/seed.ts` — dev seed (~10 realistic sites):**

The seed must:
- Insert a fixed, small set of realistic sites using `upsert` (idempotent — safe to re-run).
- Cover the range of data states needed for manual QA: a standard site, an APHA-internal site, a site with an evolved (bracketed) name, and a site with full address details.
- Complete in under 2 seconds.

Suggested sites (illustrative — implement as `upsert` on `plant_no`):

| plant_no  | name                                    | is_apha_site | notes                          |
| --------- | --------------------------------------- | ------------ | ------------------------------ |
| UK001     | Meadow Valley Abattoir                  | false        | Standard site, full address    |
| UK002     | Northern Meats Co [Old Abattoir Co]     | false        | Evolved name (BR-007 example)  |
| UK003     | Elmwood Processing Ltd                  | false        | Minimal data (no address)      |
| APHA001   | APHA Reference Facility                 | true         | Internal APHA site             |
| UK004     | Riverside Foods                         | false        | Standard site                  |
| UK005     | Green Fields Poultry Ltd                | false        | Full address, fax present      |
| UK006     | Dale Farm Holdings                      | false        | Standard site                  |
| UK007     | Oak Hill Livestock Co                   | false        | Standard site                  |
| UK008     | Spring Brook Meats                      | false        | Standard site                  |
| UK009     | Cedar Park Enterprises                  | false        | Standard site                  |

**Rename the existing 10k script:**

In `apps/backend/package.json`, the existing `"prisma:seed"` script (which runs `ts-node prisma/seed.ts`) must be renamed to `"prisma:seed:perf"`, and the new dev seed script registered as `"prisma:seed"`. The `prisma.seed` key in `package.json` must point to the dev seed.

```json
"scripts": {
  "prisma:seed": "ts-node prisma/seed.ts",
  "prisma:seed:perf": "ts-node prisma/seed-perf.ts"
},
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Rename the existing `prisma/seed.ts` to `prisma/seed-perf.ts`.

### 4.3 Add a Container Entrypoint Script

Replace the hardcoded `CMD` in the backend Dockerfile with a shell entrypoint script that runs migrations and seeding before handing off to the NestJS process.

**New file: `docker/backend-entrypoint.sh`**

```sh
#!/bin/sh
set -e

echo "Applying database migrations..."
pnpm --filter backend exec prisma migrate deploy

echo "Seeding database..."
pnpm --filter backend run prisma:seed

echo "Starting application..."
exec pnpm --filter backend run start:dev
```

The script must:
- Use `set -e` so any failed step aborts the container startup (surfaces errors immediately rather than starting a broken app).
- Use `prisma migrate deploy` (not `prisma migrate dev`) — `deploy` applies pending migration files without interactive prompts and is safe in automated environments.
- Use `exec` for the final command so the NestJS process replaces the shell and receives signals correctly (enables graceful shutdown from `docker compose down`).

**Updated `docker/backend.Dockerfile` development stage:**

```dockerfile
# ---------- development ----------
FROM base AS development

COPY docker/backend-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
```

> **Note:** The entrypoint script is copied from the build context. Changes to it require `docker compose up --build` to take effect — the same constraint that applies to all other source files in this Dockerfile.

---

## 5. Idempotency

- `prisma migrate deploy` is idempotent — it records applied migrations in `_prisma_migrations` and skips already-applied ones. Re-running after data already exists will not re-create tables.
- The dev seed uses `upsert` on `plant_no` (the primary key) so re-running after data exists is a no-op rather than a duplicate key error.
- Together, these properties mean `docker compose up` is safe to run repeatedly without data loss or errors.

---

## 6. Verification Steps

1. Run `docker compose down -v` to destroy all containers and the `postgres_data` volume (clean slate).
2. Run `docker compose up --build`.
3. Wait for the backend healthcheck to pass (`curl http://localhost:3001/api/health`).
4. Navigate to `http://localhost:3000/sites` and confirm the "Select Site" dropdown is populated with the 10 dev seed sites.
5. Register a new site — confirm it saves successfully (no `relation does not exist` error).
6. Run `docker compose down -v && docker compose up` (without `--build`) to confirm the entrypoint re-runs migrations idempotently against an empty fresh volume.

---

## 7. Explicit Non-Goals

- Do **not** run `prisma migrate dev` in the container (it is interactive).
- Do **not** run `prisma db push` in the container (it does not use migration files and bypasses the migration history, making the schema non-reproducible).
- Do **not** auto-seed the 10k performance data on startup (it takes ~5 seconds and is not needed for daily development).
- Do **not** modify the E2E backend tests — they mock Prisma and are unaffected.

---

## 8. Definition of Done

- [ ] `prisma/migrations/<timestamp>_init_site_management/migration.sql` exists and is committed.
- [ ] `docker/backend-entrypoint.sh` exists, is executable, and is committed.
- [ ] `docker/backend.Dockerfile` development stage uses the new entrypoint (no hardcoded CMD).
- [ ] `prisma/seed.ts` is the small dev seed (10 sites, upsert-based).
- [ ] `prisma/seed-perf.ts` is the renamed 10k performance seed.
- [ ] `apps/backend/package.json` has `prisma:seed` (dev) and `prisma:seed:perf` (10k) scripts.
- [ ] `docker compose down -v && docker compose up --build` results in a healthy stack with 10 seed sites visible in the UI.
- [ ] A new site can be registered successfully through the UI.
- [ ] All existing unit and E2E tests continue to pass.
