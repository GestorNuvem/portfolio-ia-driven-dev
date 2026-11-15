import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../error/validation.error';
import { ValidationException } from '../validation/validation.exception';

/** Estado base de toda entidade. Entidades concretas estendem esta interface. */
export interface EntityState {
  id?: string;
}

/**
 * Entidade base da aplicação.
 * - gera o id (UUID v4) quando não informado
 * - estado somente leitura; alterações via `clone`
 * - igualdade pelo id
 * - `validate` (abstrato) usa o Validator; o construtor lança ValidationException se houver erros
 */
export abstract class Entity<TState extends EntityState = EntityState> {
  protected readonly state: Readonly<TState & { id: string }>;

  constructor(state: TState) {
    this.state = Object.freeze({ ...state, id: state.id ?? uuidv4() });
    const errors = this.validate();
    if (errors.length > 0) throw new ValidationException(errors);
  }

  get id(): string {
    return this.state.id;
  }

  /** Cópia (somente leitura) do estado atual. */
  get props(): Readonly<TState & { id: string }> {
    return this.state;
  }

  /** Validação interna de cada entidade concreta (use `Validator.validateAll`). */
  protected abstract validate(): ValidationError[];

  /** Igualdade pelo id. */
  equals(other?: Entity<EntityState> | null): boolean {
    if (other === null || other === undefined) return false;
    return this === other || this.id === other.id;
  }

  /** Cria uma cópia mesclando o estado atual com o estado parcial informado (o id é preservado). */
  clone(changes: Partial<Omit<TState, 'id'>>): this {
    const Constructor = this.constructor as new (state: TState) => this;
    return new Constructor({ ...this.state, ...changes, id: this.state.id } as TState);
  }
}
