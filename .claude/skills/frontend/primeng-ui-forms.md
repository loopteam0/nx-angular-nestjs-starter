---
name: primeng-ui-forms
description: Builds forms and UI components using PrimeNG with Angular Reactive Forms. Note that this workspace does not currently include PrimeNG/Tailwind dependencies - use this skill only after adding a UI kit or adapt patterns to native components. Use when creating forms, building UI with PrimeNG, working with reactive forms, or when the user mentions PrimeNG components, form validation, or UI patterns.
---

# PrimeNG UI & Forms

**Note**: This workspace does not currently include PrimeNG/Tailwind dependencies. Use this skill only after adding a UI kit, or adapt the patterns to native components.

```bash
# If you decide to adopt PrimeNG later
pnpm add primeng primeicons
```

---
- Build data tables with PrimeNG Table
- Implement sidebar/drawer patterns
- Add custom form validators
- Handle unsaved changes
- Style with Tailwind (utility classes only)

## Triggers

- "create form"
- "add table"
- "build UI"
- "sidebar form"
- "primeng component"
- "form validation"
- "unsaved changes"

---

## Core Principles

### CRITICAL Rules

✅ **DO:**

- Prefer a consistent UI kit across the app (PrimeNG is one option)
- Keep forms accessible and validator-driven (Reactive Forms)
- Prefer side-panel patterns for large forms when appropriate
- Reactive Forms for all form management
- Custom validators for business rules

❌ **DON'T:**

- Hardcode design rules that don’t match the chosen UI kit
- Mix template-driven and reactive forms
- Create forms without validators
- Ignore dirty state tracking

---

## PrimeNG + Tailwind Integration

### Correct Usage

```typescript
@Component({
  template: `
    <!-- ✅ CORRECT: Tailwind for layout, PrimeNG for colors -->
    <div class="flex flex-col gap-4 p-4">
      <p-card>
        <p-button label="Save" severity="primary"></p-button>
      </p-card>
    </div>

    <!-- ❌ WRONG: Don't use Tailwind colors -->
    <div class="bg-blue-500 text-white">
      <p-button label="Save"></p-button>
    </div>

    <!-- ✅ CORRECT: PrimeNG severity for colors -->
    <p-button severity="primary" label="Save"></p-button>
    <p-button severity="secondary" label="Cancel"></p-button>
    <p-button severity="success" label="Confirm"></p-button>
    <p-button severity="danger" label="Delete"></p-button>
    <p-button severity="warn" label="Warning"></p-button>
  `
})
```

---

## Form in Sidebar Pattern (MANDATORY)

### List Component with Sidebar

```typescript
@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [TableModule, Button, Drawer, studentFormComponent],
  template: `
    <div class="flex flex-col gap-4 p-4">
      <!-- Header with Add Button -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">students</h2>
        <p-button
          label="Add student"
          icon="pi pi-plus"
          (onClick)="showSidebar.set(true)">
        </p-button>
      </div>

      <!-- Table -->
      <p-table [value]="students()" [paginator]="true" [rows]="10">
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-student>
          <tr>
            <td>{{ student.firstName }} {{ student.lastName }}</td>
            <td>{{ student.email }}</td>
            <td>
              <p-button
                icon="pi pi-pencil"
                [text]="true"
                [rounded]="true"
                (onClick)="editstudent(student)">
              </p-button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- ✅ Sidebar for Form (NOT Dialog) -->
    <p-drawer
      [(visible)]="showSidebar"
      position="right"
      [style]="{width: '45rem'}"
      [modal]="true"
      [closeOnEscape]="true"
      [showCloseIcon]="true">

      <ng-template pTemplate="header">
        <h3 class="text-xl font-semibold">
          {{ isEdit() ? 'Edit' : 'Add' }} student
        </h3>
      </ng-template>

      <app-student-form
        [student]="selectedstudent()"
        (save)="onSave($event)"
        (cancel)="showSidebar.set(false)">
      </app-student-form>
    </p-drawer>
  `
})
export class studentListComponent {
  protected showSidebar = signal(false);
  protected isEdit = signal(false);
  protected selectedstudent = signal<student | null>(null);

  protected editstudent(student: student): void {
    this.selectedstudent.set(student);
    this.isEdit.set(true);
    this.showSidebar.set(true);
  }

  protected onSave(student: student): void {
    // Handle save
    this.showSidebar.set(false);
  }
}
```

---

## Reactive Forms with Validators

### Form Component

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  effect,
  inject
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { studentValidators } from '../validators/student.validators';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputText,
    DatePicker,
    Select,
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
            @if (form.controls['firstName'].errors?.['minlength']) {
              Minimum 2 characters required
            }
          </small>
        }
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-2">
        <label for="email" class="font-semibold">Email *</label>
        <input
          pInputText
          id="email"
          type="email"
          formControlName="email"
          placeholder="email@example.com">

        @if (form.controls['email'].invalid && form.controls['email'].touched) {
          <small class="text-red-500">
            @if (form.controls['email'].errors?.['required']) {
              Email is required
            }
            @if (form.controls['email'].errors?.['email']) {
              Please enter a valid email
            }
          </small>
        }
      </div>

      <!-- Phone with Custom Validator -->
      <div class="flex flex-col gap-2">
        <label for="phone" class="font-semibold">Phone *</label>
        <input
          pInputText
          id="phone"
          formControlName="phone"
          placeholder="+1234567890">

        @if (form.controls['phone'].invalid && form.controls['phone'].touched) {
          <small class="text-red-500">
            @if (form.controls['phone'].errors?.['invalidPhone']) {
              Please enter a valid phone number
            }
          </small>
        }
      </div>

      <!-- Date Picker -->
      <div class="flex flex-col gap-2">
        <label for="dateOfBirth" class="font-semibold">Date of Birth *</label>
        <p-datepicker
          inputId="dateOfBirth"
          formControlName="dateOfBirth"
          [showIcon]="true"
          [maxDate]="maxDate"
          dateFormat="mm/dd/yy"
          placeholder="Select date">
        </p-datepicker>

        @if (form.controls['dateOfBirth'].invalid && form.controls['dateOfBirth'].touched) {
          <small class="text-red-500">
            @if (form.controls['dateOfBirth'].errors?.['invalidAge']) {
              student must be at least 18 years old
            }
          </small>
        }
      </div>

      <!-- Dropdown -->
      <div class="flex flex-col gap-2">
        <label for="status" class="font-semibold">Status *</label>
        <p-select
          inputId="status"
          formControlName="status"
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status">
        </p-select>
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

      <!-- Dirty State Indicator -->
      @if (form.dirty) {
        <div class="flex items-center gap-2 text-sm opacity-60">
          <i class="pi pi-info-circle"></i>
          <span>You have unsaved changes</span>
        </div>
      }
    </form>
  `
})
export class studentFormComponent {
  student = input<student | null>(null);
  save = output<student>();
  cancel = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);

  protected form!: FormGroup;
  protected readonly maxDate = new Date();
  protected readonly statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  constructor() {
    this.initializeForm();

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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, studentValidators.phoneValidator()]],
      dateOfBirth: ['', [Validators.required, studentValidators.ageValidator(18)]],
      status: ['active', [Validators.required]]
    });
  }

  protected onSubmit(): void {
    if (this.form.valid) {
      const student: student = this.student()
        ? { ...this.student()!, ...this.form.value }
        : { id: crypto.randomUUID(), ...this.form.value };

      this.save.emit(student);
      this.form.markAsPristine();
    } else {
      Object.keys(this.form.controls).forEach(key => {
        this.form.controls[key].markAsTouched();
      });
    }
  }

  protected onCancelClick(): void {
    if (this.form.dirty) {
      this.confirmationService.confirm({
        message: 'You have unsaved changes. Are you sure you want to cancel?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.cancel.emit();
          this.form.reset();
        }
      });
    } else {
      this.cancel.emit();
    }
  }

  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
```

---

## Custom Validators

### student Validators

**Location:** `libs/features/students/validators/student.validators.ts`

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class studentValidators {
  // Age validator
  static ageValidator(minAge: number = 18): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= minAge
        ? null
        : { invalidAge: { minAge, actualAge: age } };
    };
  }

  // Phone validator
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      const digits = control.value.replace(/\D/g, '');
      const isValid = phoneRegex.test(control.value) && digits.length >= 10;

      return isValid ? null : { invalidPhone: true };
    };
  }

  // Email domain validator
  static emailDomainValidator(allowedDomains: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const email = control.value.toLowerCase();
      const domain = email.split('@')[1];
      const isAllowed = allowedDomains.some(d => domain === d);

      return isAllowed ? null : { invalidDomain: { allowedDomains } };
    };
  }

  // Date range validator
  static dateRangeValidator(minDate?: Date, maxDate?: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const date = new Date(control.value);

      if (minDate && date < minDate) {
        return { dateBeforeMin: { minDate } };
      }

      if (maxDate && date > maxDate) {
        return { dateAfterMax: { maxDate } };
      }

      return null;
    };
  }
}
```

---

## Unsaved Changes Guard

**Location:** `libs/shared/utils/guards/can-deactivate.guard.ts`

```typescript
import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component
): boolean | Observable<boolean> => {
  if (component.canDeactivate()) {
    return true;
  }

  const confirmationService = inject(ConfirmationService);

  return new Observable<boolean>((observer) => {
    confirmationService.confirm({
      message: 'You have unsaved changes. Do you want to leave?',
      header: 'Unsaved Changes',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        observer.next(true);
        observer.complete();
      },
      reject: () => {
        observer.next(false);
        observer.complete();
      }
    });
  });
};
```

### Route Configuration

```typescript
export const routes: Routes = [
  {
    path: 'students/edit/:id',
    component: studentFormComponent,
    canDeactivate: [canDeactivateGuard]
  }
];
```

---

## PrimeNG Components Reference

### Essential Components

```typescript
// Table with pagination
<p-table
  [value]="data()"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  [tableStyle]="{ 'min-width': '50rem' }">
  <!-- templates -->
</p-table>

// Drawer/Sidebar (45rem width)
<p-drawer
  [(visible)]="visible"
  position="right"
  [style]="{width: '45rem'}"
  [modal]="true">
  <!-- content -->
</p-drawer>

// Buttons
<p-button label="Save" severity="primary"></p-button>
<p-button label="Cancel" severity="secondary" [outlined]="true"></p-button>
<p-button icon="pi pi-trash" [text]="true" [rounded]="true"></p-button>

// Form Inputs
<input pInputText formControlName="name" />
<p-datepicker formControlName="date"></p-datepicker>
<p-select formControlName="status" [options]="options"></p-select>

// Status Tags
<p-tag value="Active" severity="success"></p-tag>
<p-tag value="Inactive" severity="danger"></p-tag>

// Confirmation Dialog
<p-confirmDialog></p-confirmDialog>  <!-- Add to app.component.html -->

// Toast Notifications
<p-toast></p-toast>  <!-- Add to app.component.html -->
```

---

## Best Practices

### ✅ DO

- Forms in sidebars (45rem width)
- Reactive Forms always
- Custom validators for business rules
- Track dirty state
- Unsaved changes guard
- Tailwind for layout only
- PrimeNG theme for colors
- Proper validation error messages

### ❌ DON'T

- Forms in dialogs
- Template-driven forms
- Tailwind color classes
- Ignore dirty state
- Hardcode styles
- Mix styling approaches

---

## Related Skills

- **Angular Component Architecture** - Form components
- **Signal Store State Management** - Form data management

---

## Quick Reference

### Form Template

```typescript
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <div class="flex flex-col gap-2">
    <label for="field">Label *</label>
    <input pInputText id="field" formControlName="field" />
    @if (form.controls['field'].invalid && form.controls['field'].touched) {
      <small class="text-red-500">Error message</small>
    }
  </div>
</form>
```
