import { DomainError, NotFoundError, Page, PageRequest } from '@meu-projeto/shared';
import { User } from '../../src/user/model/user.entity';
import { UserRepository } from '../../src/user/provider/user.repository';

/**
 * Implementação em memória do UserRepository para testes.
 * Funciona como um banco simples: os usuários ficam em um Map indexado pelo id.
 */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  constructor(initial: User[] = []) {
    initial.forEach((user) => this.users.set(user.id, user));
  }

  /** Todos os usuários armazenados (útil para asserções nos testes). */
  get items(): User[] {
    return [...this.users.values()];
  }

  async create(entity: User): Promise<User> {
    if (this.users.has(entity.id)) throw new DomainError(`User ${entity.id} already exists`);
    if (this.items.some((user) => user.email === entity.email)) {
      throw new DomainError(`User with email ${entity.email} already exists`);
    }
    this.users.set(entity.id, entity);
    return entity;
  }

  async update(entity: User): Promise<User> {
    if (!this.users.has(entity.id)) throw new NotFoundError(`User ${entity.id} not found`);
    this.users.set(entity.id, entity);
    return entity;
  }

  async delete(id: string): Promise<void> {
    if (!this.users.delete(id)) throw new NotFoundError(`User ${id} not found`);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findPage(request: PageRequest): Promise<Page<User>> {
    const sorted = [...this.items].sort((a, b) => {
      for (const { field, direction } of request.sort ?? []) {
        const left = String((a.props as Record<string, unknown>)[field] ?? '');
        const right = String((b.props as Record<string, unknown>)[field] ?? '');
        const result = left.localeCompare(right);
        if (result !== 0) return direction === 'desc' ? -result : result;
      }
      return 0;
    });
    const start = (request.page - 1) * request.pageSize;
    return {
      items: sorted.slice(start, start + request.pageSize),
      page: request.page,
      pageSize: request.pageSize,
      totalItems: sorted.length,
      totalPages: Math.ceil(sorted.length / request.pageSize),
    };
  }
}
