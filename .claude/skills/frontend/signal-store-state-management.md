---
name: signal-store-state-management
description: Manages Angular state using signals and optional @ngrx/signals with entity helpers, computed signals, and service integration. Note that this workspace does not currently include @ngrx/signals - treat SignalStore examples as optional patterns. Use when managing state, working with signals, or when the user mentions state management, reactive patterns, or store implementation.
---

# Signal Store State Management

**Note**: This workspace does not currently include `@ngrx/signals` or PrimeNG. Treat the `signalStore` examples as optional patterns.

---
- Manage entity collections
- Implement optimistic updates
- Handle loading and error states
- Create computed/derived state
- Integrate stores with services

## Triggers

- "create store"
- "state management"
- "add signal store"
- "manage state"
- "ngrx signals"
- "entity store"
- "optimistic update"

---

## Core Architecture

### Data Flow (CRITICAL)

```
Component → Store → Service → Repository → API
    ↑         ↓
    └─────────┘
   (Signals)
```

**Key Principles:**

- **Components** read from store signals, call store methods
- **Store** subscribes to service observables, manages state
- **Services** return observables (never subscribe)
- **Repositories** call OpenAPI generated clients

---

## Signal Store Structure

### Basic Store Template

```typescript
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState
} from '@ngrx/signals';
import {
  withEntities,
  addEntity,
  updateEntity,
  removeEntity,
  setAllEntities
} from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { PatientService } from '../services/patient.service';
// Optional UI notification adapter (PrimeNG not included in this repo)

// Entity interface
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive';
}

// Additional state
interface PatientState {
  loading: boolean;
  error: string | null;
  selectedPatientId: string | null;
  searchTerm: string;
}

// Store definition
export const PatientStore = signalStore(
  { providedIn: 'root' },  // ✅ Singleton store

  // Entity state
  withEntities<Patient>(),

  // Additional state
  withState<PatientState>({
    loading: false,
    error: null,
    selectedPatientId: null,
    searchTerm: ''
  }),

  // Computed signals
  withComputed((store) => ({
    selectedPatient: computed(() => {
      const id = store.selectedPatientId();
      return id ? store.entityMap()[id] : null;
    }),

    activePatients: computed(() =>
      store.entities().filter(p => p.status === 'active')
    ),

    filteredPatients: computed(() => {
      const term = store.searchTerm().toLowerCase();
      if (!term) return store.entities();

      return store.entities().filter(p =>
        p.firstName.toLowerCase().includes(term) ||
        p.lastName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    }),

    totalPatients: computed(() => store.entities().length),
    hasError: computed(() => store.error() !== null)
  })),

  // Methods
  withMethods((
    store,
    service = inject(PatientService),
    // messageService = inject(MessageService)
  ) => ({

    // Load all entities
    loadPatients(): void {
      patchState(store, { loading: true, error: null });

      service.loadPatients()
        .pipe(
          tap(patients => {
            patchState(store, setAllEntities(patients), { loading: false });
          }),
          catchError(error => {
            patchState(store, { loading: false, error: error.message });
            // Notify the user via your chosen UI mechanism
            return of([]);
          })
        )
        .subscribe();
    },

    // Create with optimistic update
    createPatient(patient: CreatePatientDto): void {
      const tempId = crypto.randomUUID();
      const optimisticPatient = { ...patient, id: tempId };

      // Optimistic update
      patchState(store, addEntity(optimisticPatient));

      service.createPatient(patient)
        .pipe(
          tap(created => {
            patchState(store, updateEntity({ id: tempId, changes: created }));
            // Notify success
          }),
          catchError(error => {
            // Rollback on error
            patchState(store, removeEntity(tempId));
            // Notify failure
            return EMPTY;
          })
        )
        .subscribe();
    },

    // Update with optimistic update
    updatePatient(id: string, patient: UpdatePatientDto): void {
      const currentState = store.entityMap()[id];

      // Optimistic update
      patchState(store, updateEntity({ id, changes: patient }));

      service.updatePatient(id, patient)
        .pipe(
          tap(updated => {
            patchState(store, updateEntity({ id, changes: updated }));
            messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Patient updated successfully'
            });
          }),
          catchError(error => {
            // Rollback on error
            if (currentState) {
              patchState(store, updateEntity({ id, changes: currentState }));
            }
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update patient'
            });
            return EMPTY;
          })
        )
        .subscribe();
    },

    // Delete entity
    deletePatient(id: string): void {
      patchState(store, { loading: true });

      service.deletePatient(id)
        .pipe(
          tap(() => {
            patchState(store, removeEntity(id), { loading: false });
            messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Patient deleted successfully'
            });
          }),
          catchError(error => {
            patchState(store, { loading: false });
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete patient'
            });
            return EMPTY;
          })
        )
        .subscribe();
    },

    // UI state mutations
    selectPatient(id: string | null): void {
      patchState(store, { selectedPatientId: id });
    },

    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    clearSearch(): void {
      patchState(store, { searchTerm: '' });
    },

    reset(): void {
      patchState(store, {
        entities: [],
        ids: [],
        entityMap: {},
        loading: false,
        error: null,
        selectedPatientId: null,
        searchTerm: ''
      });
    }
  }))
);
```

---

## Component Integration

### Using Store in Components

```typescript
import { Component, inject } from '@angular/core';
import { PatientStore } from '../store/patient.store';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  template: `
    <!-- Read from store signals -->
    @if (loading()) {
      <p-progressSpinner />
    }

    @for (patient of patients(); track patient.id) {
      <div>{{ patient.firstName }}</div>
    }

    <p-button
      label="Add Patient"
      (onClick)="onCreate()">
    </p-button>
  `
})
export class PatientListComponent {
  // Inject store
  private readonly store = inject(PatientStore);

  // Expose store signals
  protected readonly patients = this.store.filteredPatients;
  protected readonly loading = this.store.loading;

  constructor() {
    // Initialize data
    this.store.loadPatients();
  }

  protected onCreate(): void {
    // Call store methods
    this.store.createPatient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });
  }
}
```

---

## Store Features

### 1. withEntities - Entity Management

```typescript
withEntities<Patient>()
```

**Provides:**

- `entities()` - Array of all entities
- `entityMap()` - Record<id, entity> for fast lookup
- `ids()` - Array of entity IDs

**Entity Operations:**

- `setAllEntities(entities)` - Replace all entities
- `addEntity(entity)` - Add single entity
- `addEntities(entities)` - Add multiple entities
- `updateEntity({ id, changes })` - Update entity
- `removeEntity(id)` - Remove single entity
- `removeEntities(ids)` - Remove multiple entities

### 2. withComputed - Derived State

```typescript
withComputed((store) => ({
  // Filter entities
  activeItems: computed(() =>
    store.entities().filter(e => e.status === 'active')
  ),

  // Aggregate
  totalCount: computed(() => store.entities().length),

  // Select by ID
  selectedItem: computed(() => {
    const id = store.selectedId();
    return id ? store.entityMap()[id] : null;
  }),

  // Complex derivation
  sortedItems: computed(() =>
    [...store.entities()].sort((a, b) => a.name.localeCompare(b.name))
  )
}))
```

### 3. withMethods - Actions

```typescript
withMethods((store, service = inject(Service)) => ({
  // Load data
  load(): void {
    patchState(store, { loading: true });
    service.getAll().pipe(
      tap(data => patchState(store, setAllEntities(data), { loading: false }))
    ).subscribe();
  },

  // Update UI state
  selectItem(id: string): void {
    patchState(store, { selectedId: id });
  }
}))
```

---

## Optimistic Updates Pattern

### With Rollback on Error

```typescript
createItem(item: CreateDto): void {
  const tempId = crypto.randomUUID();
  const optimisticItem = { ...item, id: tempId };

  // 1. Immediate UI update
  patchState(store, addEntity(optimisticItem));

  // 2. Make API call
  service.create(item)
    .pipe(
      tap(created => {
        // 3. Replace temp with real data
        patchState(store, updateEntity({ id: tempId, changes: created }));
      }),
      catchError(error => {
        // 4. Rollback on error
        patchState(store, removeEntity(tempId));
        messageService.add({
          severity: 'error',
          detail: 'Creation failed'
        });
        return EMPTY;
      })
    )
    .subscribe();
}

updateItem(id: string, changes: UpdateDto): void {
  // Save current state
  const currentState = store.entityMap()[id];

  // 1. Immediate UI update
  patchState(store, updateEntity({ id, changes }));

  // 2. Make API call
  service.update(id, changes)
    .pipe(
      tap(updated => {
        // 3. Confirm with real data
        patchState(store, updateEntity({ id, changes: updated }));
      }),
      catchError(error => {
        // 4. Rollback to previous state
        if (currentState) {
          patchState(store, updateEntity({ id, changes: currentState }));
        }
        messageService.add({
          severity: 'error',
          detail: 'Update failed'
        });
        return EMPTY;
      })
    )
    .subscribe();
}
```

---

## Error Handling

### Standard Error Pattern

```typescript
loadData(): void {
  patchState(store, { loading: true, error: null });

  service.getData()
    .pipe(
      tap(data => {
        patchState(store, setAllEntities(data), { loading: false });
      }),
      catchError(error => {
        const errorMessage = error.message || 'Unknown error occurred';
        patchState(store, { loading: false, error: errorMessage });

        // Show user-friendly notification
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: getUserFriendlyMessage(error),
          life: 5000
        });

        // Return empty array to complete the stream
        return of([]);
      })
    )
    .subscribe();
}

function getUserFriendlyMessage(error: any): string {
  if (error.status === 404) return 'Data not found';
  if (error.status === 403) return 'Access denied';
  if (error.status === 500) return 'Server error occurred';
  return 'An unexpected error occurred';
}
```

---

## Loading States

### Granular Loading States

```typescript
interface State {
  loading: boolean;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  loadingDelete: boolean;
}

withState<State>({
  loading: false,
  loadingCreate: false,
  loadingUpdate: false,
  loadingDelete: false
})

// Usage
createItem(item: CreateDto): void {
  patchState(store, { loadingCreate: true });

  service.create(item)
    .pipe(
      tap(created => {
        patchState(store, addEntity(created), { loadingCreate: false });
      })
    )
    .subscribe();
}
```

---

## Best Practices

### ✅ DO

- Use `providedIn: 'root'` for singleton stores
- Always handle errors with `catchError`
- Use optimistic updates for better UX
- Implement rollback on errors
- Use computed signals for derived state
- Show user notifications for actions
- Use `patchState` for all state mutations
- Keep stores focused on single feature

### ❌ DON'T

- Subscribe in services (only in stores)
- Mutate state directly (always use `patchState`)
- Store derived data (use `computed` instead)
- Mix multiple features in one store
- Forget to handle loading states
- Ignore error handling
- Create multiple store instances

---

## Common Patterns

### Search/Filter Pattern

```typescript
interface State {
  searchTerm: string;
  filterBy: 'all' | 'active' | 'inactive';
}

withComputed((store) => ({
  filteredEntities: computed(() => {
    let result = store.entities();

    // Filter by status
    const filter = store.filterBy();
    if (filter !== 'all') {
      result = result.filter(e => e.status === filter);
    }

    // Filter by search term
    const term = store.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term)
      );
    }

    return result;
  })
}))

withMethods((store) => ({
  setSearchTerm(term: string): void {
    patchState(store, { searchTerm: term });
  },
  setFilter(filter: 'all' | 'active' | 'inactive'): void {
    patchState(store, { filterBy: filter });
  }
}))
```

### Pagination Pattern

```typescript
interface State {
  page: number;
  pageSize: number;
  total: number;
}

withComputed((store) => ({
  paginatedEntities: computed(() => {
    const page = store.page();
    const size = store.pageSize();
    const start = (page - 1) * size;
    const end = start + size;
    return store.entities().slice(start, end);
  }),

  totalPages: computed(() =>
    Math.ceil(store.total() / store.pageSize())
  )
}))

withMethods((store, service = inject(Service)) => ({
  loadPage(page: number): void {
    patchState(store, { loading: true, page });

    service.getPage(page, store.pageSize())
      .pipe(
        tap(response => {
          patchState(store, setAllEntities(response.data), {
            total: response.total,
            loading: false
          });
        })
      )
      .subscribe();
  },

  setPageSize(pageSize: number): void {
    patchState(store, { pageSize, page: 1 });
    this.loadPage(1);
  }
}))
```

---

## Store Testing

### Unit Test Example

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PatientStore } from './patient.store';
import { PatientService } from '../services/patient.service';

describe('PatientStore', () => {
  let store: InstanceType<typeof PatientStore>;
  let service: { loadPatients: ReturnType<typeof vi.fn>; createPatient: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = {
      loadPatients: vi.fn(),
      createPatient: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        PatientStore,
        { provide: PatientService, useValue: service }
      ]
    });

    store = TestBed.inject(PatientStore);
    service = TestBed.inject(PatientService) as any;
  });

  it('should load patients successfully', (done) => {
    const mockPatients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' }
    ];
    service.loadPatients.mockReturnValue(of(mockPatients));

    store.loadPatients();

    expect(store.loading()).toBe(false);
    done();
  });

  it('should handle errors gracefully', (done) => {
    service.loadPatients.mockReturnValue(throwError(() => new Error('API Error')));

    store.loadPatients();

    expect(store.error()).toBeTruthy();
    done();
  });
});
```

---

## Related Skills

- **Angular Component Architecture** - For using stores in components
- **Repository & OpenAPI Integration** - For data access layer
- **Angular Testing** - For testing stores

---

## Quick Reference

### Store Structure

```typescript
signalStore(
  { providedIn: 'root' },
  withEntities<T>(),              // Entity management
  withState<S>({ ... }),          // Additional state
  withComputed((store) => ({ ... })),  // Derived state
  withMethods((store, deps) => ({ ... })) // Actions
)
```

### State Operations

| Operation | Method | Usage |
|-----------|--------|-------|
| Set all | `setAllEntities(entities)` | Replace entire collection |
| Add one | `addEntity(entity)` | Add single item |
| Add many | `addEntities(entities)` | Add multiple items |
| Update | `updateEntity({ id, changes })` | Update existing item |
| Remove | `removeEntity(id)` | Delete single item |
| Patch | `patchState(store, { key: value })` | Update state properties |
