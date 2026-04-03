# BST (Brainstem Training) Database System - Architecture

**Version**: 1.0
**Last Updated**: 2026-04-01
**Tech Stack**: React + NestJS + Prisma + PostgreSQL + Docker
**Auth**: DB-backed user login + JWT (POC)

---

## System Overview

### Purpose
A modernised web application for the Animal and Plant Health Agency (APHA) to maintain authoritative training records for personnel who perform brain stem sample extraction from cattle, sheep, and goats. This supports TSE (Transmissible Spongiform Encephalopathy) and BSE (Bovine Spongiform Encephalopathy) surveillance programmes.

> **Note**: This is a proof-of-concept (POC) built to demonstrate the modernised system using seeded data. It is not yet production-ready.

### Key Characteristics
- **Monolithic Architecture**: Single NestJS backend serving a RESTful API
- **SPA Frontend**: React + Vite, aligned to GOV.UK Design System principles
- **Role-Based Access**: Three roles — Supervisor, Data Entry, Read Only
- **DB-Backed Auth (POC)**: Username/password validated against the BST database; JWT-secured API
- **Mobile-First**: 375px – 1920px responsive design
- **Accessibility**: WCAG 2.1 AA compliant, GOV.UK Design System aligned
- **Dockerised**: Complete local development environment

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DOCKER COMPOSE                          │
│                                                                 │
│  ┌────────────────┐      ┌────────────────┐      ┌───────────┐  │
│  │   Frontend     │      │    Backend     │      │ PostgreSQL│  │
│  │   (React +     │─────▶│   (NestJS)     │─────▶│    15+    │  │
│  │    Vite)       │      │   + Prisma     │      │           │  │
│  │  Port: 3000    │      │  Port: 3001    │      │ Port: 5432│  │
│  └────────────────┘      └────────────────┘      └───────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

No External Services Required:
  - Auth uses BST database-backed users (POC only)
  - No Active Directory or SSO integration in this POC
```

### Container Communication
- Frontend → Backend: HTTP REST API (`http://backend:3001`)
- Backend → PostgreSQL: Prisma connection (`postgresql://postgres:5432`)
- Frontend exposed: `localhost:3000`
- Backend exposed: `localhost:3001` (for direct API testing)
- PostgreSQL exposed: `localhost:5432` (for debugging)

---

## Technology Stack

### Frontend
```json
{
  "framework": "React 18",
  "language": "TypeScript (strict mode)",
  "ui-library": "Mantine UI v7",
  "routing": "React Router v6",
  "forms": "React Hook Form + Zod",
  "state": "TanStack Query (server) + Zustand (client)",
  "http": "Axios",
  "build": "Vite 5"
}
```

**Key Dependencies**:
- `@mantine/core` - Component library (styled to align with GOV.UK Design System)
- `@mantine/form` - Form management
- `@mantine/hooks` - Utility hooks
- `@tanstack/react-query` - Server state management
- `react-router-dom` - Routing
- `zod` - Schema validation
- `axios` - HTTP client

### Backend
```json
{
  "framework": "NestJS v10",
  "language": "TypeScript",
  "orm": "Prisma v5",
  "database": "PostgreSQL 15",
  "auth": "Passport.js + JWT",
  "validation": "class-validator + class-transformer",
  "api-style": "RESTful JSON"
}
```

**Key Dependencies**:
- `@nestjs/core` - Framework core
- `@nestjs/passport` - Authentication
- `@nestjs/jwt` - JWT tokens
- `@nestjs/throttler` - Rate limiting
- `@prisma/client` - Database ORM
- `class-validator` - DTO validation

### Database
```yaml
Type: PostgreSQL 15
ORM: Prisma
Migrations: Prisma Migrate
Seed: Prisma seed script (POC data)
Connection Pooling: Default (max 10 connections for local)
```

### DevOps
```yaml
Containerisation: Docker + Docker Compose
Package Manager: pnpm (workspace monorepo)
Node Version: 20 LTS
```

---

## Application Structure

### Monorepo Layout
```
apha-bst-modernised/
├── apps/
│   ├── frontend/                 # React application
│   │   ├── src/
│   │   ├── public/               # Static assets
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── backend/                  # NestJS application
│       ├── src/
│       ├── test/                 # E2E tests
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                   # Shared TypeScript types
│       ├── src/
│       ├── tsconfig.json
│       └── package.json
│
├── rules/                        # Architecture docs
│   ├── architecture.md           # This file
│   ├── design.md                 # UI/UX guidelines
│   ├── database-schema.md        # Database design
│   ├── api-spec.md               # API documentation
│   └── docker-setup.md           # Docker guide
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

## Authentication & Authorisation

### Strategy: DB-Backed Login (POC) + JWT API

This is a POC implementation. User credentials are validated against the BST database. The backend issues a JWT on successful login; the frontend must include this JWT as a standard Bearer token with every subsequent API request for that user.

In a production system, this would be replaced with an appropriate identity provider (e.g. Azure AD / Entra ID).

---

## API Design

### RESTful Principles
- **Resource-oriented URLs**: `/api/training`, `/api/sites`, `/api/personnel`
- **HTTP methods**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **Status codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorised), 403 (Forbidden), 404 (Not Found), 500 (Server Error)
- **JSON payloads**: All requests/responses use `Content-Type: application/json`

### Base URL
```
Local: http://localhost:3001/api
```

---

## Database Design

### Prisma Schema Location
`apps/backend/prisma/schema.prisma`

---

## Security

### Authentication Security
- **JWT Tokens**: Signed with `HS256`; 8-hour expiry (business day window)
- **Token Storage**: `localStorage` (acceptable for POC)
- **Credential Source**: BST database user records (POC only)

### Authorization
- **Guard-Protected Routes**: NestJS guards enforce JWT + role on every endpoint
- **Frontend Route Protection**: React Router guards (defence-in-depth; not primary security)

### API Security
- **CORS**: Restricted to frontend origin (`http://localhost:3000`)
- **Rate Limiting**: 100 requests/minute per IP (NestJS throttler)
- **Input Validation**: `class-validator` DTOs prevent injection
- **SQL Injection**: Prevented by Prisma ORM (parameterised queries)

### Audit Trail
- All data modification operations must be logged to `AuditLog` with user identity, timestamp, operation, and affected record
- 7-year retention requirement applies in production

### Docker Security
- Containers run as non-root
- Secrets via environment variables only — never baked into images

---

## Key Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| Monolithic architecture | Small team, ~20 users, POC simplicity |
| PostgreSQL over alternatives | Structured relational data; referential integrity essential for training records |
| Column-based schema | Type safety, easier reporting queries, avoids JSON blob anti-pattern of legacy system |
| DB-backed auth (POC) | Demonstrates login workflow using BST user records without requiring identity provider setup |
| JWT (no refresh tokens) | Short 8-hour expiry covers a working day; acceptable for POC |
| Mantine UI | Accessible component library; can be themed to GOV.UK Design System principles |
| Docker Compose | Reproducible local environment for demo purposes |
| pnpm monorepo | Shared types between frontend and backend; faster installs |
