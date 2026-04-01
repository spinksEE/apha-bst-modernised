# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NAM Conference Survey is a mobile-first survey application for the Equal Experts North America Conference. The application enables **anonymous** attendees to provide structured feedback.

**Key Characteristics:**
- Public survey access (no authentication required for participants)
- 19-question survey with various question types (Likert, multi-select, ranking, open-ended)
- All questions are optional (zero mandatory fields)
- Rate limiting: 10 submissions/hour per IP
- Monorepo structure using pnpm workspaces

## Product Management

Product discovery, requirements, and release workflows are separate from engineering activities. See **[product/README.md](product/README.md)** for the complete index of product management resources.

| Directory | Purpose |
|-----------|---------|
| `product/` | Iterations, releases, metrics, story maps |
| `knowledge/product/` | Product context (personas, glossary, specs) |
| `prompts/product/` | AI behavior for PM workflows |
| `templates/product/` | Output structures for PM artifacts |
| `rules/product/` | PM-specific LLM guidelines |

PM slash commands: `/synth`, `/req`, `/rel`, `/map`, `/jira`, `/iter`, `/demap`

**For PM tasks without slash commands**: Read `rules/product/pm-workflow.md` for task recognition and routing to the correct prompts/templates.

**For engineering implementation**: Read stories as requirements, but don't modify PM artifacts.

## Tech Stack

```
Frontend:  React 18 + TypeScript + Mantine UI + Vite
Backend:   NestJS + TypeScript + Prisma ORM
Database:  PostgreSQL 15
Auth:      None (anonymous survey)
DevOps:    Docker + Docker Compose + pnpm
```

## Development Commands

### Starting the Application

```bash
# Start all services (frontend, backend, postgres) - recommended
pnpm run dev

# Start in background
pnpm run dev:bg

# Rebuild containers and start
docker-compose up --build

# View logs
pnpm run logs
pnpm run logs:frontend
pnpm run logs:backend
```

The app will be available at:
- Survey: http://localhost:3000
- API: http://localhost:3001/api

### Database Operations

```bash
# Open Prisma Studio (visual database editor)
pnpm run prisma:studio
# Access at http://localhost:5555

# Run migrations
pnpm run prisma:migrate

# Seed database
pnpm run prisma:seed

# Run migrations in Docker container
docker-compose exec backend npx prisma migrate dev

# Seed database in Docker container
docker-compose exec backend npx prisma db seed

# Access backend container shell
docker-compose exec backend sh
```

### Testing

```bash
# Backend unit tests
docker-compose exec backend pnpm test

# Backend test watch mode
docker-compose exec backend pnpm test:watch

# Backend test coverage
docker-compose exec backend pnpm test:cov

# Backend E2E tests
docker-compose exec backend pnpm test:e2e

# Frontend tests
docker-compose exec frontend pnpm test

# Frontend E2E tests (Playwright)
docker-compose exec frontend pnpm exec playwright test
```

### Linting and Formatting

```bash
# Backend lint
docker-compose exec backend pnpm lint

# Backend format
docker-compose exec backend pnpm format

# Frontend type check
docker-compose exec frontend pnpm type-check
```

### Cleanup

```bash
# Stop containers (keeps database)
pnpm run stop

# Stop and DELETE ALL DATA (⚠️ Warning!)
pnpm run clean
```

## Architecture & Code Organization

### Monorepo Structure

```
nam-conference-survey/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── prisma/       # Database schema, migrations, seed
│   │   └── src/
│   │       ├── modules/  # Feature modules (survey, etc.)
│   │       └── prisma/   # Prisma module for DI
│   └── frontend/         # React + Vite app
│       └── src/
│           ├── components/  # Reusable UI components
│           │   └── questions/  # Question-type components
│           └── pages/       # Route-level components
├── packages/
│   └── shared/           # Shared types between frontend/backend
├── rules/                # Development rules and guidelines
├── docker/               # Dockerfiles
└── docker-compose.yml
```

### Backend Architecture (NestJS)

**Module Organization:**
- Feature modules are organized in `apps/backend/src/modules/`
- Each module contains: controller, service, DTOs
- Use dependency injection for all services
- Database access through Prisma (injected via `PrismaModule`)

**Key Patterns:**
- DTOs with class-validator decorators for all API request/response validation
- Global rate limiting via `@nestjs/throttler`
- ConfigModule for environment variables (never use `process.env` directly)
- Entities are in Prisma schema, DTOs are separate (never expose entities directly)

**Database:**
- Prisma ORM with PostgreSQL
- Schema: `apps/backend/prisma/schema.prisma`
- Main models: `User` and `SurveyResponse` (19 questions + metadata)
- Anonymous submissions linked to `anonymous@survey.local` user
- Rate limiting tracked per IP

### Frontend Architecture (React + Vite)

**Component Organization:**
- Question components in `src/components/questions/` (LikertQuestion, MultipleSelectQuestion, etc.)
- Page components in `src/pages/` (SurveyPage, ThankYouPage)
- Use functional components exclusively (no class components)
- TypeScript with explicit prop interfaces

**Key Patterns:**
- Mantine UI component library
- Mobile-first responsive design (375px - 1920px)
- All state management through React hooks
- Form handling via `@mantine/form`
- No global state management (Context/Redux not needed for this app)

### Shared Package

The `packages/shared` directory contains TypeScript types shared between frontend and backend. This ensures type consistency across the API boundary.

## Anonymous Survey Flow

- No authentication required
- All submissions stored under `anonymous@survey.local` user
- Rate-limited to 10 submissions/hour per IP

## Important Development Guidelines

### From rules/nestjs-rules.md
- Organize features into dedicated modules with controllers, services, DTOs co-located
- Use DTOs with class-validator decorators for all API request/response validation
- Separate database entities from DTOs - never expose internal structure directly
- Use ConfigModule for all configuration - no direct process.env access
- Keep services stateless and focused on single responsibility

### From rules/react-rules.md
- Use functional components exclusively (class components only for error boundaries)
- Always use TypeScript with explicit prop interfaces
- All side effects MUST be in `useEffect` hooks with explicit dependency arrays
- Custom hooks MUST follow "use" naming convention
- Never mutate props or state directly
- All interactive elements MUST be keyboard accessible with proper ARIA labels
- Components MUST have single responsibility

### From rules/typescript-rules.md
- Enable strict mode in tsconfig.json (`"strict": true`)
- Never use `any` type except for documented escape hatches
- All function parameters and return types must be explicitly typed
- Validate all external data (API responses, user input) at runtime
- Never use `@ts-ignore` without detailed comment
- Prefer `interface` for object shapes, `type` for unions/intersections

### From rules/domain-driven-design.md
- Value Objects: Immutable objects defined by attributes (e.g., survey responses)
- Entities: Objects with identity (User, SurveyResponse)
- Repositories: Collection-like interface for accessing aggregates (Prisma repositories)
- Domain Services: Operations not belonging to any entity

## Equal Experts Branding

When working on UI components:

**Colors:**
- Primary Blue: `#1795d4`
- Navy: `#22567c`
- Charcoal: `#2c3234`

**Typography:**
- Font: Lexend (weights: 300, 400, 500)

**Logo:**
- URL: `https://www.equalexperts.com/wp-content/uploads/2024/10/2024-Logo.svg`

## Common Tasks

### Adding a New Survey Question

1. Update Prisma schema: `apps/backend/prisma/schema.prisma`
2. Create migration: `pnpm run prisma:migrate`
3. Update DTOs in backend: `apps/backend/src/modules/survey/dto/`
4. Add question component in frontend: `apps/frontend/src/components/questions/`
5. Update SurveyPage to include new question

### Database Schema Changes

1. Modify `apps/backend/prisma/schema.prisma`
2. Create migration: `docker-compose exec backend npx prisma migrate dev --name your_migration_name`
3. Migration is auto-applied on container start via `prisma migrate deploy`
4. Update seed file if needed: `apps/backend/prisma/seed.ts`

## Troubleshooting

**Port conflicts:**
- Frontend: 3000
- Backend: 3001
- Postgres: 5433 (mapped from container's 5432)

**Database connection issues:**
Wait for postgres health check to pass before backend starts (handled by docker-compose `depends_on`)

**Hot reload not working:**
Volume mounts are configured for both frontend and backend. If issues persist: `docker-compose up --build`

**Clean slate reset:**
```bash
docker-compose down -v  # Deletes all data
docker-compose up --build
```
