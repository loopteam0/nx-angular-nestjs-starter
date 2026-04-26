---
name: multi-tenancy-implementation
description: Implements multi-tenancy architecture in NestJS for multi-school support including tenant identification, request context management, and isolation strategies. Use when implementing multi-tenancy, tenant isolation, or when the user mentions multi-tenant, school isolation, or tenant context.
---

# Multi-Tenancy Implementation

---

## Where This Lives In This Repo

- Middleware/guards/interceptors: `apps/api/src/app/*`
- Reusable helpers/decorators: `libs/api/util/src/lib/*`
- Persistence wiring (when added): `libs/api/data-access/src/lib/*`

---

## Tenant Identification Strategies

### 1. Subdomain-based (Recommended)

```
school-a.sms.local → Tenant: school-a
school-b.sms.local → Tenant: school-b
```

### 2. Header-based

```
X-Tenant-ID: school-a
```

### 3. JWT Claim-based

```json
{
  "sub": "user-id",
  "tenantId": "school-a",
  "role": "staff"
}
```

---

## Tenant Middleware

```typescript
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    const host = req.get('host');
    const subdomain = host?.split('.')[0];
    const headerTenantId = req.get('X-Tenant-ID');
    const jwtTenantId = req.user?.tenantId;

    const tenantId = jwtTenantId || headerTenantId || subdomain;

    if (!tenantId) {
      throw new BadRequestException('Tenant identification failed');
    }

    req.tenantId = tenantId;
    next();
  }
}
```

---

## Tenant Context Service

```typescript
import { Injectable, Scope, createParamDecorator, ExecutionContext } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
  private tenantId: string;

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  getTenantId(): string {
    if (!this.tenantId) {
      throw new Error('Tenant ID not set');
    }
    return this.tenantId;
  }
}

// Decorator
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId;
  }
);
```

---

## Database Isolation

### Shared Database Strategy (Recommended when you add a DB)

```typescript
// Base entity with tenantId
export abstract class BaseTenantEntity {
  @Column({ type: 'varchar', length: 100 })
  tenantId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}

// Entity
@Entity('patients')
@Index(['tenantId', 'email'], { unique: true })
export class StudentEntity extends BaseTenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  email: string;
}
```

---

## Tenant-Aware Repository

```typescript
@Injectable({ scope: Scope.REQUEST })
export class StudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repository: Repository<StudentEntity>,
    private readonly tenantService: TenantService
  ) {}

  private getBaseCriteria(): FindOptionsWhere<StudentEntity> {
    return {
      tenantId: this.tenantService.getTenantId(),
      deletedAt: null
    } as FindOptionsWhere<StudentEntity>;
  }

  async findAll(): Promise<StudentEntity[]> {
    return this.repository.find({
      where: this.getBaseCriteria()
    });
  }

  async findById(id: string): Promise<StudentEntity | null> {
    return this.repository.findOne({
      where: {
        ...this.getBaseCriteria(),
        id
      } as FindOptionsWhere<StudentEntity>
    });
  }

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const patient = this.repository.create({
      ...dto,
      tenantId: this.tenantService.getTenantId()
    });
    return this.repository.save(patient);
  }
}
```

---

## Tenant Guard

```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantService: TenantService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID missing');
    }

    this.tenantService.setTenantId(tenantId);

    const user = request.user;
    if (user && user.tenantId && user.tenantId !== tenantId) {
      throw new UnauthorizedException('Access denied');
    }

    return true;
  }
}
```

---

## Best Practices

### ✅ DO

- ALL entities extend BaseTenantEntity
- ALL repositories are request-scoped
- ALL queries filter by tenantId
- Composite unique constraints
- Auto-inject tenantId
- Test tenant isolation

### ❌ DON'T

- Allow cross-tenant data access
- Forget tenantId in queries
- Use global-scoped repositories
- Skip tenant validation

---

## Related Skills

- NestJS Microservice Architecture
- TypeORM & Database
- NestJS Repository & Service Pattern
