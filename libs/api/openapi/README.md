# api-openapi

Workspace-managed OpenAPI specification for the SMS backend.

- Root spec: `spec.yaml` (multi-file via `$ref`)
- Validate: `nx run api-openapi:validate`
- Generate Angular client: `nx run api-openapi:generate-web-client`
- Generate NestJS server stub: `nx run api-openapi:generate-nest-server-stub`

Structure:

```
libs/api/openapi/
├── spec.yaml
├── paths/
│   └── health.yaml
└── components/
	└── schemas/
		└── HealthResponse.yaml
```

Notes:

- This repo uses Nx + pnpm. The generator/validator tools are installed as dev dependencies.
- The generated client output is written under `libs/shared/data-access/src/lib/generated/openapi`.
- The generated NestJS server stub output is written under `apps/api/src/generated/openapi-server`.
