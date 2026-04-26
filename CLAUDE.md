# School Management System — Claude Code Guide

## Project Overview

A full-stack **School Management System** (SMS) built as an Nx monorepo.

- **Frontend:** Angular 21 + PrimeNG 21 + Vitest
- **Backend:** NestJS 11 + OpenAPI-first + Jest
- **Package manager:** pnpm 10
- **Monorepo tool:** Nx 22
- **API contract:** OpenAPI spec-first (generate client & server stubs from spec)

---

## Essential Commands

### Development

```bash
pnpm nx serve web          # Angular dev server → http://localhost:4200
pnpm nx serve api          # NestJS dev server  → http://localhost:3000
```

### Building

```bash
pnpm nx build web          # Production Angular build
pnpm nx build api          # Production NestJS build
pnpm nx run-many -t build  # Build all projects
```

### Testing

```bash
pnpm nx test web           # Vitest (Angular unit tests)
pnpm nx test api           # Jest (NestJS unit tests)
pnpm nx e2e web-e2e        # Playwright E2E tests
pnpm nx e2e api-e2e        # Jest API E2E tests
pnpm nx run-many -t test   # Run all unit tests
```

### Linting & Formatting

```bash
pnpm nx lint web           # Lint frontend
pnpm nx lint api           # Lint backend
pnpm nx run-many -t lint   # Lint all projects
pnpm nx format:write       # Format all files with Prettier
pnpm nx format:check       # Check formatting (CI)
```

### OpenAPI Workflow

```bash
pnpm nx run api-openapi:validate              # Validate the OpenAPI YAML spec
pnpm nx run api-openapi:generate-web-client   # Generate Angular HTTP client from spec
pnpm nx run api-openapi:generate-nest-server-stub  # Generate NestJS controller stubs
```

Always run the OpenAPI workflow after modifying the spec:

1. Edit `libs/api/openapi/` spec files
2. Validate: `pnpm nx run api-openapi:validate`
3. Regenerate: both `generate-web-client` and `generate-nest-server-stub`
4. Implement new endpoints in `apps/api/src/app/openapi/`

### Nx Utilities

```bash
pnpm nx graph                  # Visualize project dependency graph
pnpm nx show project <name>    # Show project targets and config
pnpm nx affected -t test       # Run tests only for affected projects
pnpm nx affected -t build      # Build only affected projects
```

---

## Architecture

### Monorepo Layout

```
apps/
  web/           Angular 21 SPA
  web-e2e/       Playwright tests for web
  api/           NestJS 11 REST API
  api-e2e/       Jest E2E tests for API
libs/
  shared/
    util/            @sms/util          — shared utilities
    data-access/     @sms/data-access   — shared data models/interfaces
  web/
    feature-shell/   @sms/feature-shell — routing shell & layout
    ui/              @sms/ui            — reusable Angular UI components
  api/
    data-access/     @sms/api/data-access — DB entities & repositories
    util/            @sms/api/util        — API-specific utilities
    openapi/         OpenAPI spec (YAML components + paths)
```

### Path Aliases (`tsconfig.base.json`)

| Alias                  | Path                                   |
| ---------------------- | -------------------------------------- |
| `@sms/util`            | `libs/shared/util/src/index.ts`        |
| `@sms/data-access`     | `libs/shared/data-access/src/index.ts` |
| `@sms/ui`              | `libs/web/ui/src/index.ts`             |
| `@sms/feature-shell`   | `libs/web/feature-shell/src/index.ts`  |
| `@sms/api/data-access` | `libs/api/data-access/src/index.ts`    |
| `@sms/api/util`        | `libs/api/util/src/index.ts`           |

### API Architecture (OpenAPI-first)

The API is **spec-first**: the OpenAPI YAML in `libs/api/openapi/` is the source of truth.

- Server stubs are generated into `apps/api/src/generated/openapi-server/`
- Angular client is generated into `libs/shared/data-access/src/lib/generated/`
- Implement generated interfaces in `apps/api/src/app/openapi/` (e.g. `health-api.service.ts`)
- Register implementations in `apps/api/src/app/app.module.ts` via `ApiImplementations`

---

## Development Conventions

### Adding a New API Endpoint

1. Add path to `libs/api/openapi/paths/`
2. Add components (schemas, responses) to `libs/api/openapi/components/`
3. Run `pnpm nx run api-openapi:validate`
4. Run `pnpm nx run api-openapi:generate-web-client`
5. Run `pnpm nx run api-openapi:generate-nest-server-stub`
6. Create service implementing the generated interface in `apps/api/src/app/openapi/`
7. Register in `app.module.ts`

### Adding a New Feature Module

Use the Nx generators to keep library structure consistent:

```bash
# Frontend feature library
pnpm nx g @nx/angular:library feature-<name> \
  --directory=libs/web \
  --importPath=@sms/feature-<name> \
  --standalone --routing

# Backend library
pnpm nx g @nx/nest:library <name> \
  --directory=libs/api \
  --importPath=@sms/api/<name>
```

### Code Style

- **TypeScript strict mode** is enabled
- **Prettier** with `singleQuote: true` — run `pnpm nx format:write` after edits
- **ESLint** with Nx boundary rules enforced — no cross-boundary imports
- Angular: use **standalone components** and **signals** for state management
- Backend: follow **repository → service → controller** layering pattern
- Never import directly from another app; only through `libs/` path aliases

### Testing Conventions

- Unit tests co-located as `*.spec.ts`
- Vitest for Angular (uses `@analogjs/vitest-angular`)
- Jest for NestJS
- Run affected tests before committing: `pnpm nx affected -t test`

---

## Skills Reference

Detailed implementation guides are in `.claude/skills/`:

| Category    | File                                              | When to Use                  |
| ----------- | ------------------------------------------------- | ---------------------------- |
| Backend     | `backend/nestjs-repository-service.md`            | Adding repositories/services |
| Backend     | `backend/typeorm-database.md`                     | DB schema & migrations       |
| Backend     | `backend/nestjs-testing.md`                       | Writing NestJS tests         |
| Backend     | `backend/multi-tenancy-implementation.md`         | Multi-tenant features        |
| Frontend    | `frontend/angular-component-architecture.md`      | Component structure          |
| Frontend    | `frontend/signal-store-state-management.md`       | State with signals           |
| Frontend    | `frontend/angular-testing.md`                     | Angular unit tests           |
| Frontend    | `frontend/primeng-ui-forms.md`                    | PrimeNG forms & UI           |
| Frontend    | `frontend/repository-openapi-integration.md`      | Using generated API client   |
| Integration | `integration/openapi-spec-management.md`          | Managing the OpenAPI spec    |
| DevOps      | `devops/nx-monorepo-management.md`                | Nx generators & workspace    |
| DevOps      | `devops/code-quality-standards.md`                | Linting & formatting rules   |
| DevOps      | `devops/docker-cicd.md`                           | Docker & CI/CD setup         |
| Features    | `feature-management/feature-module-management.md` | End-to-end feature creation  |

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
