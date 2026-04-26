# OpenAPI Advanced Patterns

Advanced patterns for pagination, security, multi-tenancy, and backend integration.

---

## Pagination Patterns

### Offset-Based Pagination

```yaml
parameters:
  - name: page
    in: query
    schema:
      type: integer
      default: 1
      minimum: 1
  - name: limit
    in: query
    schema:
      type: integer
      default: 10
      minimum: 1
      maximum: 100

responses:
  "200":
    content:
      application/json:
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                $ref: "#/components/schemas/Patient"
            meta:
              type: object
              properties:
                total:
                  type: integer
                page:
                  type: integer
                pageSize:
                  type: integer
                totalPages:
                  type: integer
```

### Cursor-Based Pagination

```yaml
parameters:
  - name: cursor
    in: query
    schema:
      type: string
    description: Cursor for next page
  - name: limit
    in: query
    schema:
      type: integer
      default: 20

responses:
  "200":
    content:
      application/json:
        schema:
          type: object
          properties:
            data:
              type: array
              items:
                $ref: "#/components/schemas/Patient"
            pagination:
              type: object
              properties:
                nextCursor:
                  type: string
                  nullable: true
                hasMore:
                  type: boolean
```

---

## Multi-Tenancy Patterns

### Tenant Header

```yaml
components:
  parameters:
    TenantHeader:
      name: X-Tenant-ID
      in: header
      required: true
      schema:
        type: string
        format: uuid
      description: Tenant identifier

# Use in endpoints
paths:
  /patients:
    get:
      parameters:
        - $ref: "#/components/parameters/TenantHeader"
```

### Tenant Path Parameter

```yaml
/tenants/{tenantId}/patients:
  get:
    parameters:
      - name: tenantId
        in: path
        required: true
        schema:
          type: string
          format: uuid
```

---

## Backend Integration

### NestJS Swagger Setup

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('School Management System API')
    .setDescription('SMS API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Patients')
    .addTag('Health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
bootstrap();
```

### Controller Decorators

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientDto, CreatePatientDto, UpdatePatientDto } from './dto';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientController {
  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'Success', type: [PatientDto] })
  async findAll(): Promise<PatientDto[]> {
    // Implementation
  }

  @Post()
  @ApiOperation({ summary: 'Create patient' })
  @ApiResponse({ status: 201, description: 'Created', type: PatientDto })
  async create(@Body() dto: CreatePatientDto): Promise<PatientDto> {
    // Implementation
  }
}
```

### DTO Decorators

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'John', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsEnum(['active', 'inactive'])
  status?: string;
}
```

---

## Authentication & Authorization

### JWT Bearer Authentication

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT token authentication. 
        Include token in Authorization header: `Bearer <token>`

# Apply globally
security:
  - BearerAuth: []

# Override for public endpoints
paths:
  /health:
    get:
      security: []  # No auth required
```

### OAuth 2.0

```yaml
components:
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://auth.example.com/oauth/authorize
          tokenUrl: https://auth.example.com/oauth/token
          scopes:
            read:patients: Read patient data
            write:patients: Modify patient data
```

---

## File Upload

```yaml
/patients/{id}/avatar:
  post:
    tags:
      - Patients
    summary: Upload patient avatar
    operationId: uploadAvatar
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
        multipart/form-data:
          schema:
            type: object
            properties:
              file:
                type: string
                format: binary
    responses:
      "200":
        description: Avatar uploaded
        content:
          application/json:
            schema:
              type: object
              properties:
                url:
                  type: string
                  format: uri
```

---

## Webhooks

```yaml
webhooks:
  patientCreated:
    post:
      summary: Patient created webhook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                event:
                  type: string
                  example: "patient.created"
                data:
                  $ref: "#/components/schemas/Patient"
                timestamp:
                  type: string
                  format: date-time
      responses:
        "200":
          description: Webhook received
```

---

## Validation Tools

### Swagger CLI

```bash
# Validate spec
swagger-cli validate libs/api/openapi/spec.yaml

# Bundle to single file
swagger-cli bundle libs/api/openapi/spec.yaml \
  --outfile dist/openapi/bundled.yaml \
  --type yaml
```

### Online Validator

```
https://editor.swagger.io/
```

### Nx Targets

```json
{
  "targets": {
    "validate": {
      "executor": "@nx/workspace:run-commands",
      "options": {
        "command": "swagger-cli validate libs/api/openapi/spec.yaml"
      }
    },
    "bundle": {
      "executor": "@nx/workspace:run-commands",
      "options": {
        "command": "swagger-cli bundle libs/api/openapi/spec.yaml -o dist/openapi/bundled.yaml -t yaml"
      }
    }
  }
}
```

---

## Code Generation Configuration

### OpenAPI Generator Config

```yaml
# openapitools.json
{
  "generator-cli": {
    "version": "7.0.0",
    "generators": {
      "angular": {
        "generatorName": "typescript-angular",
        "output": "libs/shared/data-access/src/lib/generated/openapi",
        "glob": "libs/api/openapi/spec.yaml",
        "additionalProperties": {
          "ngVersion": "21",
          "useSingleRequestParameter": true,
          "providedInRoot": true
        }
      },
      "nestjs": {
        "generatorName": "nodejs-nestjs-server",
        "output": "apps/api/src/generated/openapi-server",
        "glob": "libs/api/openapi/spec.yaml"
      }
    }
  }
}
```
