---
name: repository-openapi-integration
description: Implements the Repository pattern in Angular using HttpClient or OpenAPI-generated clients with RxJS operators, error handling, and type-safe responses. Note that this workspace does not currently include OpenAPI specs or generated clients - use HttpClient until an OpenAPI toolchain is added. Use when creating repositories, implementing data access layers, or when the user mentions repository pattern, API integration, or data services.
---

# Repository & OpenAPI Integration

**Note**: This workspace does not currently include OpenAPI specs or generated clients. Use `HttpClient` (or another adapter) in repositories until an OpenAPI toolchain is added.

---
- Integrate OpenAPI generated clients
- Handle HTTP communication
- Transform API responses to domain models
- Implement error handling for HTTP requests

## Triggers

- "create repository"
- "add data access"
- "integrate API"
- "fetch data"
- "http client"
- "api client"
- "openapi integration"

---

## Architecture Overview

### Data Flow (CRITICAL)

```
Component → Store → Service → Repository → OpenAPI Client → API
    ↑                              ↓
    └──────────────────────────────┘
        (Observables all the way)
```

**Key Principles:**

- **Repository** is the ONLY layer that talks to HTTP/API
- **Repository** uses OpenAPI generated clients when available; otherwise use `HttpClient` directly
- **Repository** returns Observables (NEVER Promises)
- **Repository** handles data transformation
- **Repository** does NOT handle business logic

---

## Base Repository Pattern

### BaseRepository Abstract Class

**Suggested location (create if needed):** `libs/shared/data-access/src/lib/base-repository.ts`

```typescript
import { Observable } from 'rxjs';

export abstract class BaseRepository<T> {
  protected abstract apiClient: unknown; // OpenAPI client or Http adapter

  abstract findAll(): Observable<T[]>;
  abstract findById(id: string): Observable<T>;
  abstract create(entity: Partial<T>): Observable<T>;
  abstract update(id: string, entity: Partial<T>): Observable<T>;
  abstract delete(id: string): Observable<void>;
}
```

---

## Feature Repository Implementation

### Standard Repository Example

**Suggested location:** `libs/web/feature-{feature}/src/lib/repositories/{feature}.repository.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseRepository } from '@sms/data-access';
// If/when OpenAPI clients exist, import them here.
import type { Student, CreateStudentDto, UpdateStudentDto } from '../models';

@Injectable({ providedIn: 'root' })
export class StudentRepository extends BaseRepository<Student> {
  // ✅ Inject your HTTP/OpenAPI adapter
  protected readonly apiClient = null;

  findAll(): Observable<Student[]> {
    return this.apiClient.getAllStudents();
  }

  findById(id: string): Observable<Student> {
    return this.apiClient.getStudentById(id);
  }

  findByEmail(email: string): Observable<Student | null> {
    return this.apiClient.searchStudents({ email }).pipe(
      map(results => results.length > 0 ? results[0] : null)
    );
  }

  create(patient: CreateStudentDto): Observable<Student> {
    return this.apiClient.createStudent(patient);
  }

  update(id: string, patient: UpdateStudentDto): Observable<Student> {
    return this.apiClient.updateStudent(id, patient);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.deleteStudent(id);
  }

  search(searchTerm: string): Observable<Student[]> {
    return this.apiClient.searchStudents({ query: searchTerm });
  }

  // Custom query methods
  findActive(): Observable<Student[]> {
    return this.apiClient.getAllStudents().pipe(
      map(patients => patients.filter(p => p.status === 'active'))
    );
  }

  findByDateRange(startDate: Date, endDate: Date): Observable<Student[]> {
    return this.apiClient.searchStudents({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
  }
}
```

---

## Data Transformation

### Transforming API Responses

```typescript
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class StudentRepository extends BaseRepository<Student> {
  protected readonly apiClient = inject(StudentControllerService);

  // Transform DTO to Domain Model
  findById(id: string): Observable<Student> {
    return this.apiClient.getStudentById(id).pipe(
      map(dto => this.toDomainModel(dto))
    );
  }

  findAll(): Observable<Student[]> {
    return this.apiClient.getAllStudents().pipe(
      map(dtos => dtos.map(dto => this.toDomainModel(dto)))
    );
  }

  // Private transformation method
  private toDomainModel(dto: StudentDto): Student {
    return {
      id: dto.id,
      firstName: dto.first_name,  // Snake case to camel case
      lastName: dto.last_name,
      email: dto.email.toLowerCase(),  // Normalize
      dateOfBirth: new Date(dto.date_of_birth),  // String to Date
      status: dto.status,
      fullName: `${dto.first_name} ${dto.last_name}`,  // Computed field
      age: this.calculateAge(new Date(dto.date_of_birth))  // Derived data
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  // Transform Domain Model to DTO (for create/update)
  create(patient: CreateStudentDto): Observable<Student> {
    const dto = this.toApiDto(patient);
    return this.apiClient.createStudent(dto).pipe(
      map(response => this.toDomainModel(response))
    );
  }

  private toApiDto(patient: Partial<Student>): any {
    return {
      first_name: patient.firstName,
      last_name: patient.lastName,
      email: patient.email,
      date_of_birth: patient.dateOfBirth?.toISOString(),
      status: patient.status
    };
  }
}
```

---

## Error Handling

### Repository-Level Error Handling

```typescript
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class StudentRepository extends BaseRepository<Student> {
  protected readonly apiClient = inject(StudentControllerService);

  findById(id: string): Observable<Student> {
    return this.apiClient.getStudentById(id).pipe(
      catchError((error: HttpErrorResponse) => {
        // Transform HTTP errors to domain errors
        return throwError(() => this.handleError(error));
      })
    );
  }

  create(patient: CreateStudentDto): Observable<Student> {
    return this.apiClient.createStudent(patient).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handleError(error: HttpErrorResponse): Error {
    // Transform to domain-specific errors
    if (error.status === 404) {
      return new Error('Student not found');
    }

    if (error.status === 409) {
      return new Error('Student already exists');
    }

    if (error.status === 422) {
      const validationErrors = error.error?.errors || [];
      return new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    if (error.status === 403) {
      return new Error('Access denied');
    }

    if (error.status >= 500) {
      return new Error('Server error occurred. Please try again later.');
    }

    return new Error(error.error?.message || 'An unexpected error occurred');
  }
}
```

---

## Advanced Patterns

### Caching Pattern

```typescript
import { Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentRepository extends BaseRepository<Student> {
  protected readonly apiClient = inject(StudentControllerService);
  private cache = new Map<string, Observable<Student>>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  findById(id: string, useCache = true): Observable<Student> {
    if (useCache && this.isCacheValid(id)) {
      return this.cache.get(id)!;
    }

    const request$ = this.apiClient.getStudentById(id).pipe(
      tap(() => this.setCacheExpiry(id)),
      shareReplay(1)  // Share result with multiple subscribers
    );

    this.cache.set(id, request$);
    return request$;
  }

  // Invalidate cache on mutations
  update(id: string, patient: UpdateStudentDto): Observable<Student> {
    this.invalidateCache(id);
    return this.apiClient.updateStudent(id, patient);
  }

  delete(id: string): Observable<void> {
    this.invalidateCache(id);
    return this.apiClient.deleteStudent(id);
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCacheExpiry(key: string): void {
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}
```

### Pagination Pattern

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class StudentRepository extends BaseRepository<Student> {
  protected readonly apiClient = inject(StudentControllerService);

  findPage(page: number, pageSize: number): Observable<PaginatedResponse<Student>> {
    return this.apiClient.getStudentsPaginated(page, pageSize).pipe(
      map(response => ({
        data: response.items,
        total: response.totalCount,
        page: response.currentPage,
        pageSize: response.pageSize
      }))
    );
  }

  findAll(): Observable<Student[]> {
    // Load all pages recursively
    return this.loadAllPages(1, 100);
  }

  private loadAllPages(page: number, pageSize: number): Observable<Student[]> {
    return this.findPage(page, pageSize).pipe(
      switchMap(response => {
        const hasMore = page * pageSize < response.total;
        if (hasMore) {
          return this.loadAllPages(page + 1, pageSize).pipe(
            map(nextPages => [...response.data, ...nextPages])
          );
        }
        return of(response.data);
      })
    );
  }
}
```

---

## OpenAPI Client Integration

### Using Generated Clients

**Location:** `libs/data-layer/` (Generated code)

```typescript
// This code is GENERATED from OpenAPI spec
// DO NOT modify manually

@Injectable({ providedIn: 'root' })
export class StudentControllerService {
  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<StudentDto[]> {
    return this.http.get<StudentDto[]>('/api/patients');
  }

  getStudentById(id: string): Observable<StudentDto> {
    return this.http.get<StudentDto>(`/api/patients/${id}`);
  }

  createStudent(dto: CreateStudentDto): Observable<StudentDto> {
    return this.http.post<StudentDto>('/api/patients', dto);
  }

  updateStudent(id: string, dto: UpdateStudentDto): Observable<StudentDto> {
    return this.http.put<StudentDto>(`/api/patients/${id}`, dto);
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`/api/patients/${id}`);
  }
}
```

### Repository Wraps Generated Client

```typescript
@Injectable({ providedIn: 'root' })
export class StudentRepository extends BaseRepository<Student> {
  // ✅ Use generated client
  protected readonly apiClient = inject(StudentControllerService);

  // ❌ DON'T inject HttpClient directly
  // private readonly http = inject(HttpClient);

  findAll(): Observable<Student[]> {
    // ✅ Delegate to generated client
    return this.apiClient.getAllStudents();

    // ❌ DON'T make HTTP calls directly
    // return this.http.get<Student[]>('/api/patients');
  }
}
```

---

## Best Practices

### ✅ DO

- Use `inject()` for dependency injection
- Extend `BaseRepository<T>` for consistency
- Use OpenAPI generated clients exclusively
- Return Observables (never Promises)
- Handle errors at repository level
- Transform DTOs to domain models
- Use type-safe interfaces
- Implement caching when appropriate
- Keep repositories focused on data access

### ❌ DON'T

- Inject `HttpClient` directly (use generated clients)
- Subscribe in repositories (let callers subscribe)
- Add business logic in repositories
- Return Promises (always Observables)
- Ignore error handling
- Mix concerns (keep it focused on data access)
- Use `any` type
- Make repositories stateful

---

## Repository Structure Checklist

```typescript
@Injectable({ providedIn: 'root' })  // ✅ Singleton
export class FeatureRepository extends BaseRepository<Entity> {
  // ✅ Inject OpenAPI client
  protected readonly apiClient = inject(GeneratedApiClient);

  // ✅ CRUD operations
  findAll(): Observable<Entity[]> { ... }
  findById(id: string): Observable<Entity> { ... }
  create(dto: CreateDto): Observable<Entity> { ... }
  update(id: string, dto: UpdateDto): Observable<Entity> { ... }
  delete(id: string): Observable<void> { ... }

  // ✅ Custom queries
  search(term: string): Observable<Entity[]> { ... }
  findActive(): Observable<Entity[]> { ... }

  // ✅ Private helpers
  private toDomainModel(dto: Dto): Entity { ... }
  private handleError(error: HttpErrorResponse): Error { ... }
}
```

---

## Testing Repositories

### Unit Test Example

```typescript
import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentRepository } from './patient.repository';

// If/when you have a generated OpenAPI client, inject it behind an interface/token.
type StudentApiClient = {
  getAllStudents: (...args: any[]) => any;
  getStudentById: (...args: any[]) => any;
  createStudent: (...args: any[]) => any;
};

describe('StudentRepository', () => {
  let repository: StudentRepository;
  let apiClient: StudentApiClient;

  beforeEach(() => {
    apiClient = {
      getAllStudents: vi.fn(),
      getStudentById: vi.fn(),
      createStudent: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        StudentRepository,
        { provide: 'StudentApiClient', useValue: apiClient }
      ]
    });

    repository = TestBed.inject(StudentRepository);
  });

  it('should fetch all patients', (done) => {
    const mockStudents = [
      { id: '1', firstName: 'John', lastName: 'Doe' }
    ];
    apiClient.getAllStudents.mockReturnValue(of(mockStudents));

    repository.findAll().subscribe(patients => {
      expect(patients).toEqual(mockStudents);
      expect(apiClient.getAllStudents).toHaveBeenCalled();
      done();
    });
  });

  it('should handle errors', (done) => {
    const error = new HttpErrorResponse({ status: 404 });
    apiClient.getStudentById.mockReturnValue(throwError(() => error));

    repository.findById('1').subscribe({
      error: (err) => {
        expect(err.message).toBe('Student not found');
        done();
      }
    });
  });
});
```

---

## Integration with Services

### Service Layer Uses Repository

```typescript
@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly repository = inject(StudentRepository);

  // Service delegates to repository
  loadStudents(): Observable<Student[]> {
    return this.repository.findAll();
  }

  getStudentById(id: string): Observable<Student> {
    return this.repository.findById(id);
  }

  // Service can add business logic
  loadActiveStudents(): Observable<Student[]> {
    return this.repository.findAll().pipe(
      map(patients => patients.filter(p => p.status === 'active')),
      map(patients => patients.sort((a, b) => a.lastName.localeCompare(b.lastName)))
    );
  }
}
```

---

## Related Skills

- **Signal Store State Management** - Stores use repositories via services
- **OpenAPI Spec Management** - Generate API clients
- **Angular Component Architecture** - Components use services that use repositories

---

## Quick Reference

### Repository Template

```typescript
@Injectable({ providedIn: 'root' })
export class EntityRepository extends BaseRepository<Entity> {
  protected readonly apiClient = inject(GeneratedClient);

  findAll(): Observable<Entity[]> {
    return this.apiClient.getAll();
  }

  findById(id: string): Observable<Entity> {
    return this.apiClient.getById(id);
  }

  create(dto: CreateDto): Observable<Entity> {
    return this.apiClient.create(dto);
  }

  update(id: string, dto: UpdateDto): Observable<Entity> {
    return this.apiClient.update(id, dto);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete(id);
  }
}
```

### Common RxJS Operators

| Operator | Purpose |
|----------|---------|
| `map` | Transform data |
| `catchError` | Handle errors |
| `tap` | Side effects (logging) |
| `shareReplay` | Cache and share results |
| `switchMap` | Chain dependent calls |
| `filter` | Filter items |
