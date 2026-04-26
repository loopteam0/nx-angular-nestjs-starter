---
name: angular-component-architecture
description: Creates modern Angular 21+ components using standalone architecture, signals, new control flow, and inject() function. Use when creating components, building UI features, implementing smart or presentational component patterns, generating components with NX CLI, or when the user mentions Angular components, signals, OnPush, standalone, inject, or new control flow.
---

# Angular 21+ Component Architecture

**Note**: Some examples reference PrimeNG. This repo does not currently include PrimeNG; treat those imports as optional and swap in your chosen UI kit or native elements.

---

## Core Principles

### 1. Angular 21+ Modern Features (Recommended)

✅ **ALWAYS USE:**

- Standalone components (no NgModules)
- Signal-based inputs: `input()`, `input.required()`
- Signal-based outputs: `output()`
- `inject()` function for dependency injection
- New control flow: `@if`, `@for`, `@switch`
- OnPush change detection
- Signals for reactive state

❌ **NEVER USE:**

- Constructor-based DI for new code when `inject()` is simpler (constructors are still allowed)
- Old control flow (`*ngIf`, `*ngFor`, `*ngSwitch`)
- `@Input()`, `@Output()` decorators (use functions)
- ChangeDetectorRef manual triggering (OnPush handles it)

### 2. Component Types

#### Smart Components (Container Components)

- Interact with stores and services
- Handle business logic
- Manage local UI state
- Located in feature libraries

#### Presentational Components

- Pure, reusable UI components
- Use `input()` and `output()` only
- No direct service/store interaction
- Can be shared across features

---

## Component Generation (NX CLI)

### CRITICAL: Always Generate Components with NX CLI

```bash
# Smart Component
pnpm nx g @nx/angular:component student-list \
  --project=feature-students \
  --standalone \
  --changeDetection=OnPush \
  --export

# Presentational Component
pnpm nx g @nx/angular:component student-form \
  --project=feature-students \
  --standalone \
  --changeDetection=OnPush \
  --export
```

**DO NOT** create component files manually. Always use NX generators.

---

## Smart Component Example

```typescript
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputText } from 'primeng/inputtext';
import { StudentStore } from '../store/student.store';
import { StudentFormComponent } from './student-form/student-form.component';
import type { Student } from '../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    Button,
    Drawer,
    InputText,
    StudentFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-4 p-4">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Students</h2>
        <p-button
          label="Add Student"
          icon="pi pi-plus"
          (onClick)="openCreateForm()">
        </p-button>
      </div>

      <!-- Search -->
      <div class="flex gap-2">
        <span class="p-input-icon-left flex-1">
          <i class="pi pi-search"></i>
          <input
            pInputText
            type="text"
            placeholder="Search students..."
            class="w-full"
            [value]="searchTerm()"
            (input)="onSearch($event)">
        </span>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center h-64">
          <p-progressSpinner />
        </div>
      }

      <!-- Table -->
      @if (!loading() && students().length > 0) {
        <p-table
          [value]="students()"
          [tableStyle]="{ 'min-width': '50rem' }"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]">

          <ng-template pTemplate="header">
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-student>
            <tr>
              <td>{{ student.firstName }}</td>
              <td>{{ student.lastName }}</td>
              <td>{{ student.email }}</td>
              <td>
                <p-tag
                  [value]="student.status"
                  [severity]="student.status === 'active' ? 'success' : 'danger'">
                </p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-pencil"
                    [text]="true"
                    [rounded]="true"
                    severity="info"
                    (onClick)="openEditForm(student)">
                  </p-button>
                  <p-button
                    icon="pi pi-trash"
                    [text]="true"
                    [rounded]="true"
                    severity="danger"
                    (onClick)="confirmDelete(student)">
                  </p-button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }

      <!-- Empty State -->
      @if (!loading() && students().length === 0) {
        <div class="flex flex-col items-center justify-center h-64 gap-4">
          <i class="pi pi-users text-6xl opacity-20"></i>
          <p class="text-lg opacity-60">No students found</p>
        </div>
      }
    </div>

    <!-- Sidebar Form -->
    <p-drawer
      [(visible)]="sidebarVisible"
      position="right"
      [style]="{ width: '45rem' }"
      [modal]="true">

      <ng-template pTemplate="header">
        <h3 class="text-xl font-semibold">
          {{ isEditMode() ? 'Edit' : 'Add' }} Student
        </h3>
      </ng-template>

      <app-student-form
        [student]="selectedStudent()"
        (save)="onSave($event)"
        (cancel)="closeSidebar()">
      </app-student-form>
    </p-drawer>
  `
})
export class StudentListComponent {
  // CRITICAL: Use inject() instead of constructor injection
  private readonly store = inject(StudentStore);
  private readonly confirmationService = inject(ConfirmationService);

  // Read from store using signals
  protected readonly students = this.store.filteredStudents;
  protected readonly loading = this.store.loading;
  protected readonly searchTerm = this.store.searchTerm;
  protected readonly selectedStudent = this.store.selectedStudent;

  // Component state signals
  protected sidebarVisible = signal(false);
  protected isEditMode = signal(false);

  constructor() {
    // Initialize data load
    this.store.loadStudents();
  }

  protected openCreateForm(): void {
    this.store.selectStudent(null);
    this.isEditMode.set(false);
    this.sidebarVisible.set(true);
  }

  protected openEditForm(student: Student): void {
    this.store.selectStudent(student.id);
    this.isEditMode.set(true);
    this.sidebarVisible.set(true);
  }

  protected onSave(student: Student): void {
    if (this.isEditMode()) {
      this.store.updateStudent(student.id, student);
    } else {
      this.store.createStudent(student);
    }
    this.closeSidebar();
  }

  protected closeSidebar(): void {
    this.sidebarVisible.set(false);
    this.store.selectStudent(null);
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchTerm(value);
  }

  protected confirmDelete(student: Student): void {
    this.confirmationService.confirm({
      message: `Delete ${student.firstName} ${student.lastName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.store.deleteStudent(student.id)
    });
  }
}
```

---

## Presentational Component Example

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import type { Student } from '../models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Button
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">

      <!-- First Name -->
      <div class="flex flex-col gap-2">
        <label for="firstName" class="font-semibold">First Name *</label>
        <input
          pInputText
          id="firstName"
          formControlName="firstName"
          placeholder="Enter first name">

        @if (form.controls['firstName'].invalid && form.controls['firstName'].touched) {
          <small class="text-red-500">
            @if (form.controls['firstName'].errors?.['required']) {
              First name is required
            }
          </small>
        }
      </div>

      <!-- Form Actions -->
      <div class="flex gap-2 justify-end mt-4">
        <p-button
          label="Cancel"
          severity="secondary"
          [outlined]="true"
          type="button"
          (onClick)="onCancelClick()">
        </p-button>
        <p-button
          label="Save"
          type="submit"
          [disabled]="form.invalid || !form.dirty">
        </p-button>
      </div>
    </form>
  `
})
export class StudentFormComponent {
  // Signal-based inputs (Angular 21+)
  student = input<Student | null>(null);

  // Signal-based outputs (Angular 21+)
  save = output<Student>();
  cancel = output<void>();

  // Inject dependencies
  private readonly fb = inject(FormBuilder);

  // Form
  protected form!: FormGroup;

  constructor() {
    this.initializeForm();

    // Watch for student changes and update form
    effect(() => {
      const student = this.student();
      if (student) {
        this.form.patchValue(student);
        this.form.markAsPristine();
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  protected onSubmit(): void {
    if (this.form.valid) {
      const student: Student = this.student()
        ? { ...this.student()!, ...this.form.value }
        : { id: crypto.randomUUID(), ...this.form.value };

      this.save.emit(student);
      this.form.markAsPristine();
    }
  }

  protected onCancelClick(): void {
    this.cancel.emit();
  }
}
```

---

## Modern Angular Features

### Signals

```typescript
// Writable signals
const count = signal(0);
const name = signal('John');

// Update signals
count.set(10);
count.update(c => c + 1);

// Computed signals
const doubled = computed(() => count() * 2);
```

### Effects

```typescript
// Side effects that run when signals change
effect(() => {
  console.log(`Count changed to: ${count()}`);
});
```

### New Control Flow

```typescript
// @if - replaces *ngIf
@if (condition) {
  <p>Shown when true</p>
} @else {
  <p>Shown when false</p>
}

// @for - replaces *ngFor
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
} @empty {
  <p>No items</p>
}

// @switch - replaces *ngSwitch
@switch (status()) {
  @case ('active') { <p-tag value="Active" /> }
  @case ('inactive') { <p-tag value="Inactive" /> }
  @default { <p-tag value="Unknown" /> }
}
```

---

## Best Practices

### ✅ DO

- Always use `inject()` for dependency injection
- Use OnPush change detection on all components
- Use signal-based inputs/outputs
- Generate components with NX CLI
- Use new control flow syntax
- Keep components focused (single responsibility)
- Use TypeScript strict mode
- Track items by id in `@for` loops

### ❌ DON'T

- Use constructor injection
- Use old `*ngIf`, `*ngFor`, `*ngSwitch`
- Use `@Input()`, `@Output()` decorators
- Create components manually without NX
- Mix smart and presentational logic
- Use `any` type
- Forget OnPush change detection

---

## Component Structure Checklist

```typescript
@Component({
  selector: 'app-feature-name',           // ✅ Descriptive selector
  standalone: true,                       // ✅ Always standalone
  imports: [...],                         // ✅ Import dependencies
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Always OnPush
  template: `...`                         // ✅ Inline or external
})
export class FeatureComponent {
  // ✅ Use inject() for DI
  private readonly service = inject(SomeService);

  // ✅ Signal-based inputs
  data = input.required<Data>();

  // ✅ Signal-based outputs
  save = output<Data>();

  // ✅ Component state with signals
  loading = signal(false);

  // ✅ Computed values
  displayName = computed(() => this.data().name.toUpperCase());

  constructor() {
    // ✅ Effects for side effects
    effect(() => {
      console.log('Data changed:', this.data());
    });
  }
}
```

---

## Related Skills

- **Signal Store State Management** - For managing component state
- **PrimeNG UI & Forms** - For building forms and UI
- **Repository & OpenAPI Integration** - For data access
- **Angular Testing** - For testing components

---

## Quick Reference

### Component Types

| Type | Purpose | Interacts With | Location |
|------|---------|----------------|----------|
| Smart | Business logic, data orchestration | Store, Services | Feature libs |
| Presentational | Pure UI, reusable | Inputs/Outputs only | Shared/Feature libs |

### Modern Features

| Feature | Old | New |
|---------|-----|-----|
| Inputs | `@Input()` | `input()`, `input.required()` |
| Outputs | `@Output()` | `output()` |
| DI | Constructor | `inject()` |
| If | `*ngIf` | `@if` |
| For | `*ngFor` | `@for` |
| Switch | `*ngSwitch` | `@switch` |
