---
name: nx-monorepo-management
description: Manages NX monorepo operations including library generation, dependency management, build configuration, and project boundaries. Use when creating libraries, generating projects, managing nx workspace, working with monorepo structure, or when the user mentions nx generators, workspace management, or project boundaries.
---

# NX Monorepo Management

---

## Library Generation

### Frontend Feature Library

```bash
pnpm nx g @nx/angular:library feature-students \
  --directory=libs/web/feature-students \
  --standalone \
  --routing \
  --lazy \
  --tags=scope:web,type:feature
```

### Frontend Shared Library

```bash
pnpm nx g @nx/angular:library shared-ui \
  --directory=libs/web/ui \
  --standalone \
  --tags=scope:web,type:ui
```

### Backend Library

```bash
pnpm nx g @nx/nest:library api-util \
  --directory=libs/api/util \
  --tags=scope:api,type:util
```

---

## Component Generation

```bash
# Generate component in feature library
pnpm nx g @nx/angular:component student-list \
  --project=feature-students \
  --standalone \
  --changeDetection=OnPush \
  --export

# Generate service
pnpm nx g @nx/angular:service student \
  --project=feature-students
```

---

## Import Path Aliases

**This workspace already defines path aliases in `tsconfig.base.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/util": ["libs/shared/util/src/index.ts"],
      "@/data-access": ["libs/shared/data-access/src/index.ts"],
      "@/ui": ["libs/web/ui/src/index.ts"],
      "@/feature-shell": ["libs/web/feature-shell/src/index.ts"],
      "@/api/data-access": ["libs/api/data-access/src/index.ts"],
      "@/api/util": ["libs/api/util/src/index.ts"]
    }
  }
}
```

---

## Project Tags & Boundaries

**Note:** the repo uses a flat ESLint config (`eslint.config.mjs`). To enforce the feature-library architecture, add tags to project `project.json` files and tighten `@nx/enforce-module-boundaries` `depConstraints`.

**project.json Tags (recommended):**

```json
{
  "targetDefaults": {
    "scope:web",          // web | api | shared
    "type:feature",       // feature | ui | data-access | util
    "domain:students"     // optional business domain
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["!{projectRoot}/**/*.spec.ts"]
**Enforce Boundaries (eslint.config.mjs snippet):**
```js
{
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        depConstraints: [
          { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:ui', 'type:util'] },
          { sourceTag: 'type:ui', onlyDependOnLibsWithTags: ['type:util'] },
          { sourceTag: 'type:data-access', onlyDependOnLibsWithTags: ['type:util'] },
          { sourceTag: 'type:util', onlyDependOnLibsWithTags: ['type:util'] }
        ]
      }
    ]
  }
}
```

        "depConstraints": [
          {
            "sourceTag": "scope:frontend",
            "onlyDependOnLibsWithTags": ["scope:frontend", "scope:shared"]
          },
          {
            "sourceTag": "type:feature",
            "onlyDependOnLibsWithTags": ["type:feature", "type:shared", "type:util"]
          }
        ]
      }
    ]
  }
}

```

---

## Build & Serve Commands

```bash
pnpm nx serve web

pnpm nx build web

pnpm nx serve api

pnpm nx build api

# Run affected commands (only changed projects)
pnpm nx affected -t build
pnpm nx affected -t test
pnpm nx affected -t lint

# Dependency graph
pnpm nx graph
```

---

## Lazy Loading Setup

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'students',
    loadChildren: () =>
      import('@/feature-students').then(m => m.studentsRoutes)
  }
];
```

**Feature Routes (libs/web/feature-students/src/lib/students.routes.ts):**

```typescript
import { Routes } from '@angular/router';
import { StudentListComponent } from './components/student-list/student-list.component';

export const studentsRoutes: Routes = [
  {
    path: '',
    component: StudentListComponent
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/student-detail/student-detail.component').then(
        m => m.StudentDetailComponent
      )
  }
];
```

---

## Public API (index.ts)

```typescript
// libs/web/feature-students/src/index.ts
export * from './lib/students.routes';
export * from './lib/components/student-list/student-list.component';
export * from './lib/models/student.model';

// Don't export internal implementation details
// export * from './lib/services/student.service'; // ❌
// export * from './lib/repositories/student.repository'; // ❌
```

---

## Best Practices

### ✅ DO

- Use NX generators for consistency
- Tag libraries appropriately
- Enforce module boundaries
- Use import path aliases
- Run affected commands in CI
- Keep public APIs minimal
- Use lazy loading for features

### ❌ DON'T

- Create libraries manually
- Skip tags
- Allow circular dependencies
- Export internal implementation
- Build all projects in CI

---

## Related Skills

- Feature Management
- Code Quality Standards
- Docker & CI/CD
