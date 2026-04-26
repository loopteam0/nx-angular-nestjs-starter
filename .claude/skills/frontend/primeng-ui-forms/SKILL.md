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

## Core Principles

### ✅ DO
- Use consistent UI kit across the app (PrimeNG is one option)
- Keep forms accessible and validator-driven (Reactive Forms)
- Prefer side-panel patterns for large forms
- Use Reactive Forms for all form management
- Custom validators for business rules
- Track dirty state for unsaved changes

### ❌ DON'T
- Mix template-driven and reactive forms
- Create forms without validators
- Ignore dirty state tracking
- Use Tailwind color classes (use PrimeNG severity)

---

## PrimeNG + Tailwind Integration

```typescript
@Component({
  template: `
    <!-- ✅ CORRECT: Tailwind for layout, PrimeNG for colors -->
    <div class="flex flex-col gap-4 p-4">
      <p-card>
        <p-button label="Save" severity="primary"></p-button>
      </p-card>
    </div>

    <!-- ✅ CORRECT: PrimeNG severity for colors -->
    <p-button severity="primary" label="Save"></p-button>
    <p-button severity="secondary" label="Cancel"></p-button>
    <p-button severity="success" label="Confirm"></p-button>
    <p-button severity="danger" label="Delete"></p-button>
  `
})
```

---

## Form in Sidebar Pattern (MANDATORY)

### Basic Structure

```typescript
@Component({
  selector: 'app-list',
  template: `
    <div class="flex flex-col gap-4 p-4">
      <!-- Header with Add Button -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Items</h2>
        <p-button
          label="Add Item"
          icon="pi pi-plus"
          (onClick)="showSidebar.set(true)">
        </p-button>
      </div>

      <!-- Table -->
      <p-table [value]="items()" [paginator]="true" [rows]="10">
        <!-- table content -->
      </p-table>
    </div>

    <!-- Sidebar for Form -->
    <p-drawer
      [(visible)]="showSidebar"
      position="right"
      [style]="{width: '45rem'}"
      [modal]="true">
      
      <app-item-form
        [item]="selectedItem()"
        (save)="onSave($event)"
        (cancel)="showSidebar.set(false)">
      </app-item-form>
    </p-drawer>
  `
})
```

---

## Reactive Forms with Validators

### Form Component Template

```typescript
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
  <!-- Field Example -->
  <div class="flex flex-col gap-2">
    <label for="field" class="font-semibold">Label *</label>
    <input pInputText id="field" formControlName="field" />
    
    @if (form.controls['field'].invalid && form.controls['field'].touched) {
      <small class="text-red-500">
        @if (form.controls['field'].errors?.['required']) {
          Field is required
        }
      </small>
    }
  </div>

  <!-- Actions -->
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
```

---

## Quick Reference

### Essential PrimeNG Components

```typescript
// Table
<p-table [value]="data()" [paginator]="true" [rows]="10"></p-table>

// Drawer (45rem width)
<p-drawer [(visible)]="visible" position="right" [style]="{width: '45rem'}"></p-drawer>

// Buttons
<p-button label="Save" severity="primary"></p-button>
<p-button icon="pi pi-trash" [text]="true" [rounded]="true"></p-button>

// Form Inputs
<input pInputText formControlName="name" />
<p-datepicker formControlName="date"></p-datepicker>
<p-select formControlName="status" [options]="options"></p-select>

// Status Tags
<p-tag value="Active" severity="success"></p-tag>
```

---

## Additional Resources

For detailed patterns and examples, see:

- [components.md](./references/components.md) - Complete PrimeNG component examples
- [forms.md](./references/forms.md) - Form patterns and validation
- [validators.md](./references/validators.md) - Custom validators and guards

---

## Related Skills

- **Angular Component Architecture** - Form components
- **Signal Store State Management** - Form data management
