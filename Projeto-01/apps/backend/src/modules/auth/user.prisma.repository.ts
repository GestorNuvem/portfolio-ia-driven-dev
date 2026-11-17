import { Injectable } from '@nestjs/common';
import { User, type UserRepository } from '@meu-projeto/auth';
import { DomainError, NotFoundError, type Page, type PageRequest } from '@meu-projeto/shared';
import { Prisma } from '../../generated/prisma/client.js';
import type { User as UserRecord } from '../../generated/prisma/client.js';
import { PrismaService } from '../../db/prisma.service.js';

/** E-mail já cadastrado (409). */
export class UserAlreadyExistsError extends DomainError {
  override readonly statusCode: number = 409;

  constructor() {
    super('User already exists');
  }
}

const SORTABLE_FIELDS = ['name', 'email', 'createdAt', 'updatedAt'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

/**
 * Implementação Prisma do UserRepository (tabela `users`).
 * A exclusão é lógica: preenche `deleted_at`; consultas ignoram usuários excluídos.
 */
@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entity: User): Promise<User> {
    try {
      return this.toEntity(await this.prisma.user.create({ data: this.toRecord(entity) }));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new UserAlreadyExistsError();
      }
      throw error;
    }
  }

  async update(entity: User): Promise<User> {
    const { id, createdAt: _createdAt, ...data } = this.toRecord(entity);
    const result = await this.prisma.user.updateMany({ where: { id, deletedAt: null }, data });
    if (result.count === 0) throw new NotFoundError(`User ${id} not found`);
    return entity;
  }

  async delete(id: string): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundError(`User ${id} not found`);
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    return record ? this.toEntity(record) : null;
  }

  async findPage(request: PageRequest): Promise<Page<User>> {
    const where = { deletedAt: null };
    const orderBy = (request.sort ?? [])
      .filter((s): s is { field: SortableField; direction: 'asc' | 'desc' } =>
        (SORTABLE_FIELDS as readonly string[]).includes(s.field),
      )
      .map((s) => ({ [s.field]: s.direction }));
    const [records, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip: (request.page - 1) * request.pageSize,
        take: request.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: records.map((record) => this.toEntity(record)),
      page: request.page,
      pageSize: request.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / request.pageSize),
    };
  }

  private toRecord(entity: User): UserRecord {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      password: entity.password,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  private toEntity(record: UserRecord): User {
    return new User(record);
  }
}
