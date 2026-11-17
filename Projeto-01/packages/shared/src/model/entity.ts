import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../error/validation.error';
import { ValidationException } from '../validation/validation.exception';

/**
 * Estado base de toda entidade. Entidades concretas estendem esta interface.
 * As datas de auditoria são persistidas no banco junto com a entidade:
 * - `createdAt`: data de criação (padrão: agora)
 * - `updatedAt`: data da última alteração (padrão: `createdAt`; atualizada em `clone`)
 * - `deletedAt`: data de exclusão lógica (opcional)
 */
export interface EntityState {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/** Estado completo após a construção: id e datas obrigatórias sempre preenchidos. */
export type EntityProps<TState extends EntityState> = TState & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * Entidade base da aplicação.
 * - gera o id (UUID v4) quando não informado
 * - preenche `createdAt`/`updatedAt` quando não informados e `deletedAt` com `null`
 * - estado somente leitura; alterações via `clone` (que atualiza `updatedAt`)
 * - igualdade pelo id
 * - `validate` (abstrato) usa o Validator; o construtor lança ValidationException se houver erros
 */
export abstract class Entity<TState extends EntityState = EntityState> {
  protected readonly state: Readonly<EntityProps<TState>>;

  constructor(state: TState) {
    const createdAt = state.createdAt ?? new Date();
    this.state = Object.freeze({
      ...state,
      id: state.id ?? uuidv4(),
      createdAt,
      updatedAt: state.updatedAt ?? createdAt,
      deletedAt: state.deletedAt ?? null,
    });
    const errors = this.validate();
    if (errors.length > 0) throw new ValidationException(errors);
  }

  get id(): string {
    return this.state.id;
  }

  get createdAt(): Date {
    return this.state.createdAt;
  }

  get updatedAt(): Date {
    return this.state.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.state.deletedAt;
  }

  /** Cópia (somente leitura) do estado atual. */
  get props(): Readonly<EntityProps<TState>> {
    return this.state;
  }

  /** Validação interna de cada entidade concreta (use `Validator.validateAll`). */
  protected abstract validate(): ValidationError[];

  /** Igualdade pelo id. */
  equals(other?: Entity<EntityState> | null): boolean {
    if (other === null || other === undefined) return false;
    return this === other || this.id === other.id;
  }

  /**
   * Cria uma cópia mesclando o estado atual com o estado parcial informado.
   * O id e o `createdAt` são preservados; `updatedAt` passa a ser o momento da alteração
   * (a menos que seja informado explicitamente em `changes`).
   */
  clone(changes: Partial<Omit<TState, 'id' | 'createdAt'>>): this {
    const Constructor = this.constructor as new (state: TState) => this;
    return new Constructor({
      ...this.state,
      updatedAt: new Date(),
      ...changes,
      id: this.state.id,
      createdAt: this.state.createdAt,
    } as TState);
  }
}
