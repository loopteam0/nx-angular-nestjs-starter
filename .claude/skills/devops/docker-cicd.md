---
name: docker-cicd
description: Implements containerization and CI/CD pipelines for Angular and NestJS applications in Nx monorepo using Docker, Docker Compose, and GitHub Actions. Note that this workspace does not currently include Dockerfiles, docker-compose, or GitHub Actions workflows - treat examples as templates. Use when setting up Docker, configuring CI/CD, or when the user mentions containerization, deployment, GitHub Actions, or pipelines.
---

# Docker & CI/CD

**Note**: This workspace does not currently include Dockerfiles, docker-compose, or GitHub Actions workflows. Treat the examples below as templates to add.

---

## Docker Configuration

### Frontend Dockerfile

**Suggested location:** `apps/web/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm nx build web

# Production stage
FROM nginx:alpine

# Copy custom nginx config (create if needed)
# COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=builder /app/dist/apps/web /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

**Suggested location:** `apps/api/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm nx build api

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN corepack enable

# Install production dependencies only
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built app
COPY --from=builder /app/dist/apps/api ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "main.js"]
```

---

## Docker Compose

**Suggested location:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database (optional)
  postgres:
    image: postgres:16-alpine
    container_name: sms-postgres
    environment:
      POSTGRES_USER: sms
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: sms_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - sms-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sms"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache (optional)
  redis:
    image: redis:7-alpine
    container_name: sms-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sms-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # API (NestJS)
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: sms-api
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: sms
      DATABASE_PASSWORD: ${DB_PASSWORD}
      DATABASE_NAME: sms_db
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sms-network
    restart: unless-stopped

  # Web (Angular)
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: sms-web
    ports:
      - "4200:80"
    environment:
      API_URL: http://api:3000
    depends_on:
      - api
    networks:
      - sms-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  sms-network:
    driver: bridge
```

### Environment File

**Location:** `.env`

```env
# Database
DB_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret

# API
API_URL=http://localhost:3000

# Node Environment
NODE_ENV=production
```

---

## Nginx Configuration

**Suggested location:** `apps/web/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Angular routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## GitHub Actions CI/CD

**Suggested location:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Lint and Test
  lint-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'

      - name: Enable Corepack (pnpm)
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Derive appropriate SHAs for base and head
        uses: nrwl/nx-set-shas@v4

      - name: Lint affected
        run: pnpm nx affected -t lint --parallel=3

      - name: Test affected
        run: npx nx affected -t test --parallel=3 --coverage

      - name: Build affected
        run: npx nx affected -t build --parallel=3

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/*/lcov.info

  # E2E Tests
  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'pnpm'

      - name: Enable Corepack (pnpm)
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx nx affected -t e2e --parallel=1

      - name: Upload E2E artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: dist/.playwright/
```

### Deployment Pipeline

**Location:** `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build all apps
        run: pnpm nx run-many -t build --configuration=production

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker images
        run: |
          docker build -t sms/web:latest -f apps/web/Dockerfile .
          docker push sms/web:latest

          docker build -t sms/api:latest -f apps/api/Dockerfile .
          docker push sms/api:latest

      - name: Deploy to production
        run: |
          # Add deployment commands here
          # e.g., kubectl apply, docker-compose up, etc.
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

# Remove volumes
docker-compose down -v

# Build specific service
docker-compose build api

# Restart specific service
docker-compose restart api

# Execute command in container
docker-compose exec api pnpm run migration:run  # placeholder (add a migration script/target first)

# View service status
docker-compose ps
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
- Implement proper logging
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

## Related Skills

- NX Monorepo Management
- Code Quality Standards
- NestJS Microservice Architecture
