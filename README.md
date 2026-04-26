# School Management System (SMS)

An open-source, full-stack **School Management System** built as an Nx monorepo. It provides a comprehensive platform for managing student records, attendance, timetables, fees, exams, communication, and more — designed for educational institutions of any size.

**Stack:** Angular 21 · NestJS 11 · TypeScript · PrimeNG · PostgreSQL · OpenAPI-first

> See [docs/prd.md](docs/prd.md) for the full product requirements and [docs/modules/](docs/modules/) for the phased implementation plan.

## Quick Start

```bash
# Install dependencies (pnpm required)
pnpm install

# Start development servers
pnpm nx serve web   # Angular at http://localhost:4200
pnpm nx serve api   # NestJS at http://localhost:3000

# Build for production
pnpm nx build web
pnpm nx build api
```

## Project Structure

```
├── apps/
│   ├── web/              # Angular 21 frontend SPA
│   ├── web-e2e/          # Playwright E2E tests
│   ├── api/              # NestJS 11 REST API
│   └── api-e2e/          # API E2E tests (Jest)
├── libs/
│   ├── shared/
│   │   ├── util/         # Shared utilities         (@sms/util)
│   │   └── data-access/  # Generated API client     (@sms/data-access)
│   ├── web/
│   │   ├── feature-shell/ # App shell & routing     (@sms/feature-shell)
│   │   └── ui/            # Reusable UI components  (@sms/ui)
│   └── api/
│       ├── data-access/  # DB entities & repos      (@sms/api/data-access)
│       ├── util/         # API-specific utilities   (@sms/api/util)
│       └── openapi/      # OpenAPI spec (YAML)
└── docs/
    ├── prd.md            # Product Requirements Document
    └── modules/          # Phased module specs
```

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm nx serve web` | Start Angular dev server |
| `pnpm nx serve api` | Start NestJS dev server |
| `pnpm nx build <project>` | Build a project |
| `pnpm nx test <project>` | Run unit tests |
| `pnpm nx lint <project>` | Lint a project |
| `pnpm nx run-many -t test` | Run all unit tests |
| `pnpm nx graph` | Visualize project dependencies |

## OpenAPI Workflow

The API is **spec-first**: edit the YAML spec, then regenerate client and server stubs.

| Command | Description |
|---------|-------------|
| `pnpm nx run api-openapi:validate` | Validate the OpenAPI spec |
| `pnpm nx run api-openapi:generate-web-client` | Generate the Angular HTTP client |
| `pnpm nx run api-openapi:generate-nest-server-stub` | Generate NestJS controller stubs |

After regenerating, implement new endpoints by extending the generated abstract classes in `apps/api/src/app/openapi/`.

## Generate Code

### Angular

```bash
# Feature library with routing
pnpm nx g @nx/angular:library feature-xyz --directory=libs/web/feature-xyz --standalone --routing --lazy

# Standalone component
pnpm nx g @nx/angular:component my-component --project=ui
```

### NestJS

```bash
# Module
pnpm nx g @nx/nest:module xyz --project=api

# Service
pnpm nx g @nx/nest:service xyz --project=api
```

## CI / Nx Cloud

To connect to Nx Cloud for remote caching and distributed task execution:

```sh
pnpm nx connect
```

Then generate a CI workflow:

```sh
pnpm nx g ci-workflow
```

Learn more: [Nx CI docs](https://nx.dev/ci/intro/ci-with-nx)

## Contributing

Contributions are welcome! Please open an issue or pull request. When adding a new module, follow the patterns in `docs/modules/` and the architecture conventions in `CLAUDE.md` / `.github/copilot-instructions.md`.

## License

This project is open source. See [LICENSE](LICENSE) for details.
