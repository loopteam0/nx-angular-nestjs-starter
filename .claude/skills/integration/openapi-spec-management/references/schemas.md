# OpenAPI Schema Definitions

Complete schema examples and component patterns for OpenAPI specifications.

---

## Entity Schemas

### Complete Entity Example

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
          pattern: "^\\+?[\\d\\s\\-\\(\\)]+$"
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
```

### Create DTO

```yaml
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
```

### Update DTO

```yaml
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
```

---

## Common Schemas

### Error Response

```yaml
Error:
  type: object
  required:
    - statusCode
    - message
  properties:
    statusCode:
      type: integer
      example: 400
    message:
      type: string
      example: "Validation failed"
    error:
      type: string
      example: "Bad Request"
    timestamp:
      type: string
      format: date-time
      example: "2026-01-23T10:30:00Z"
```

### Pagination Response

```yaml
PaginatedResponse:
  type: object
  properties:
    data:
      type: array
      items:
        type: object
    meta:
      type: object
      properties:
        total:
          type: integer
          example: 100
        page:
          type: integer
          example: 1
        pageSize:
          type: integer
          example: 10
        totalPages:
          type: integer
          example: 10
```

### Timestamps Mixin

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

---

## Response Components

### Standard Responses

```yaml
components:
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
```

---

## Security Schemes

### JWT Bearer Auth

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token authentication

# Apply globally
security:
  - BearerAuth: []
```

### API Key

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

---

## Parameter Components

### Common Parameters

```yaml
components:
  parameters:
    PageParam:
      name: page
      in: query
      schema:
        type: integer
        default: 1
        minimum: 1
      description: Page number
    
    LimitParam:
      name: limit
      in: query
      schema:
        type: integer
        default: 10
        minimum: 1
        maximum: 100
      description: Items per page
    
    SearchParam:
      name: search
      in: query
      schema:
        type: string
      description: Search term
    
    IdParam:
      name: id
      in: path
      required: true
      schema:
        type: string
        format: uuid
      description: Resource ID
```

---

## Validation Patterns

### String Validation

```yaml
email:
  type: string
  format: email
  example: "user@example.com"

phone:
  type: string
  pattern: "^\\+?[\\d\\s\\-\\(\\)]+$"
  example: "+1-555-0123"

url:
  type: string
  format: uri
  example: "https://example.com"

uuid:
  type: string
  format: uuid
  example: "123e4567-e89b-12d3-a456-426614174000"
```

### Number Validation

```yaml
age:
  type: integer
  minimum: 0
  maximum: 150
  example: 25

price:
  type: number
  format: float
  minimum: 0
  example: 99.99

percentage:
  type: number
  minimum: 0
  maximum: 100
  example: 75.5
```

### Array Validation

```yaml
tags:
  type: array
  items:
    type: string
  minItems: 1
  maxItems: 10
  uniqueItems: true
  example: ["tag1", "tag2"]
```

### Enum Validation

```yaml
status:
  type: string
  enum:
    - draft
    - published
    - archived
  default: draft
  example: "published"
```
