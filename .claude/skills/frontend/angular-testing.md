---
name: angular-testing
description: Tests Angular 21+ applications using Vitest for unit tests and Playwright for E2E tests. Covers component testing, service testing, store testing, and end-to-end testing. Use when writing tests, testing components, testing services, adding E2E tests, or when the user mentions Angular testing, Vitest, Playwright, unit tests, or integration tests.
---

# Angular Testing

---

## Unit Testing with Vitest

### Component Testing

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PatientFormComponent } from './patient-form.component';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.form.value).toEqual({
      firstName: '',
      lastName: '',
      email: ''
    });
  });

  it('should validate email format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['email']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should emit save event when valid', () => {
    vi.spyOn(component.save, 'emit');

    component.form.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com'
    });

    component.onSubmit();
    expect(component.save.emit).toHaveBeenCalled();
  });
});
```

### Service Testing

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PatientService } from './patient.service';
import { PatientRepository } from '../repositories/patient.repository';

describe('PatientService', () => {
  let service: PatientService;
  let repository: { findAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    repository = {
      findAll: vi.fn(),
      create: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        PatientService,
        { provide: PatientRepository, useValue: repository }
      ]
    });

    service = TestBed.inject(PatientService);
    repository = TestBed.inject(PatientRepository) as any;
  });

  it('should load patients', (done) => {
    const mockPatients = [{ id: '1', firstName: 'John' }];
    repository.findAll.mockReturnValue(of(mockPatients));

    service.loadPatients().subscribe(patients => {
      expect(patients).toEqual(mockPatients);
      done();
    });
  });
});
```

### Store Testing

Note: if you introduce a signal store library (e.g. `@ngrx/signals`), test it with Vitest spies (`vi.fn`, `vi.spyOn`) and avoid Jasmine-only APIs.

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PatientStore } from './patient.store';
import { PatientService } from '../services/patient.service';

describe('PatientStore', () => {
  let store: InstanceType<typeof PatientStore>;
  let service: { loadPatients: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = { loadPatients: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        PatientStore,
        { provide: PatientService, useValue: service }
      ]
    });

    store = TestBed.inject(PatientStore);
    service = TestBed.inject(PatientService) as any;
  });

  it('should load patients', (done) => {
    const mockPatients = [{ id: '1', firstName: 'John' }];
    service.loadPatients.mockReturnValue(of(mockPatients));

    store.loadPatients();

    // Depending on the store implementation, you may need to flush microtasks.
    expect(store.loading()).toBe(false);
    done();
  });
});
```

---

## E2E Testing with Playwright

### Basic smoke test (matches `apps/web-e2e` scaffold)

```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('h1').innerText()).toContain('Welcome');
});
```

---

## Coverage Requirements

- Services: 100%
- Repositories: 100%
- Stores: 90%
- Smart Components: 80%
- Presentational Components: 70%

---

## Related Skills

- Angular Component Architecture
- Signal Store State Management
- Repository & OpenAPI Integration
