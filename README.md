# Enterprise Starter Template (Nx, Angular 21, NestJS 11)

An open-source, full-stack **Starter Template** built as an Nx monorepo. It provides a robust, domain-agnostic foundation for building modern web applications. Originally derived from a management system, it has been generalized into a scalable template featuring an **OpenAPI-first architecture**.

**Stack:** Angular 21 · NestJS 11 · TypeScript · PrimeNG · PostgreSQL · OpenAPI-first

## Key Features

- **OpenAPI-First Architecture**: Single source of truth. Edit the YAML specs to automatically generate the Angular HTTP client and NestJS server stubs.
- **Nx Monorepo**: Strict module boundaries and fast, cacheable builds.
- **Modern Tooling**: pnpm 10, Vitest, Playwright, and Prettier/ESLint pre-configured.

## Quick Start

```bash
# Install dependencies (pnpm is required)
pnpm install

# Start development servers
pnpm nx serve web   # Angular frontend at http://localhost:4200
pnpm nx serve api   # NestJS backend at http://localhost:3000/api

# Build for production
pnpm nx build web
pnpm nx build api
```

## How to Use this Template

This repository is designed to be adapted to your specific business domain.

1. **Define your Domain (OpenAPI)**
   The template includes a generic OpenAPI spec in `libs/api/openapi/`. Open these YAML files and modify the schemas (e.g., `members`, `organizations`, `staff`) to match your target domain.

2. **Generate the Code Contracts**
   Run the code generators to apply your OpenAPI changes:

   ```bash
   pnpm nx run api-openapi:validate
   pnpm nx run api-openapi:generate-web-client
   pnpm nx run api-openapi:generate-nest-server-stub
   ```

3. **Implement the Backend**
   The generator creates abstract classes. Create new services in `apps/api/src/app/openapi/` that extend these generated classes to write your actual business logic.

4. **Build the Frontend**
   The Angular HTTP client is strictly typed and ready to use. Import `DefaultService` from your data-access library and build out your UI in `libs/web/feature-*` modules.

## Project Structure

The workspace follows strict library isolation rules enforced by Nx:

```text
├── apps/
│   ├── web/               # Angular 21 frontend SPA
│   ├── web-e2e/           # Playwright E2E tests
│   ├── api/               # NestJS 11 REST API
│   └── api-e2e/           # API E2E tests (Jest)
├── libs/
│   ├── shared/
│   │   ├── util/          # Pure functions, no dependencies
│   │   └── data-access/   # Generated API client & models
│   ├── web/
│   │   ├── feature-shell/ # App shell & routing
│   │   └── ui/            # Reusable UI presentational components
│   └── api/
│       ├── data-access/   # DB entities & repositories
│       ├── util/          # API-specific utilities
│       └── openapi/       # OpenAPI spec (YAML files)
└── tools/
    └── openapi/           # Custom patching scripts for generated stubs
```

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm nx serve web` | Start Angular dev server |
| `pnpm nx serve api` | Start NestJS dev server |
| `pnpm nx build <project>` | Build a specific app or lib |
| `pnpm nx test <project>` | Run unit tests (Vitest/Jest) |
| `pnpm nx e2e <project>` | Run E2E tests (Playwright/Jest) |
| `pnpm nx lint <project>` | Lint a project |
| `pnpm nx format:write` | Format all files with Prettier |
| `pnpm nx graph` | Visualize project dependencies |

## Generating Code with Nx

Keep the architecture consistent by using Nx generators for scaffolding:

### Angular

```bash
# Create a new feature library with routing
pnpm nx g @nx/angular:library feature-xyz --directory=libs/web/feature-xyz --standalone --routing --lazy

# Create a standalone component in the UI lib
pnpm nx g @nx/angular:component my-component --project=ui
```

### NestJS

```bash
# Create a backend module
pnpm nx g @nx/nest:module xyz --project=api

# Create a backend service
pnpm nx g @nx/nest:service xyz --project=api
```

## CI / Nx Cloud

To connect to Nx Cloud for remote caching and distributed task execution:

```sh
pnpm nx connect
```

Then generate a CI workflow for GitHub Actions, GitLab CI, etc.:

```sh
pnpm nx g ci-workflow
```

Learn more: [Nx CI docs](https://nx.dev/ci/intro/ci-with-nx)

## License

This template is open source. See [LICENSE](LICENSE) for details.
