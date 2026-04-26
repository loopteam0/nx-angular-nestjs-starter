# SMS - School Management System

Nx monorepo with Angular 21 frontend, NestJS 11 backend, and OpenAPI-first architecture.

## Architecture Overview

**API-First Design**: OpenAPI spec at `libs/api/openapi/spec.yaml` drives both client and server code generation.
- Client: Angular services generated to `libs/shared/data-access/src/lib/generated/openapi`
- Server: NestJS controllers/DTOs generated to `apps/api/src/generated/openapi-server`
- Pattern: Implement APIs by extending generated abstract classes (see `apps/api/src/app/openapi/health-api.service.ts`)

**Feature Library Architecture**: Strict dependency rules enforced via Nx:
- `feature-*`: Smart components with routing (can import: data-access, ui, util)
- `ui`: Presentational components only (can import: util)
- `data-access`: State management, API services (can import: util)
- `util`: Pure functions, no dependencies on other lib types

**Technology Stack**:
- Frontend: Angular 21 standalone components, PrimeNG, SCSS, Vitest
- Backend: NestJS 11, Express, Jest
- Package Manager: pnpm (required, specified in `package.json`)
- Testing: Vitest for Angular, Jest for NestJS, Playwright for E2E

## Critical Workflows

### OpenAPI Code Generation
```bash
# 1. Validate spec changes
nx run api-openapi:validate

# 2. Generate Angular client (updates @sms/data-access)
nx run api-openapi:generate-web-client

# 3. Generate NestJS server stubs (updates apps/api/src/generated)
nx run api-openapi:generate-nest-server-stub

# 4. Implement by extending generated classes in apps/api/src/app/openapi/
```

**Post-generation**: Custom patch script (`tools/openapi/patch-nestjs-server-stub.mjs`) fixes Express `Request` imports automatically.

### Development Setup
```bash
pnpm install                    # Never use npm/yarn - pnpm is enforced
nx serve web                    # Angular at localhost:4200
nx serve api                    # NestJS at localhost:3000, prefix: /api
```

### Testing Strategy
- Angular libs: Vitest with `@analogjs/vitest-angular`
- NestJS: Jest with `@nestjs/testing`
- E2E: Playwright (web-e2e), Jest (api-e2e)
- Run: `nx test <project>` or `nx run-many --target=test --all`

## Code Patterns

### Backend: Implementing OpenAPI Endpoints
```typescript
// apps/api/src/app/openapi/my-api.service.ts
import { Injectable } from '@nestjs/common';
import { MyApi } from '../../generated/openapi-server/api';
import type { MyResponse } from '../../generated/openapi-server/models';

@Injectable()
export class MyApiService extends MyApi {
  override myEndpoint(request: Request): MyResponse {
    // Implementation here
  }
}
```
Register in `openapi-generated.module.ts` (auto-imports all generated controllers).

### Frontend: Using Generated Client
```typescript
// Import from @sms/data-access, not the generated path directly
import { DefaultService } from '@sms/data-access';
```

### Library Import Paths (tsconfig.base.json)
```typescript
'@sms/util'           → libs/shared/util
'@sms/data-access'    → libs/shared/data-access
'@sms/ui'             → libs/web/ui
'@sms/feature-shell'  → libs/web/feature-shell
'@sms/api/data-access'→ libs/api/data-access
'@sms/api/util'       → libs/api/util
```

## Project Context

**Domain**: Comprehensive school management system (see `docs/prd.md`)
- Core modules: Student info, attendance, fees, exams, timetables
- Extended features: LMS, parent portal, transport, library, HR

**Generator Defaults** (nx.json):
- Angular: Standalone components, SCSS, Playwright E2E, Vitest
- Component style: CSS (override with `--style=scss` if needed)

## Quick Reference

| Task | Command |
|------|---------|
| Create Angular feature lib | `nx g @nx/angular:library feature-xyz --directory=libs/web/feature-xyz --standalone --routing --lazy` |
| Create Angular component | `nx g @nx/angular:component name --project=ui` |
| Create NestJS module | `nx g @nx/nest:module xyz --project=api` |
| Visualize dependencies | `nx graph` |
| Show affected projects | `nx affected:graph` |
| Lint all | `nx run-many --target=lint --all` |
