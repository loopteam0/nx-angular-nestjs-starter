---
name: feature-module-management
description: Creates and manages feature modules and libraries in the NX monorepo, including folder structure, component organization, routing, and public API management. Use when creating features, adding feature modules, organizing features, setting up feature libraries, or when the user mentions feature structure, feature organization, or module management.
---

# Feature Module Management

---

## Feature Library Structure

### Standard Feature Structure

```
libs/web/feature-{feature}/
├── src/
│   ├── lib/
│   │   ├── components/          # Generated with NX CLI
│   │   │   ├── {feature}-list/
│   │   │   │   ├── {feature}-list.component.ts
│   │   │   │   └── {feature}-list.component.spec.ts
│   │   │   ├── {feature}-form/
│   │   │   │   ├── {feature}-form.component.ts
│   │   │   │   └── {feature}-form.component.spec.ts
│   │   │   └── {feature}-detail/
│   │   │       ├── {feature}-detail.component.ts
│   │   │       └── {feature}-detail.component.spec.ts
│   │   ├── services/
│   │   │   ├── {feature}.service.ts
│   │   │   └── {feature}.service.spec.ts
│   │   ├── repositories/
│   │   │   ├── {feature}.repository.ts
│   │   │   └── {feature}.repository.spec.ts
│   │   ├── store/
│   │   │   ├── {feature}.store.ts
│   │   │   └── {feature}.store.spec.ts
│   │   ├── models/
│   │   │   ├── {feature}.model.ts
│   │   │   └── {feature}.dto.ts
│   │   ├── validators/
│   │   │   ├── {feature}.validators.ts
│   │   │   └── {feature}.validators.spec.ts
│   │   └── {feature}.routes.ts
│   └── index.ts                 # Public API
├── project.json
├── tsconfig.json
└── README.md
```

---

## Creating a New Feature (Step-by-Step)

### Step 1: Generate Feature Library

```bash
pnpm nx g @nx/angular:library feature-appointments \
  --directory=libs/web/feature-appointments \
  --standalone \
  --routing \
  --lazy \
  --tags=scope:web,type:feature,domain:appointments
```

### Step 2: Create Folder Structure

```bash
# Create directories
mkdir -p libs/web/feature-appointments/src/lib/{components,services,repositories,store,models,validators}
```

### Step 3: Generate Components

```bash
# List component
pnpm nx g @nx/angular:component appointment-list \
  --project=feature-appointments \
  --standalone \
  --changeDetection=OnPush \
  --export

# Form component
pnpm nx g @nx/angular:component appointment-form \
  --project=feature-appointments \
  --standalone \
  --changeDetection=OnPush \
  --export

# Detail component
pnpm nx g @nx/angular:component appointment-detail \
  --project=feature-appointments \
  --standalone \
  --changeDetection=OnPush \
  --export
```

### Step 4: Create Models

**Location:** `libs/features/appointments/src/lib/models/appointment.model.ts`

```typescript
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  date: Date;
  notes?: string;
}

export interface UpdateAppointmentDto {
  date?: Date;
  status?: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}
```

### Step 5: Create Repository

**Location:** `libs/features/appointments/src/lib/repositories/appointment.repository.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// This repo does not currently include OpenAPI-generated clients.
// Use HttpClient/axios-based adapters in a `data-access` layer until an OpenAPI client is introduced.
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentRepository {

  // Define methods that call your API adapter here.
  // Example signatures:
  findAll(): Observable<Appointment[]> {
    throw new Error('Not implemented');
  }

  findById(id: string): Observable<Appointment> {
    throw new Error('Not implemented');
  }

  create(appointment: CreateAppointmentDto): Observable<Appointment> {
    throw new Error('Not implemented');
  }

  update(id: string, appointment: UpdateAppointmentDto): Observable<Appointment> {
    throw new Error('Not implemented');
  }

  delete(id: string): Observable<void> {
    throw new Error('Not implemented');
  }

  findByPatient(patientId: string): Observable<Appointment[]> {
    throw new Error('Not implemented');
  }
}
```

### Step 6: Create Service

**Location:** `libs/features/appointments/src/lib/services/appointment.service.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly repository = inject(AppointmentRepository);

  loadAppointments(): Observable<Appointment[]> {
    return this.repository.findAll();
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.repository.findById(id);
  }

  createAppointment(appointment: CreateAppointmentDto): Observable<Appointment> {
    return this.repository.create(appointment);
  }

  updateAppointment(id: string, appointment: UpdateAppointmentDto): Observable<Appointment> {
    return this.repository.update(id, appointment);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.repository.delete(id);
  }

  loadPatientAppointments(patientId: string): Observable<Appointment[]> {
    return this.repository.findByPatient(patientId);
  }
}
```

### Step 7: Create Store

Note: the example below uses `@ngrx/signals` and PrimeNG’s `MessageService`. This workspace does not currently ship with those dependencies. Treat it as a reference pattern if/when those libraries are added.

**Location:** `libs/features/appointments/src/lib/store/appointment.store.ts`

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
import { AppointmentService } from '../services/appointment.service';
import { MessageService } from 'primeng/api';
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../models/appointment.model';

interface AppointmentState {
  loading: boolean;
  error: string | null;
  selectedAppointmentId: string | null;
}

export const AppointmentStore = signalStore(
  { providedIn: 'root' },
  withEntities<Appointment>(),
  withState<AppointmentState>({
    loading: false,
    error: null,
    selectedAppointmentId: null
  }),
  withComputed((store) => ({
    selectedAppointment: computed(() => {
      const id = store.selectedAppointmentId();
      return id ? store.entityMap()[id] : null;
    }),
    upcomingAppointments: computed(() =>
      store.entities().filter(a => new Date(a.date) > new Date() && a.status === 'scheduled')
    )
  })),
  withMethods((store, service = inject(AppointmentService), messageService = inject(MessageService)) => ({
    loadAppointments(): void {
      patchState(store, { loading: true, error: null });
      service.loadAppointments()
        .pipe(
          tap(appointments => {
            patchState(store, setAllEntities(appointments), { loading: false });
          }),
          catchError(error => {
            patchState(store, { loading: false, error: error.message });
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load appointments'
            });
            return of([]);
          })
        )
        .subscribe();
    },

    createAppointment(appointment: CreateAppointmentDto): void {
      const tempId = crypto.randomUUID();
      const optimisticAppointment = { ...appointment, id: tempId, status: 'scheduled' as const };

      patchState(store, addEntity(optimisticAppointment));

      service.createAppointment(appointment)
        .pipe(
          tap(created => {
            patchState(store, updateEntity({ id: tempId, changes: created }));
            messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Appointment created'
            });
          }),
          catchError(() => {
            patchState(store, removeEntity(tempId));
            messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create appointment'
            });
            return EMPTY;
          })
        )
        .subscribe();
    },

    selectAppointment(id: string | null): void {
      patchState(store, { selectedAppointmentId: id });
    }
  }))
);
```

### Step 8: Create Routes

**Location:** `libs/features/appointments/src/lib/appointments.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const appointmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/appointment-list/appointment-list.component').then(
        m => m.AppointmentListComponent
      )
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/appointment-detail/appointment-detail.component').then(
        m => m.AppointmentDetailComponent
      )
  }
];
```

### Step 9: Define Public API

**Location:** `libs/features/appointments/src/index.ts`

```typescript
// Routes
export * from './lib/appointments.routes';

// Components
export * from './lib/components/appointment-list/appointment-list.component';
export * from './lib/components/appointment-detail/appointment-detail.component';

// Store
export * from './lib/store/appointment.store';

// Models
export * from './lib/models/appointment.model';

// DON'T export internal implementation
// export * from './lib/services/appointment.service'; // ❌
// export * from './lib/repositories/appointment.repository'; // ❌
```

### Step 10: Add to App Routes

**Location:** `apps/web/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'appointments',
    loadChildren: () =>
      import('@sms/feature-appointments').then(m => m.appointmentsRoutes)
  }
];
```

---

## Backend Feature Structure

### NestJS Microservice Feature

```bash
# Generate NestJS library
pnpm nx g @nx/nest:library feature-appointments \
  --directory=libs/api/feature-appointments \
  --tags=scope:api,type:feature
```

**Structure:**

```
libs/api/feature-appointments/
├── src/
│   ├── lib/
│   │   ├── entities/
│   │   │   └── appointment.entity.ts
│   │   ├── dto/
│   │   │   ├── create-appointment.dto.ts
│   │   │   └── update-appointment.dto.ts
│   │   ├── interfaces/
│   │   │   └── appointment.interface.ts
│   │   └── services/
│   │       └── appointment-domain.service.ts
│   └── index.ts
```

---

## Feature Checklist

### ✅ Feature Complete When

- [ ] Library generated with NX CLI
- [ ] Folder structure created
- [ ] Models defined (entity, DTOs)
- [ ] Repository created
- [ ] Service created
- [ ] Store created with entities
- [ ] Components generated (list, form, detail)
- [ ] Routes configured
- [ ] Public API defined (index.ts)
- [ ] Integrated into app routes
- [ ] Tests written
- [ ] README updated

---

## Best Practices

### ✅ DO

- Use NX generators
- Follow folder structure
- Keep public API minimal
- Use lazy loading
- Write tests for each layer
- Document complex logic

### ❌ DON'T

- Create files manually
- Export internal implementation
- Skip tests
- Mix feature concerns
- Forget to update public API

---

## Related Skills

- Angular Component Architecture
- Signal Store State Management
- Repository & OpenAPI Integration
- NX Monorepo Management
