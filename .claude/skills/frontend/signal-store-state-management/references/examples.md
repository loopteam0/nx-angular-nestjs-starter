# Signal Store Complete Examples

Full implementation examples for @ngrx/signals stores.

---

## Complete Store Example

### Patient Store Implementation

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
            // Notify success
          }),
          catchError(error => {
            // Rollback on error
            if (currentState) {
              patchState(store, updateEntity({ id, changes: currentState }));
            }
            // Notify failure
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
            // Notify success
          }),
          catchError(error => {
            patchState(store, { loading: false });
            // Notify failure
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

## Component Integration Examples

### List Component

```typescript
import { Component, inject } from '@angular/core';
import { PatientStore } from '../store/patient.store';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  template: `
    <!-- Search -->
    <input
      type="text"
      [value]="searchTerm()"
      (input)="onSearch($event)"
      placeholder="Search patients..."
    />

    <!-- Loading State -->
    @if (loading()) {
      <p-progressSpinner />
    }

    <!-- Error State -->
    @if (error(); as errorMsg) {
      <p-message severity="error" [text]="errorMsg" />
    }

    <!-- Patient List -->
    @for (patient of patients(); track patient.id) {
      <div 
        [class.selected]="selectedPatient()?.id === patient.id"
        (click)="onSelect(patient.id)">
        <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
        <p>{{ patient.email }}</p>
        <span [class]="patient.status">{{ patient.status }}</span>
      </div>
    } @empty {
      <p>No patients found</p>
    }

    <!-- Actions -->
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
  protected readonly error = this.store.error;
  protected readonly selectedPatient = this.store.selectedPatient;
  protected readonly searchTerm = this.store.searchTerm;

  constructor() {
    // Initialize data
    this.store.loadPatients();
  }

  protected onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.store.setSearchTerm(term);
  }

  protected onSelect(id: string): void {
    this.store.selectPatient(id);
  }

  protected onCreate(): void {
    // Navigate to create form or open dialog
  }
}
```

### Form Component

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientStore } from '../store/patient.store';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="firstName" placeholder="First Name" />
      <input formControlName="lastName" placeholder="Last Name" />
      <input formControlName="email" type="email" placeholder="Email" />
      
      <button type="submit" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Saving...' : 'Save' }}
      </button>
    </form>
  `
})
export class PatientFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(PatientStore);

  protected readonly loading = signal(false);

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  protected onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.store.createPatient(this.form.value);
    
    // Reset form after creation
    setTimeout(() => {
      this.form.reset();
      this.loading.set(false);
    }, 1000);
  }
}
```

### Detail Component

```typescript
import { Component, inject, input } from '@angular/core';
import { PatientStore } from '../store/patient.store';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  template: `
    @if (patient(); as p) {
      <h2>{{ p.firstName }} {{ p.lastName }}</h2>
      <p>Email: {{ p.email }}</p>
      <p>Status: {{ p.status }}</p>
      
      <button (click)="onEdit()">Edit</button>
      <button (click)="onDelete()">Delete</button>
    } @else {
      <p>Select a patient to view details</p>
    }
  `
})
export class PatientDetailComponent {
  private readonly store = inject(PatientStore);
  
  // Input from route or parent
  patientId = input.required<string>();

  // Computed patient from store
  protected readonly patient = this.store.selectedPatient;

  constructor() {
    // Select patient when ID changes
    effect(() => {
      this.store.selectPatient(this.patientId());
    });
  }

  protected onEdit(): void {
    // Navigate to edit form
  }

  protected onDelete(): void {
    const id = this.patientId();
    if (confirm('Delete this patient?')) {
      this.store.deletePatient(id);
    }
  }
}
```
