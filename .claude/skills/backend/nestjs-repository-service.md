---
name: nestjs-repository-service
description: Implements repository and service patterns in NestJS backend, keeping data access separate from business logic. Use when creating services, adding repositories, implementing business logic, setting up data access layers, or when the user mentions NestJS services, repositories, data access, or service layer architecture.
---

# NestJS Repository & Service Pattern

**Note About Persistence**: This workspace does not currently include TypeORM/Postgres packages. If/when a database layer is added, prefer putting DB wiring in `libs/api/data-access` and keeping business logic in services.

---

## Repository Pattern

### If using TypeORM (optional)

```typescript
@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repository: Repository<StudentEntity>
  ) {}

  async findAll(): Promise<StudentEntity[]> {
    return this.repository.find({
      where: { deletedAt: null }
    });
  }

  async findById(id: string): Promise<StudentEntity | null> {
    return this.repository.findOne({
      where: { id, deletedAt: null }
    });
  }

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const patient = this.repository.create(dto);
    return this.repository.save(patient);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentEntity> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update(id, { deletedAt: new Date() });
  }

  async search(searchTerm: string): Promise<StudentEntity[]> {
    return this.repository
      .createQueryBuilder('patient')
      .where('patient.deletedAt IS NULL')
      .andWhere(
        '(patient.firstName ILIKE :search OR patient.lastName ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .getMany();
  }
}
```

---

## Service Layer

```typescript
@Injectable()
export class StudentService {
  constructor(
    private readonly repository: StudentRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async findAll(): Promise<StudentResponseDto[]> {
    const patients = await this.repository.findAll();
    return patients.map(p => this.toResponseDto(p));
  }

  async findById(id: string): Promise<StudentResponseDto> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Student ${id} not found`);
    }
    return this.toResponseDto(patient);
  }

  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    // Business validation
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Student already exists');
    }

    const patient = await this.repository.create(dto);

    // Emit event
    this.eventEmitter.emit('patient.created', {
      id: patient.id,
      email: patient.email
    });

    return this.toResponseDto(patient);
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    const updated = await this.repository.update(id, dto);
    this.eventEmitter.emit('patient.updated', { id: updated.id });

    return this.toResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    await this.repository.softDelete(id);
  }

  private toResponseDto(entity: StudentEntity): StudentResponseDto {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      createdAt: entity.createdAt
    };
  }
}
```

---

## Module Configuration

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity])],
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
  exports: [StudentService]
})
export class StudentModule {}
```

---

## Best Practices

### ✅ DO

- Repositories handle data access only
- Services contain business logic
- Transform entities to DTOs
- Throw appropriate exceptions
- Emit events for actions
- Validate business rules
- Always generate files with the nest cli

### ❌ DON'T

- Put business logic in repositories
- Return entities from services (use DTOs)
- Skip error handling
- Mix concerns

---

## Related Skills

- TypeORM & Database
- Multi-Tenancy Implementation
- NestJS Microservice Architecture
