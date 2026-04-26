---
name: openapi-spec-management
description: Creates, maintains, and generates code from OpenAPI specifications. Defines API endpoints, schemas, models, generates frontend clients and backend validation. Use when updating API specs, modifying openapi, adding endpoints, regenerating API clients, syncing API definitions, or when the user mentions openapi schemas, API specifications, code generation, or swagger.
---

# OpenAPI Spec Management

**Note**: Prefer a multi-file OpenAPI spec (root `spec.yaml` + `$ref` files) so the contract scales cleanly as modules grow.

---

## OpenAPI Specification Structure

### Location

```
libs/api/openapi/
├── spec.yaml
├── paths/
│   └── *.yaml
└── components/
    ├── schemas/
    │   └── *.yaml
    ├── parameters/
    │   └── *.yaml
    └── responses/
        └── *.yaml
```

**Guideline:**
- Keep `spec.yaml` as the single entrypoint for validation/bundling/codegen
- Split `paths/*` by resource (e.g. `patients.yaml`, `patients-id.yaml`)
- Split `components/*` into reusable blocks (schemas, parameters, responses)

### Basic Structure

```yaml
openapi: 3.0.3
info:
  title: School Management System API
  description: SMS API (multi-school tenancy optional)
  version: 1.0.0

servers:
  - url: http://localhost:3000/api
    description: Development server

tags:
  - name: Health
    description: Health check endpoints

paths:
  /health:
    $ref: "./paths/health.yaml"

components:
  schemas:
    HealthResponse:
      $ref: "./components/schemas/HealthResponse.yaml"
```

---

## Code Generation

### Frontend Client Generation

```bash
# Generate Angular client
nx run api-openapi:generate-web-client
```

**Generated to:** `libs/shared/data-access/src/lib/generated/openapi/`

### Backend Server Stubs

```bash
# Generate NestJS server stubs
nx run api-openapi:generate-nest-server-stub
```

**Generated to:** `apps/api/src/generated/openapi-server/`

---

## Workflow for API Changes

### 1. Update OpenAPI Spec

```bash
# Edit the root entrypoint
vim libs/api/openapi/spec.yaml

# Add/edit files under
# - libs/api/openapi/paths/
# - libs/api/openapi/components/
```

### 2. Validate Spec

```bash
# Validate using Nx target
nx run api-openapi:validate

# Or use Swagger CLI
swagger-cli validate libs/api/openapi/spec.yaml
```

### 3. Generate Code

```bash
# Generate both frontend and backend
nx run api-openapi:generate-web-client
nx run api-openapi:generate-nest-server-stub
```

### 4. Implement Backend

```typescript
// apps/api/src/app/openapi/my-api.service.ts
import { Injectable } from '@nestjs/common';
import { MyApi } from '../../generated/openapi-server/api';

@Injectable()
export class MyApiService extends MyApi {
  override myEndpoint(request: Request): MyResponse {
    // Implementation here
  }
}
```

### 5. Commit Changes

```bash
git add libs/api/openapi/ libs/shared/data-access/src/lib/generated/
git commit -m "feat(api): add new endpoint"
```

---

## Best Practices

### ✅ DO

- **Versioning**: Include version in API path (`/api/v1/patients`)
- **Consistent Naming**: Use plural nouns for collections (`/patients`)
- **HTTP Methods**: Use proper HTTP verbs (GET, POST, PUT, DELETE)
- **Status Codes**: Return appropriate HTTP status codes
- **Pagination**: Support pagination for list endpoints
- **Error Responses**: Standardize error response format
- **Security**: Define security schemes
- **Examples**: Provide examples for all schemas
- **Required Fields**: Mark required fields explicitly

### ❌ DON'T

- **Breaking Changes**: Avoid breaking changes without versioning
- **Verbs in URLs**: Don't use verbs (`/getPatient` ❌, use `/patients/{id}` ✅)
- **Undocumented Fields**: Don't add fields without updating spec
- **Missing Validation**: Don't skip validation rules
- **No Error Docs**: Don't forget to document error responses

---

## Quick Reference

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal error |

### Spec Organization

```yaml
openapi: 3.0.3
info: { ... }
servers: [ ... ]
tags: [ ... ]
paths: { ... }
components:
  schemas: { ... }
  responses: { ... }
  parameters: { ... }
  securitySchemes: { ... }
```

---

## Additional Resources

For detailed examples and patterns, see:

- [schemas.md](./references/schemas.md) - Complete schema definitions and component examples
- [endpoints.md](./references/endpoints.md) - CRUD endpoint patterns and examples
- [advanced.md](./references/advanced.md) - Pagination, security, multi-tenancy patterns

---

## Related Skills

- **Repository & OpenAPI Integration** - Frontend data access
- **NestJS Repository Service** - Backend implementation
- **Feature Module Management** - Project organization
