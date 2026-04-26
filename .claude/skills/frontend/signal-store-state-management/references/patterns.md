# Signal Store Patterns

Advanced patterns for state management with @ngrx/signals.

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

### Selection Pattern

```typescript
interface State {
  selectedId: string | null;
}

withComputed((store) => ({
  selectedItem: computed(() => {
    const id = store.selectedId();
    return id ? store.entityMap()[id] : null;
  })
}))

withMethods((store) => ({
  selectItem(id: string | null): void {
    patchState(store, { selectedId: id });
  },
  
  clearSelection(): void {
    patchState(store, { selectedId: null });
  }
}))
```

### Sorting Pattern

```typescript
interface State {
  sortBy: 'name' | 'date' | 'status';
  sortDirection: 'asc' | 'desc';
}

withComputed((store) => ({
  sortedEntities: computed(() => {
    const entities = [...store.entities()];
    const sortBy = store.sortBy();
    const direction = store.sortDirection();
    
    return entities.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  })
}))

withMethods((store) => ({
  setSorting(sortBy: string, sortDirection: 'asc' | 'desc'): void {
    patchState(store, { sortBy, sortDirection });
  }
}))
```
