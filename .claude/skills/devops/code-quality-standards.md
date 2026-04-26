---
name: code-quality-standards
description: Maintains code quality standards including TypeScript configuration, ESLint, Prettier, naming conventions, clean code principles, and definition of done. Use when setting up code standards, configuring quality tools, or when the user mentions code quality, best practices, coding conventions, or definition of done.
---

# Code Quality Standards

---

## TypeScript Configuration

### tsconfig.base.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Naming Conventions

```typescript
// ✅ Classes: PascalCase
export class StudentService {}
export class StudentRepository {}

// ✅ Interfaces/Types: PascalCase
export interface Student {}
export type StudentStatus = 'active' | 'inactive';

// ✅ Variables/Functions: camelCase
const patientList = signal<Student[]>([]);
const loadStudents = () => {};

// ✅ Constants: UPPER_SNAKE_CASE
const MAX_PATIENTS_PER_PAGE = 20;
const API_BASE_URL = 'https://api.example.com';

// ✅ Signals: no suffix
const loading = signal(false);
const patients = signal<Student[]>([]);

// ✅ Files: kebab-case
// patient-list.component.ts
// patient.service.ts
// patient.repository.ts

// ❌ WRONG
const StudentList = signal([]);  // Should be camelCase
const patients$ = signal([]);    // Don't use $ suffix for signals
class patient_service {}         // Should be PascalCase
```

---

## Clean Code Principles

### Function Length

```typescript
// ✅ GOOD: Short, focused functions (max 20 lines)
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

// ❌ BAD: Too long, multiple responsibilities
function processStudentData() {
  // 100 lines of mixed logic
}
```

### Single Responsibility

```typescript
// ✅ GOOD: One responsibility
class StudentValidator {
  validate(patient: Student): ValidationResult {
    // Only validation logic
  }
}

// ❌ BAD: Multiple responsibilities
class StudentManager {
  validate() {}
  save() {}
  sendEmail() {}
  generateReport() {}
}
```

### Type Safety

```typescript
// ✅ GOOD: Explicit types
interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

const getStudent = (id: string): Student => {
  // Implementation
};

// ❌ BAD: Using 'any'
const getStudent = (id: any): any => {
  // Implementation
};
```

---

## Error Handling

```typescript
// ✅ GOOD: User-friendly errors
function getUserFriendlyMessage(error: HttpErrorResponse): string {
  if (error.status === 404) return 'Resource not found';
  if (error.status === 403) return 'Access denied';
  if (error.status === 500) return 'Server error occurred';
  return 'An unexpected error occurred';
}

// ❌ BAD: Exposing technical details
function getMessage(error: any): string {
  return error.message; // Might expose stack traces
}
```

---

## Code Metrics

### Complexity Limits

- **Cyclomatic Complexity:** Maximum 10
- **Function Length:** Maximum 20 lines
- **Class Length:** Maximum 200 lines
- **File Length:** Maximum 400 lines
- **Method Parameters:** Maximum 4

### Coverage Requirements

- **Services:** 100%
- **Repositories:** 100%
- **Stores:** 90%
- **Smart Components:** 80%
- **Presentational Components:** 70%

---

## Documentation

### JSDoc Comments

```typescript
/**
 * Creates a new patient record with validation.
 * Performs optimistic update to improve UX.
 *
 * @param patient - Student data to create
 * @throws {ValidationError} If patient data is invalid
 * @throws {DuplicateError} If patient already exists
 *
 * @example
 * ```typescript
 * service.createStudent({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
createStudent(patient: CreateStudentDto): void {
  // Implementation
}
```

---

## Definition of Done

### Feature Checklist

✅ **Code Complete:**

- [ ] All components generated with NX CLI
- [ ] Using Angular 21+ features (standalone, signals, new control flow)
- [ ] Architecture follows this repo’s feature-library pattern (feature/ui/data-access/util)
- [ ] Data flow is consistent (Component → data-access/service → API); store/OpenAPI layers are optional until added
- [ ] Forms use Reactive Forms with validators
- [ ] Unsaved changes warning implemented (when the UX needs it)

✅ **Styling (project-dependent):**

- [ ] Consistent component styling (this repo does not currently mandate PrimeNG/Tailwind)
- [ ] Responsive design
- [ ] Accessibility compliant

✅ **Testing:**

- [ ] Unit tests: `pnpm nx test <project>` (web uses Vitest; backend test strategy can be added per project)
- [ ] E2E tests: `pnpm nx e2e web-e2e` and `pnpm nx e2e api-e2e`
- [ ] All tests passing

✅ **Code Quality:**

- [ ] TypeScript strict mode, no 'any' types
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] No console.logs in production code

✅ **Documentation:**

- [ ] Public API documented
- [ ] Complex logic commented
- [ ] README updated if needed

✅ **Error Handling:**

- [ ] User-friendly error messages
- [ ] Loading states implemented
- [ ] Optimistic updates with rollback

---

## ESLint Configuration

This repo uses a flat config in `eslint.config.mjs`. Add/override rules there.

```js
export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error'
      // Add project-specific limits if needed:
      // 'complexity': ['error', 10],
      // 'max-lines-per-function': ['error', 20]
    }
  }
];
```

---

## Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "arrowParens": "avoid"
}
```

---

## Related Skills

- NX Monorepo Management
- Angular Component Architecture
- NestJS Microservice Architecture
