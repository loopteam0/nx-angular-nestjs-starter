# Signal Store Testing

Unit testing strategies for @ngrx/signals stores.

---

## Store Testing with Vitest

### Basic Store Test

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PatientStore } from './patient.store';
import { PatientService } from '../services/patient.service';

describe('PatientStore', () => {
  let store: InstanceType<typeof PatientStore>;
  let mockService: {
    loadPatients: ReturnType<typeof vi.fn>;
    createPatient: ReturnType<typeof vi.fn>;
    updatePatient: ReturnType<typeof vi.fn>;
    deletePatient: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      loadPatients: vi.fn(),
      createPatient: vi.fn(),
      updatePatient: vi.fn(),
      deletePatient: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        PatientStore,
        { provide: PatientService, useValue: mockService }
      ]
    });

    store = TestBed.inject(PatientStore);
  });

  it('should initialize with empty state', () => {
    expect(store.entities()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should load patients successfully', (done) => {
    const mockPatients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(mockPatients));

    store.loadPatients();

    setTimeout(() => {
      expect(store.entities()).toEqual(mockPatients);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      done();
    }, 0);
  });

  it('should handle load error', (done) => {
    const error = new Error('API Error');
    mockService.loadPatients.mockReturnValue(throwError(() => error));

    store.loadPatients();

    setTimeout(() => {
      expect(store.entities()).toEqual([]);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('API Error');
      done();
    }, 0);
  });

  it('should create patient optimistically', (done) => {
    const newPatient = {
      firstName: 'New',
      lastName: 'Patient',
      email: 'new@test.com'
    };
    const createdPatient = { ...newPatient, id: 'new-id', status: 'active' };
    
    mockService.createPatient.mockReturnValue(of(createdPatient));

    store.createPatient(newPatient);

    // Check optimistic update
    expect(store.entities().length).toBe(1);
    expect(store.entities()[0].firstName).toBe('New');

    setTimeout(() => {
      // Check final state with real ID
      expect(store.entities()[0].id).toBe('new-id');
      done();
    }, 0);
  });

  it('should rollback on create error', (done) => {
    const newPatient = {
      firstName: 'New',
      lastName: 'Patient',
      email: 'new@test.com'
    };
    
    mockService.createPatient.mockReturnValue(
      throwError(() => new Error('Create failed'))
    );

    store.createPatient(newPatient);

    // Check optimistic update
    expect(store.entities().length).toBe(1);

    setTimeout(() => {
      // Check rollback
      expect(store.entities().length).toBe(0);
      done();
    }, 0);
  });

  it('should update patient optimistically', (done) => {
    const patient = { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' };
    mockService.loadPatients.mockReturnValue(of([patient]));
    store.loadPatients();

    setTimeout(() => {
      const updates = { firstName: 'Jane' };
      mockService.updatePatient.mockReturnValue(
        of({ ...patient, ...updates })
      );

      store.updatePatient('1', updates);

      // Check optimistic update
      expect(store.entities()[0].firstName).toBe('Jane');
      
      setTimeout(() => {
        expect(store.entities()[0].firstName).toBe('Jane');
        done();
      }, 0);
    }, 0);
  });

  it('should delete patient', (done) => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));
    store.loadPatients();

    setTimeout(() => {
      mockService.deletePatient.mockReturnValue(of(void 0));
      store.deletePatient('1');

      setTimeout(() => {
        expect(store.entities().length).toBe(0);
        done();
      }, 0);
    }, 0);
  });
});
```

---

## Testing Computed Signals

```typescript
describe('PatientStore - Computed Signals', () => {
  let store: InstanceType<typeof PatientStore>;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      loadPatients: vi.fn().mockReturnValue(of([]))
    };

    TestBed.configureTestingModule({
      providers: [
        PatientStore,
        { provide: PatientService, useValue: mockService }
      ]
    });

    store = TestBed.inject(PatientStore);
  });

  it('should compute filtered patients', (done) => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));
    store.loadPatients();

    setTimeout(() => {
      // Set search term
      store.setSearchTerm('john');

      // Check filtered results
      expect(store.filteredPatients().length).toBe(1);
      expect(store.filteredPatients()[0].firstName).toBe('John');
      done();
    }, 0);
  });

  it('should compute active patients', (done) => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', status: 'inactive' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));
    store.loadPatients();

    setTimeout(() => {
      expect(store.activePatients().length).toBe(1);
      expect(store.activePatients()[0].status).toBe('active');
      done();
    }, 0);
  });

  it('should compute selected patient', (done) => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));
    store.loadPatients();

    setTimeout(() => {
      store.selectPatient('1');
      
      expect(store.selectedPatient()).toEqual(patients[0]);
      done();
    }, 0);
  });
});
```

---

## Testing Store Methods

```typescript
describe('PatientStore - Methods', () => {
  let store: InstanceType<typeof PatientStore>;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      loadPatients: vi.fn().mockReturnValue(of([]))
    };

    TestBed.configureTestingModule({
      providers: [
        PatientStore,
        { provide: PatientService, useValue: mockService }
      ]
    });

    store = TestBed.inject(PatientStore);
  });

  it('should set search term', () => {
    store.setSearchTerm('test');
    expect(store.searchTerm()).toBe('test');
  });

  it('should clear search', () => {
    store.setSearchTerm('test');
    store.clearSearch();
    expect(store.searchTerm()).toBe('');
  });

  it('should select patient', () => {
    store.selectPatient('123');
    expect(store.selectedPatientId()).toBe('123');
  });

  it('should reset store', (done) => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));
    store.loadPatients();

    setTimeout(() => {
      store.setSearchTerm('test');
      store.selectPatient('1');
      
      store.reset();

      expect(store.entities()).toEqual([]);
      expect(store.searchTerm()).toBe('');
      expect(store.selectedPatientId()).toBeNull();
      expect(store.error()).toBeNull();
      done();
    }, 0);
  });
});
```

---

## Integration Testing with Components

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PatientListComponent } from './patient-list.component';
import { PatientStore } from '../store/patient.store';
import { PatientService } from '../services/patient.service';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      loadPatients: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [
        PatientStore,
        { provide: PatientService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
  });

  it('should load patients on init', () => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));

    fixture.detectChanges();

    expect(mockService.loadPatients).toHaveBeenCalled();
  });

  it('should display patients', (done) => {
    const patients = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', status: 'active' }
    ];
    mockService.loadPatients.mockReturnValue(of(patients));

    fixture.detectChanges();

    setTimeout(() => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('John');
      done();
    }, 0);
  });
});
```

---

## Best Practices for Store Testing

### ✅ DO

- Mock service dependencies
- Test loading and error states
- Test optimistic updates and rollbacks
- Test computed signal calculations
- Use `setTimeout` for async operations
- Test state reset functionality
- Verify service method calls with mocks

### ❌ DON'T

- Test implementation details of @ngrx/signals
- Make actual HTTP calls in tests
- Skip error handling tests
- Forget to test edge cases (empty arrays, null values)
- Test private methods directly
