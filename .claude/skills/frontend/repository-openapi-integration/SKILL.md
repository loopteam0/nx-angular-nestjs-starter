---
name: repository-openapi-integration
description: Implements the Repository pattern in Angular using HttpClient or OpenAPI-generated clients with RxJS operators, error handling, and type-safe responses. Note that this workspace does not currently include OpenAPI specs or generated clients - use HttpClient until an OpenAPI toolchain is added. Use when creating repositories, implementing data access layers, or when the user mentions repository pattern, API integration, or data services.
---

# Repository & OpenAPI Integration

**Note**: This workspace does not currently include OpenAPI specs or generated clients. Use `HttpClient` (or another adapter) in repositories until an OpenAPI toolchain is added.

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
- **Repository** uses OpenAPI generated clients when available
- **Repository** returns Observables (NEVER Promises)
- **Repository** handles data transformation
- **Repository** does NOT handle business logic

---

## Base Repository Pattern

```typescript
// libs/shared/data-access/src/lib/base-repository.ts
export abstract class BaseRepository<T> {
  protected abstract apiClient: unknown;

  abstract findAll(): Observable<T[]>;
  abstract findById(id: string): Observable<T>;
  abstract create(entity: Partial<T>): Observable<T>;
  abstract update(id: string, entity: Partial<T>): Observable<T>;
  abstract delete(id: string): Observable<void>;
}
```

---

## Feature Repository Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class EntityRepository extends BaseRepository<Entity> {
  protected readonly apiClient = inject(GeneratedApiClient);

  findAll(): Observable<Entity[]> {
    return this.apiClient.getAllEntities();
  }

  findById(id: string): Observable<Entity> {
    return this.apiClient.getEntityById(id);
  }

  create(dto: CreateDto): Observable<Entity> {
    return this.apiClient.createEntity(dto);
  }

  update(id: string, dto: UpdateDto): Observable<Entity> {
    return this.apiClient.updateEntity(id, dto);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.deleteEntity(id);
  }

  // Custom queries
  search(term: string): Observable<Entity[]> {
    return this.apiClient.searchEntities({ query: term });
  }
}
```

---

## Error Handling

```typescript
findById(id: string): Observable<Entity> {
  return this.apiClient.getEntityById(id).pipe(
    catchError((error: HttpErrorResponse) => {
      return throwError(() => this.handleError(error));
    })
  );
}

private handleError(error: HttpErrorResponse): Error {
  if (error.status === 404) return new Error('Entity not found');
  if (error.status === 409) return new Error('Entity already exists');
  if (error.status >= 500) return new Error('Server error');
  return new Error(error.error?.message || 'Unexpected error');
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
- Keep repositories focused on data access

### ❌ DON'T
- Inject `HttpClient` directly (use generated clients)
- Subscribe in repositories (let callers subscribe)
- Add business logic in repositories
- Return Promises (always Observables)
- Ignore error handling
- Use `any` type

---

## Quick Reference

### Common RxJS Operators

| Operator | Purpose |
|----------|---------|
| `map` | Transform data |
| `catchError` | Handle errors |
| `tap` | Side effects (logging) |
| `shareReplay` | Cache and share results |
| `switchMap` | Chain dependent calls |

---

## Additional Resources

For detailed patterns and examples, see:

- [patterns.md](./references/patterns.md) - Data transformation, caching, pagination
- [examples.md](./references/examples.md) - Complete repository implementations
- [testing.md](./references/testing.md) - Unit testing strategies

---

## Related Skills

- **Signal Store State Management** - Stores use repositories
- **OpenAPI Spec Management** - Generate API clients
- **Angular Component Architecture** - Component integration
