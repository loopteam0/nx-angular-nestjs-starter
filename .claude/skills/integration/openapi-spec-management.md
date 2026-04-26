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

Guideline:
- Keep `spec.yaml` as the single entrypoint for validation/bundling/codegen.
- Split `paths/*` by resource (e.g. `patients.yaml`, `patients-id.yaml`).
- Split `components/*` into reusable blocks (schemas, parameters, responses).

### Basic Structure

```yaml
openapi: 3.0.3
info:
  title: School Management System API
  description: SMS API (multi-school tenancy optional)
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com

servers:
  - url: http://localhost:3000/api
    description: Development server
  - url: https://api.example.com
    description: Production server

tags:
  - name: Patients
    description: Patient management endpoints
  - name: Appointments
    description: Appointment scheduling endpoints
  - name: Prescriptions
    description: Prescription management endpoints

paths:
  # Prefer multi-file refs for each path
  /patients:
    $ref: "./paths/patients.yaml"
  /patients/{id}:
    $ref: "./paths/patients-id.yaml"

components:
  schemas:
    # Prefer multi-file refs for schemas
    Patient:
      $ref: "./components/schemas/Patient.yaml"
  securitySchemes:
    # Auth schemes defined here

### Minimal Multi-File Example

`spec.yaml`

```yaml
paths:
  /health:
    $ref: "./paths/health.yaml"

components:
  schemas:
    HealthResponse:
      $ref: "./components/schemas/HealthResponse.yaml"
```

`paths/health.yaml`

```yaml
get:
  tags: [Health]
  summary: Health check
  operationId: getHealth
  responses:
    "200":
      description: OK
      content:
        application/json:
          schema:
            $ref: "../components/schemas/HealthResponse.yaml"
```
```

---

## Sample Endpoint Definitions

### CRUD Endpoints for Patients

```yaml
paths:
  /patients:
    get:
      tags:
        - Patients
      summary: Get all patients
      description: Retrieve list of all patients for the current tenant
      operationId: getAllPatients
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
        - name: search
          in: query
          schema:
            type: string
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Patient"
        "401":
          $ref: "#/components/responses/UnauthorizedError"
        "500":
          $ref: "#/components/responses/ServerError"

    post:
      tags:
        - Patients
      summary: Create new patient
      description: Create a new patient record
      operationId: createPatient
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreatePatientDto"
      responses:
        "201":
          description: Patient created successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Patient"
        "400":
          $ref: "#/components/responses/BadRequestError"
        "409":
          $ref: "#/components/responses/ConflictError"

  /patients/{id}:
    get:
      tags:
        - Patients
      summary: Get patient by ID
      operationId: getPatientById
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: Successful response
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Patient"
        "404":
          $ref: "#/components/responses/NotFoundError"

    put:
      tags:
        - Patients
      summary: Update patient
      operationId: updatePatient
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UpdatePatientDto"
      responses:
        "200":
          description: Patient updated successfully
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Patient"
        "404":
          $ref: "#/components/responses/NotFoundError"

    delete:
      tags:
        - Patients
      summary: Delete patient
      operationId: deletePatient
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "204":
          description: Patient deleted successfully
        "404":
          $ref: "#/components/responses/NotFoundError"
```

---

## Sample Schema Definitions

```yaml
components:
  schemas:
    Patient:
      type: object
      required:
        - id
        - firstName
        - lastName
        - email
        - phone
        - dateOfBirth
        - status
      properties:
        id:
          type: string
          format: uuid
          example: "123e4567-e89b-12d3-a456-426614174000"
        firstName:
          type: string
          minLength: 2
          maxLength: 100
          example: "John"
        lastName:
          type: string
          minLength: 2
          maxLength: 100
          example: "Doe"
        email:
          type: string
          format: email
          example: "john.doe@example.com"
        phone:
          type: string
          pattern: "^\+?[\d\s\-\(\)]+$"
          example: "+1234567890"
        dateOfBirth:
          type: string
          format: date
          example: "1990-01-15"
        status:
          type: string
          enum: [active, inactive]
          default: active
        medicalHistory:
          type: string
          nullable: true
        allergies:
          type: array
          items:
            type: string
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    CreatePatientDto:
      type: object
      required:
        - firstName
        - lastName
        - email
        - phone
        - dateOfBirth
      properties:
        firstName:
          type: string
          minLength: 2
          maxLength: 100
        lastName:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
        phone:
          type: string
        dateOfBirth:
          type: string
          format: date
        status:
          type: string
          enum: [active, inactive]
        medicalHistory:
          type: string
        allergies:
          type: array
          items:
            type: string

    UpdatePatientDto:
      type: object
      properties:
        firstName:
          type: string
          minLength: 2
          maxLength: 100
        lastName:
          type: string
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
        phone:
          type: string
        status:
          type: string
          enum: [active, inactive]
        medicalHistory:
          type: string
        allergies:
          type: array
          items:
            type: string

    Error:
      type: object
      required:
        - statusCode
        - message
      properties:
        statusCode:
          type: integer
        message:
          type: string
        error:
          type: string
        timestamp:
          type: string
          format: date-time

  responses:
    UnauthorizedError:
      description: Unauthorized - Invalid or missing authentication
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    NotFoundError:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    BadRequestError:
      description: Bad request - Validation failed
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    ConflictError:
      description: Conflict - Resource already exists
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"
    ServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/Error"

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

---

## Code Generation

### Frontend Client Generation

**Configuration:** `libs/api/openapi/project.json`

```json
{
  "targets": {
    "generate-web-client": {
      "executor": "@nx/workspace:run-commands",
      "options": {
        "command": "openapi-generator-cli generate -i libs/api/openapi/spec.yaml -g typescript-angular -o libs/shared/data-access/src/lib/generated/openapi --additional-properties=ngVersion=21,useSingleRequestParameter=true,providedInRoot=true"
      }
    }
  }
}
```

**Generate Command:**

```bash
nx run api-openapi:generate-web-client
```

**Generated Structure (example):**

```
libs/shared/data-access/src/lib/generated/openapi/
├── api/
│   ├── patient-controller.service.ts
│   ├── appointment-controller.service.ts
│   └── ...
├── model/
│   ├── patient.ts
│   ├── create-patient-dto.ts
│   └── ...
└── index.ts
```

---

## Backend Integration

### NestJS Swagger Setup

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("School Management System API")
    .setDescription("SMS API (multi-school tenancy optional)")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Patients")
    .addTag("Appointments")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // If your app uses a global prefix like `/api`, keep docs under that prefix.
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(3000);
}
bootstrap();
```

Note: this repo does not currently include `@nestjs/swagger` or a docs route; add it only when you commit to OpenAPI generation.

### Export OpenAPI Spec from NestJS

```bash
# Optional: export spec from NestJS decorators
# Add a script/target first, then run via pnpm.
# Example (placeholder): pnpm nest swagger export docs/openapi/spec.yaml
```

---

## Best Practices

### ✅ DO

- **Versioning**: Include version in API path (`/api/v1/patients`)
- **Consistent Naming**: Use plural nouns for collections (`/patients`, not `/patient`)
- **HTTP Methods**: Use proper HTTP verbs (GET, POST, PUT, DELETE)
- **Status Codes**: Return appropriate HTTP status codes
- **Pagination**: Support pagination for list endpoints
- **Filtering**: Allow filtering and search
- **Error Responses**: Standardize error response format
- **Security**: Define security schemes
- **Examples**: Provide examples for all schemas
- **Descriptions**: Add clear descriptions for all endpoints
- **Required Fields**: Mark required fields explicitly
- **Validation**: Define validation rules (min/max, pattern, enum)

### ❌ DON"T

- **Breaking Changes**: Avoid breaking changes without versioning
- **Verbs in URLs**: Don"t use verbs (`/getPatient` ❌, use `/patients/{id}` ✅)
- **Undocumented Fields**: Don"t add fields without updating spec
- **Missing Validation**: Don"t skip validation rules
- **Inconsistent Types**: Don"t use inconsistent data types
- **No Error Docs**: Don"t forget to document error responses
- **Hardcoded Values**: Don"t hardcode URLs or credentials

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
# Using Swagger CLI
swagger-cli validate libs/api/openapi/spec.yaml

# Optional: bundle to a single file (useful for publishing/debugging)
swagger-cli bundle libs/api/openapi/spec.yaml --outfile dist/openapi/bundled.yaml --type yaml

# Using online validator
# https://editor.swagger.io/
```

### 3. Generate Frontend Client

```bash
nx run api-openapi:generate-web-client
```

### 4. Update Backend

```typescript
// Update DTOs to match spec
// Update controllers to match endpoints
// Update Swagger decorators
```

### 5. Commit Changes

```bash
git add libs/api/openapi/spec.yaml libs/api/openapi/paths libs/api/openapi/components libs/shared/data-access/src/lib/generated/openapi
git commit -m "feat(api): add patient search endpoint"
```

---

## Common Schemas

### Pagination

```yaml
PaginatedResponse:
  type: object
  properties:
    data:
      type: array
      items:
        type: object
    total:
      type: integer
    page:
      type: integer
    pageSize:
      type: integer
    totalPages:
      type: integer
```

### Timestamps

```yaml
Timestamps:
  type: object
  properties:
    createdAt:
      type: string
      format: date-time
    updatedAt:
      type: string
      format: date-time
    deletedAt:
      type: string
      format: date-time
      nullable: true
```

### Multi-Tenant Headers

```yaml
parameters:
  TenantHeader:
    name: X-Tenant-ID
    in: header
    required: true
    schema:
      type: string
    description: Tenant identifier
```

---

## Related Skills

- Repository & OpenAPI Integration (Frontend)
- NestJS Microservice Architecture (Backend)
- Feature Management

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
| 404 | Not Found | Resource doesn"t exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable | Business logic error |
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
