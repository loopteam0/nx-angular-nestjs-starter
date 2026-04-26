---
name: nestjs-testing
description: Writes comprehensive tests for NestJS services and controllers using Jest and E2E tests via the existing api-e2e harness. Use when writing backend tests, testing services/APIs, or when the user mentions testing, Jest, E2E tests, or NestJS testing.
---

# NestJS Testing

---

## How Tests Run In This Repo

```bash
# API E2E (Jest)
pnpm nx e2e api-e2e

# Web E2E (Playwright)
pnpm nx e2e web-e2e
```

---

## Service Unit Tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './patient.service';
import { StudentRepository } from '../repositories/patient.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';

describe('StudentService', () => {
  let service: StudentService;
  let repository: StudentRepository;

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
  };

  const mockEventEmitter = {
    emit: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: StudentRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter }
      ]
    }).compile();

    service = module.get<StudentService>(StudentService);
    repository = module.get<StudentRepository>(StudentRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a patient', async () => {
      const mockStudent = { id: '1', firstName: 'John' };
      mockRepository.findById.mockResolvedValue(mockStudent);

      const result = await service.findById('1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.findById('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## Repository Unit Tests

```typescript
describe('StudentRepository', () => {
  let repository: StudentRepository;
  let typeOrmRepository: Repository<StudentEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentRepository,
        {
          provide: getRepositoryToken(StudentEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn()
          }
        }
      ]
    }).compile();

    repository = module.get<StudentRepository>(StudentRepository);
    typeOrmRepository = module.get(getRepositoryToken(StudentEntity));
  });

  it('should find all patients', async () => {
    const mockStudents = [{ id: '1', firstName: 'John' }];
    jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockStudents);

    const result = await repository.findAll();
    expect(result).toEqual(mockStudents);
  });
});
```

---

## E2E Tests

```typescript
import axios from 'axios';

// This matches the generated Nx Jest e2e setup in `apps/api-e2e/src/support/*`.
// - `global-setup.ts` waits for the API port to open
// - `test-setup.ts` sets `axios.defaults.baseURL`

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get('/api');
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
```

---

## Coverage Requirements

Treat these as targets, not blockers, until the app’s test strategy is fully defined:

- Services: high coverage
- Guards/interceptors/pipes: high coverage
- Controllers: cover critical paths
- E2E: cover core flows (happy path + auth/tenant boundaries when added)

---

## Related Skills

- NestJS Microservice Architecture
- NestJS Repository & Service Pattern
- TypeORM & Database
