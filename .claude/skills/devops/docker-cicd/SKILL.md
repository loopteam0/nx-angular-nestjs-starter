---
name: docker-cicd
description: Implements containerization and CI/CD pipelines for Angular and NestJS applications in Nx monorepo using Docker, Docker Compose, and GitHub Actions. Note that this workspace does not currently include Dockerfiles, docker-compose, or GitHub Actions workflows - treat examples as templates. Use when setting up Docker, configuring CI/CD, or when the user mentions containerization, deployment, GitHub Actions, or pipelines.
---

# Docker & CI/CD

**Note**: This workspace does not currently include Dockerfiles, docker-compose, or GitHub Actions workflows. Treat the examples below as templates to add.

---

## Docker Configuration

### Frontend Dockerfile

**Location:** `apps/web/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm nx build web

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

**Location:** `apps/api/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json tsconfig.base.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm nx build api

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist/apps/api ./

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
CMD ["node", "main.js"]
```

---

## Docker Compose

**Location:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: sms
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: sms_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_HOST: postgres
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

---

## GitHub Actions CI/CD

### CI Workflow

**Location:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Derive SHAs
        uses: nrwl/nx-set-shas@v4

      - name: Lint affected
        run: pnpm nx affected -t lint --parallel=3

      - name: Test affected
        run: pnpm nx affected -t test --parallel=3 --coverage

      - name: Build affected
        run: pnpm nx affected -t build --parallel=3
```

---

## Docker Commands

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart api
```

---

## Best Practices

### ✅ DO
- Use multi-stage builds
- Use Alpine images for smaller size
- Implement health checks
- Run as non-root user
- Use .dockerignore
- Set resource limits
- Use environment variables
- Version your images

### ❌ DON'T
- Run as root in production
- Include secrets in Dockerfile
- Use latest tag in production
- Skip health checks
- Expose unnecessary ports
- Ignore security scanning

---

## .dockerignore

```
node_modules
dist
.git
.github
.vscode
*.md
*.log
.env
coverage
.nx
```

---

## Additional Resources

For detailed configurations and examples, see:

- [docker-configs.md](./references/docker-configs.md) - Complete Docker and nginx configurations
- [github-actions.md](./references/github-actions.md) - Complete CI/CD workflows
- [deployment.md](./references/deployment.md) - Deployment strategies

---

## Related Skills

- **NX Monorepo Management** - Nx commands and affected builds
- **Code Quality Standards** - CI/CD quality gates
- **NestJS Repository Service** - Backend containerization
