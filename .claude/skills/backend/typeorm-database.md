---
name: typeorm-database
description: Implements database operations using TypeORM 0.3+ with PostgreSQL including entities, relationships, migrations, and query builders. Note that this workspace does not currently include TypeORM/Postgres dependencies. Use when working with databases, creating entities, writing migrations, or when the user mentions TypeORM, database, entity, or data persistence.
---

# TypeORM & Database

**Note**: This workspace does not currently include TypeORM/Postgres dependencies.

---

## Entity Definition

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @Column({ type: 'text', nullable: true })
  medicalHistory?: string;

  @Column({ type: 'simple-array', nullable: true })
  allergies?: string[];

  // Example relationship
  // @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.student)
  // enrollments: EnrollmentEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
```

---

## Relationships

```typescript
// One-to-Many
@Entity('enrollments')
export class EnrollmentEntity {
  @ManyToOne(() => StudentEntity)
  student: StudentEntity;

  @Column()
  studentId: string;
}

// Many-to-Many
@Entity('doctors')
export class DoctorEntity {
  @ManyToMany(() => SpecialtyEntity)
  @JoinTable()
  specialties: SpecialtyEntity[];
}
```

---

## Query Builder

```typescript
async findActive(): Promise<StudentEntity[]> {
  return this.repository
    .createQueryBuilder('student')
    .where('student.status = :status', { status: 'active' })
    .andWhere('student.deletedAt IS NULL')
    .orderBy('student.lastName', 'ASC')
    .getMany();
}

async searchByName(term: string): Promise<StudentEntity[]> {
  return this.repository
    .createQueryBuilder('student')
    .where('student.firstName ILIKE :term', { term: `%${term}%` })
    .orWhere('student.lastName ILIKE :term', { term: `%${term}%` })
    .getMany();
}
```

---

## Migrations

```typescript
// Generate migration
// Add a migration script or Nx target first, then run it via pnpm.
// Example (placeholder): pnpm typeorm migration:generate -n CreateStudents

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudents1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "email" varchar(255) UNIQUE NOT NULL,
        "createdAt" timestamp DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "students"`);
  }
}
```

---

## Database Module

```typescript
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development'
      })
    })
  ]
})
export class DatabaseModule {}
```

Tip: in this repo, prefer keeping DB wiring in `libs/api/data-access` and importing it from `apps/api`.

---

## Best Practices

### ✅ DO

- Use UUID for primary keys
- Add timestamps (createdAt, updatedAt)
- Implement soft deletes
- Use migrations
- Index frequently queried columns
- Use enums for status fields

### ❌ DON'T

- Use synchronize in production
- Forget to add indexes
- Store sensitive data unencrypted
- Use SELECT * in production

---

## Related Skills

- NestJS Repository & Service Pattern
- Multi-Tenancy Implementation
- NestJS Testing
