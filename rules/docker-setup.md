# Docker Setup

**Version**: 1.0
**Last Updated**: 2026-04-01
**Docker Compose Version**: 2.x+

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Docker Compose Configuration](#docker-compose-configuration)
4. [Dockerfiles](#dockerfiles)
5. [Environment Variables](#environment-variables)
6. [Networking](#networking)
7. [Volumes & Persistence](#volumes--persistence)
8. [Commands](#commands)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Goals
- **Zero Configuration**: Run entire stack with single command
- **Local Development**: Hot reload for frontend and backend
- **Non-Technical Friendly**: Simple README for anyone to run
- **Production-Like**: Environment mirrors deployment

### Services
1. **Frontend** - React + Vite (port 3000)
2. **Backend** - NestJS + Prisma (port 3001)
3. **PostgreSQL** - Database (port 5432)

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                  │
│                      (apha-bst-network)                    │
│                                                            │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐  │
│  │   Frontend   │─────▶│   Backend    │─────▶│PostgreSQL│  │
│  │   Container  │      │   Container  │      │Container │  │
│  │              │      │              │      │          │  │
│  │ Node:20-alpine│     │ Node:20-alpine│     │Postgres  │  │
│  │ Vite Dev     │      │ NestJS Dev   │      │ 15-alpine│  │
│  │              │      │ Prisma       │      │          │  │
│  │ Port: 3000   │      │ Port: 3001   │      │Port: 5432│  │
│  └──────────────┘      └──────────────┘      └──────────┘  │
│        │                     │                     │       │
│        │                     │                     │       │
│  ┌─────▼──────┐        ┌────▼─────┐         ┌────▼────┐    │
│  │ localhost: │        │localhost:│         │localhost│    │
│  │   3000     │        │  3001    │         │  5432   │    │
│  └────────────┘        └──────────┘         └─────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
         │                      │                    │
         └──────────────────────┴────────────────────┘
                    Host Machine Access
```

---

## Docker Compose Configuration

### File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # ==========================================================================
  # PostgreSQL Database
  # ==========================================================================
  postgres:
    image: postgres:15-alpine
    container_name: apha-bst-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: apha_bst
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - apha-bst-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ==========================================================================
  # Backend (NestJS + Prisma)
  # ==========================================================================
  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
      target: development
    container_name: apha-bst-backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:password@postgres:5432/apha_bst?schema=public
      JWT_SECRET: development-secret-change-in-production
      ADMIN_PASSWORD: ${ADMIN_PASSWORD:-admin123}
      FRONTEND_URL: http://localhost:3000
    ports:
      - "3001:3001"
    volumes:
      - ./apps/backend:/app
      - /app/node_modules  # Anonymous volume to prevent overwriting
      - /app/dist          # Anonymous volume for compiled output
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - apha-bst-network
    command: npm run start:dev

  # ==========================================================================
  # Frontend (React + Vite)
  # ==========================================================================
  frontend:
    build:
      context: .
      dockerfile: docker/frontend.Dockerfile
      target: development
    container_name: apha-bst-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      VITE_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules  # Anonymous volume
    depends_on:
      - backend
    networks:
      - apha-bst-network
    command: npm run dev -- --host

# ============================================================================
# Networks
# ============================================================================
networks:
  apha-bst-network:
    driver: bridge

# ============================================================================
# Volumes
# ============================================================================
volumes:
  postgres_data:
    driver: local
```

---

## Dockerfiles

### Backend Dockerfile (`docker/backend.Dockerfile`)

```dockerfile
# =============================================================================
# Multi-stage Dockerfile for NestJS Backend
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Install dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY apps/backend/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# -----------------------------------------------------------------------------
# Stage 2: Development - Hot reload
# -----------------------------------------------------------------------------
FROM base AS development

WORKDIR /app

# Copy all source code
COPY apps/backend .

# Expose port
EXPOSE 3001

# Run migrations and start dev server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start:dev"]

# -----------------------------------------------------------------------------
# Stage 3: Builder - Compile TypeScript
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy source code
COPY apps/backend .

# Build application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production - Optimized runtime
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3001

# Start application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

---

### Frontend Dockerfile (`docker/frontend.Dockerfile`)

```dockerfile
# =============================================================================
# Multi-stage Dockerfile for React Frontend
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base - Install dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: Development - Hot reload
# -----------------------------------------------------------------------------
FROM base AS development

WORKDIR /app

# Copy source code
COPY apps/frontend .

# Expose port
EXPOSE 3000

# Start dev server (--host allows access from host machine)
CMD ["npm", "run", "dev", "--", "--host"]

# -----------------------------------------------------------------------------
# Stage 3: Builder - Build static assets
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copy source code
COPY apps/frontend .

# Build application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: Production - Serve with Nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## Environment Variables

### File: `.env.example`

```bash
# =============================================================================
# APHA BST - Environment Variables
# =============================================================================

# -----------------------------------------------------------------------------
# Database Configuration
# -----------------------------------------------------------------------------
DATABASE_URL=postgresql://postgres:password@postgres:5432/apha_bst?schema=public

# -----------------------------------------------------------------------------
# JWT Authentication
# -----------------------------------------------------------------------------
JWT_SECRET=change-this-to-a-secure-random-string-in-production

# -----------------------------------------------------------------------------
# Application Login (POC - single static credential)
# -----------------------------------------------------------------------------
# Password used for the demo login screen
ADMIN_PASSWORD=admin123

# -----------------------------------------------------------------------------
# Application Configuration
# -----------------------------------------------------------------------------
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# -----------------------------------------------------------------------------
# Frontend Configuration (Optional - docker-compose sets these)
# -----------------------------------------------------------------------------
# Only needed if running frontend outside of Docker
# VITE_API_URL=http://localhost:3001/api
```

### Setup Instructions

1. **Copy example**:
   ```bash
   cp .env.example .env
   ```

2. **Generate JWT Secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy output to `JWT_SECRET` in `.env`

---

## Networking

### Network Configuration

**Network**: `apha-bst-network` (bridge driver)

**Service Communication**:
- Frontend → Backend: `http://backend:3001`
- Backend → PostgreSQL: `postgresql://postgres:5432`

**Host Access**:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

### CORS Configuration

Backend allows requests from `http://localhost:3000` (development):

```typescript
// apps/backend/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

---

## Volumes & Persistence

### Named Volumes

**`postgres_data`**:
- **Purpose**: Persist database data
- **Location**: Managed by Docker (usually `/var/lib/docker/volumes/`)
- **Survives**: Container restarts, rebuilds
- **Does NOT survive**: `docker-compose down -v` (warning!)

### Bind Mounts (Development)

**Frontend** (`./apps/frontend:/app`):
- **Purpose**: Hot reload - changes in host reflect in container
- **Files synced**: All source code
- **Anonymous volume**: `/app/node_modules` (prevents overwriting)

**Backend** (`./apps/backend:/app`):
- **Purpose**: Hot reload for NestJS
- **Files synced**: All source code
- **Anonymous volumes**: `/app/node_modules`, `/app/dist`

---

## Commands

### Start All Services

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Rebuild and start (after Dockerfile changes)
docker-compose up --build
```

---

### Stop Services

```bash
# Stop containers (keeps volumes)
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers AND volumes (WARNING: Deletes database!)
docker-compose down -v
```

---

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

---

### Execute Commands in Containers

```bash
# Open shell in backend container
docker-compose exec backend sh

# Run Prisma migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npx prisma db seed

# Open PostgreSQL shell
docker-compose exec postgres psql -U postgres -d apha_bst
```

---

### Database Operations

```bash
# Create new migration
docker-compose exec backend npx prisma migrate dev --name add_field

# Apply migrations (production)
docker-compose exec backend npx prisma migrate deploy

# Reset database (WARNING: Deletes all data!)
docker-compose exec backend npx prisma migrate reset

# View database in Prisma Studio
docker-compose exec backend npx prisma studio
# Then visit: http://localhost:5555
```

---

### Rebuild Specific Service

```bash
# Rebuild backend only
docker-compose up -d --no-deps --build backend

# Rebuild frontend only
docker-compose up -d --no-deps --build frontend
```

---

### Clean Up

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (nuclear option)
docker system prune -a --volumes
```

---

## Troubleshooting

### Issue: Port Already in Use

**Symptoms**:
```
Error: bind: address already in use
```

**Solution**:
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3002:3000"  # Map to different host port
```

---

### Issue: Database Connection Refused

**Symptoms**:
```
Error: connect ECONNREFUSED postgres:5432
```

**Solution**:
```bash
# Wait for postgres to be healthy
docker-compose up postgres

# Check health status
docker-compose ps

# Restart backend after postgres is ready
docker-compose restart backend
```

---

### Issue: Hot Reload Not Working

**Symptoms**:
- Code changes don't reflect in running app

**Solution (Backend)**:
```bash
# Check if volume is mounted correctly
docker-compose exec backend ls -la /app

# Restart with rebuild
docker-compose up -d --build backend
```

**Solution (Frontend)**:
```bash
# Ensure Vite is using polling (for Docker)
# apps/frontend/vite.config.ts
export default {
  server: {
    watch: {
      usePolling: true,  // Add this
    },
  },
};
```

---

### Issue: Permission Denied (Node Modules)

**Symptoms**:
```
Error: EACCES: permission denied
```

**Solution**:
```bash
# Remove node_modules from host
rm -rf apps/frontend/node_modules apps/backend/node_modules

# Rebuild containers
docker-compose up --build

# Node modules now exist only in containers (anonymous volumes)
```

---

### Issue: Environment Variables Not Loaded

**Symptoms**:
- `ADMIN_PASSWORD` or `JWT_SECRET` is undefined

**Solution**:
```bash
# Ensure .env file exists
ls -la .env

# Restart containers to reload env vars
docker-compose down
docker-compose up -d

# Check env vars in container
docker-compose exec backend printenv | grep ADMIN
```

---

### Issue: Database Migrations Failed

**Symptoms**:
```
Error: P3009: migrate found failed migration
```

**Solution**:
```bash
# Reset database and reapply migrations
docker-compose exec backend npx prisma migrate reset

# Or manually resolve
docker-compose exec backend npx prisma migrate resolve --applied <migration_name>
```

---

### Issue: Out of Disk Space

**Symptoms**:
```
Error: no space left on device
```

**Solution**:
```bash
# Check Docker disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove old postgres data
docker volume rm apha-bst_postgres_data
```

---

## Health Checks

### Backend Health Check

**Endpoint**: `GET http://localhost:3001/health`

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 12345
}
```

### Frontend Health Check

**URL**: `http://localhost:3000`

**Expected**: React app loads successfully

### PostgreSQL Health Check

```bash
docker-compose exec postgres pg_isready -U postgres
# Output: postgres:5432 - accepting connections
```

---

## Security Considerations

### Development
- Default passwords are INSECURE (postgres:password)
- JWT_SECRET should be changed

### Production (Future)
- [ ] Non-root users in all containers
- [ ] HTTPS with reverse proxy (Nginx, Traefik)
- [ ] Network isolation (remove exposed PostgreSQL port)
- [ ] Automated backups

---

**Docker Setup Owner**: DevOps Team
**Last Updated**: 2025-11-18
