# OpenAPI Endpoint Patterns

Complete CRUD endpoint examples and patterns for OpenAPI specifications.

---

## CRUD Endpoints

### GET All (List)

```yaml
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
      - $ref: "#/components/parameters/PageParam"
      - $ref: "#/components/parameters/LimitParam"
      - $ref: "#/components/parameters/SearchParam"
    responses:
      "200":
        description: Successful response
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
      "401":
        $ref: "#/components/responses/UnauthorizedError"
      "500":
        $ref: "#/components/responses/ServerError"
```

### GET by ID

```yaml
/patients/{id}:
  get:
    tags:
      - Patients
    summary: Get patient by ID
    operationId: getPatientById
    security:
      - BearerAuth: []
    parameters:
      - $ref: "#/components/parameters/IdParam"
    responses:
      "200":
        description: Successful response
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Patient"
      "404":
        $ref: "#/components/responses/NotFoundError"
      "401":
        $ref: "#/components/responses/UnauthorizedError"
```

### POST (Create)

```yaml
/patients:
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
      "401":
        $ref: "#/components/responses/UnauthorizedError"
```

### PUT (Update)

```yaml
/patients/{id}:
  put:
    tags:
      - Patients
    summary: Update patient
    operationId: updatePatient
    security:
      - BearerAuth: []
    parameters:
      - $ref: "#/components/parameters/IdParam"
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
      "400":
        $ref: "#/components/responses/BadRequestError"
      "404":
        $ref: "#/components/responses/NotFoundError"
      "401":
        $ref: "#/components/responses/UnauthorizedError"
```

### DELETE

```yaml
/patients/{id}:
  delete:
    tags:
      - Patients
    summary: Delete patient
    operationId: deletePatient
    security:
      - BearerAuth: []
    parameters:
      - $ref: "#/components/parameters/IdParam"
    responses:
      "204":
        description: Patient deleted successfully
      "404":
        $ref: "#/components/responses/NotFoundError"
      "401":
        $ref: "#/components/responses/UnauthorizedError"
```

---

## Multi-File Endpoint Structure

### Main Spec

```yaml
# libs/api/openapi/spec.yaml
paths:
  /patients:
    $ref: "./paths/patients.yaml"
  /patients/{id}:
    $ref: "./paths/patients-id.yaml"
```

### Path File - Collection

```yaml
# libs/api/openapi/paths/patients.yaml
get:
  tags: [Patients]
  summary: Get all patients
  operationId: getAllPatients
  security:
    - BearerAuth: []
  parameters:
    - $ref: "../components/parameters/Page.yaml"
    - $ref: "../components/parameters/Limit.yaml"
  responses:
    "200":
      description: OK
      content:
        application/json:
          schema:
            type: array
            items:
              $ref: "../components/schemas/Patient.yaml"

post:
  tags: [Patients]
  summary: Create patient
  operationId: createPatient
  security:
    - BearerAuth: []
  requestBody:
    required: true
    content:
      application/json:
        schema:
          $ref: "../components/schemas/CreatePatientDto.yaml"
  responses:
    "201":
      description: Created
      content:
        application/json:
          schema:
            $ref: "../components/schemas/Patient.yaml"
```

### Path File - Single Resource

```yaml
# libs/api/openapi/paths/patients-id.yaml
get:
  tags: [Patients]
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
      $ref: "../components/responses/PatientResponse.yaml"
    "404":
      $ref: "../components/responses/NotFound.yaml"

put:
  tags: [Patients]
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
          $ref: "../components/schemas/UpdatePatientDto.yaml"
  responses:
    "200":
      $ref: "../components/responses/PatientResponse.yaml"

delete:
  tags: [Patients]
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
      description: No Content
```

---

## Special Endpoints

### Health Check

```yaml
/health:
  get:
    tags:
      - System
    summary: Health check
    operationId: getHealth
    responses:
      "200":
        description: Service is healthy
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: "ok"
                timestamp:
                  type: string
                  format: date-time
```

### Search

```yaml
/patients/search:
  get:
    tags:
      - Patients
    summary: Search patients
    operationId: searchPatients
    security:
      - BearerAuth: []
    parameters:
      - name: q
        in: query
        required: true
        schema:
          type: string
        description: Search query
      - name: fields
        in: query
        schema:
          type: array
          items:
            type: string
            enum: [firstName, lastName, email]
        description: Fields to search in
    responses:
      "200":
        description: Search results
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/Patient"
```

### Bulk Operations

```yaml
/patients/bulk:
  post:
    tags:
      - Patients
    summary: Create multiple patients
    operationId: bulkCreatePatients
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: array
            items:
              $ref: "#/components/schemas/CreatePatientDto"
    responses:
      "201":
        description: Patients created
        content:
          application/json:
            schema:
              type: object
              properties:
                created:
                  type: array
                  items:
                    $ref: "#/components/schemas/Patient"
                failed:
                  type: array
                  items:
                    type: object
                    properties:
                      index:
                        type: integer
                      error:
                        type: string
```
