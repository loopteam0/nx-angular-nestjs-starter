---
name: signal-store-state-management
description: Manages Angular state using signals and optional @ngrx/signals with entity helpers, computed signals, and service integration. Note that this workspace does not currently include @ngrx/signals - treat SignalStore examples as optional patterns. Use when managing state, working with signals, or when the user mentions state management, reactive patterns, or store implementation.
---

# Signal Store State Management

**Note**: This workspace does not currently include `@ngrx/signals` or PrimeNG. Treat the `signalStore` examples as optional patterns.

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

## Basic Store Structure

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
  setAllEntities
} from '@ngrx/signals/entities';
import { computed, inject } from '@angular/core';

export const MyStore = signalStore(
  { providedIn: 'root' },      // ✅ Singleton store
  
  withEntities<MyEntity>(),    // Entity management
  
  withState({                  // Additional state
    loading: false,
    error: null
  }),
  
  withComputed((store) => ({   // Derived state
    count: computed(() => store.entities().length)
  })),
  
  withMethods((store, service = inject(MyService)) => ({
    load(): void {
      patchState(store, { loading: true });
      service.getAll().pipe(
        tap(data => patchState(store, setAllEntities(data), { loading: false }))
      ).subscribe();
    }
  }))
);
```

---

## Component Integration

```typescript
import { Component, inject } from '@angular/core';
import { MyStore } from '../store/my.store';

@Component({
  selector: 'app-my-list',
  standalone: true,
  template: `
    @if (loading()) {
      <p>Loading...</p>
    }
    
    @for (item of items(); track item.id) {
      <div>{{ item.name }}</div>
    }
  `
})
export class MyListComponent {
  private readonly store = inject(MyStore);
  
  // Expose signals
  protected readonly items = this.store.entities;
  protected readonly loading = this.store.loading;
  
  constructor() {
    this.store.load();  // Initialize data
  }
}
```

---

## Store Features Quick Reference

### withEntities - Entity Management

```typescript
withEntities<MyEntity>()
```

**Provides:**
- `entities()` - Array of all entities
- `entityMap()` - Record<id, entity> for fast lookup
- `ids()` - Array of entity IDs

**Operations:**
- `setAllEntities(entities)` - Replace all
- `addEntity(entity)` - Add one
- `updateEntity({ id, changes })` - Update one
- `removeEntity(id)` - Remove one

### withComputed - Derived State

```typescript
withComputed((store) => ({
  filtered: computed(() => 
    store.entities().filter(e => e.active)
  ),
  count: computed(() => store.entities().length)
}))
```

### withMethods - Actions

```typescript
withMethods((store, service = inject(Service)) => ({
  load(): void {
    service.getAll().pipe(
      tap(data => patchState(store, setAllEntities(data)))
    ).subscribe();
  }
}))
```

---

## Best Practices

### ✅ DO

- Use `providedIn: 'root'` for singleton stores
- Always handle errors with `catchError`
- Use optimistic updates for better UX
- Implement rollback on errors
- Use computed signals for derived state
- Use `patchState` for all state mutations
- Keep stores focused on single feature

### ❌ DON'T

- Subscribe in services (only in stores)
- Mutate state directly (always use `patchState`)
- Store derived data (use `computed` instead)
- Mix multiple features in one store
- Forget to handle loading states
- Ignore error handling

---

## State Operations Reference

| Operation | Method | Usage |
|-----------|--------|-------|
| Set all | `setAllEntities(entities)` | Replace entire collection |
| Add one | `addEntity(entity)` | Add single item |
| Add many | `addEntities(entities)` | Add multiple items |
| Update | `updateEntity({ id, changes })` | Update existing item |
| Remove | `removeEntity(id)` | Delete single item |
| Patch | `patchState(store, { key: value })` | Update state properties |

---

## Additional Resources

For detailed patterns and examples, see:

- [patterns.md](./references/patterns.md) - Optimistic updates, error handling, loading states
- [examples.md](./references/examples.md) - Complete store implementations and component integration
- [testing.md](./references/testing.md) - Unit testing strategies for stores

---

## Related Skills

- **Angular Component Architecture** - For using stores in components
- **Repository & OpenAPI Integration** - For data access layer
- **Angular Testing** - For testing stores
