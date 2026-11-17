import { ValidationError } from '../error/validation.error';
import { EmailRule, RequiredRule, StrongPasswordRule, UuidRule } from '../validation/rules';
import { ValidationException } from '../validation/validation.exception';
import { Validator } from '../validation/validator';
import { Entity, EntityState } from './entity';

interface UserState extends EntityState {
  name: string;
  email: string;
  password: string;
}

class User extends Entity<UserState> {
  get name(): string {
    return this.state.name;
  }

  get email(): string {
    return this.state.email;
  }

  protected validate(): ValidationError[] {
    return Validator.validateAll([
      { fieldCode: 'user.id', value: this.state.id, rules: [new RequiredRule(), new UuidRule()] },
      { fieldCode: 'user.name', value: this.state.name, rules: [new RequiredRule()] },
      { fieldCode: 'user.email', value: this.state.email, rules: [new RequiredRule(), new EmailRule()] },
      { fieldCode: 'user.password', value: this.state.password, rules: [new RequiredRule(), new StrongPasswordRule()] },
    ]);
  }
}

const valid: UserState = { name: 'Ana', email: 'ana@mail.com', password: 'Abcdef1!' };

describe('Entity', () => {
  it('gera um UUID v4 quando o id não é informado', () => {
    const user = new User(valid);
    expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('mantém o id informado', () => {
    const id = '9b2c3f4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f';
    expect(new User({ ...valid, id }).id).toBe(id);
  });

  it('expõe o estado somente leitura', () => {
    const user = new User(valid);
    expect(user.props).toMatchObject(valid);
    expect(Object.isFrozen(user.props)).toBe(true);
    expect(user.name).toBe('Ana');
  });

  it('lança ValidationException com todos os erros ao criar entidade inválida', () => {
    expect(() => new User({ name: '', email: 'x', password: '123' })).toThrow(ValidationException);
    try {
      new User({ id: 'abc', name: '', email: 'x', password: '123' });
    } catch (err) {
      expect((err as ValidationException).errors.map((e) => e.fullCode)).toEqual([
        'user.id.invalid.uuid',
        'user.name.required',
        'user.email.invalid.email',
        'user.password.strong.password',
      ]);
    }
  });

  it('compara igualdade pelo id', () => {
    const a = new User(valid);
    const sameId = new User({ ...valid, id: a.id, name: 'Outro' });
    expect(a.equals(a)).toBe(true);
    expect(a.equals(sameId)).toBe(true);
    expect(a.equals(new User(valid))).toBe(false);
    expect(a.equals(null)).toBe(false);
    expect(a.equals(undefined)).toBe(false);
  });

  it('clone mescla o estado parcial, preserva o id e não altera o original', () => {
    const user = new User(valid);
    const changed = user.clone({ email: 'novo@mail.com' });
    expect(changed).toBeInstanceOf(User);
    expect(changed).not.toBe(user);
    expect(changed.id).toBe(user.id);
    expect(changed.email).toBe('novo@mail.com');
    expect(changed.name).toBe('Ana');
    expect(user.email).toBe('ana@mail.com');
  });

  it('preenche createdAt/updatedAt com a data atual e deletedAt com null por padrão', () => {
    const before = Date.now();
    const user = new User(valid);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(user.updatedAt).toEqual(user.createdAt);
    expect(user.deletedAt).toBeNull();
  });

  it('mantém as datas informadas', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const updatedAt = new Date('2024-02-01T00:00:00Z');
    const deletedAt = new Date('2024-03-01T00:00:00Z');
    const user = new User({ ...valid, createdAt, updatedAt, deletedAt });
    expect(user.createdAt).toBe(createdAt);
    expect(user.updatedAt).toBe(updatedAt);
    expect(user.deletedAt).toBe(deletedAt);
  });

  it('clone preserva createdAt e atualiza updatedAt', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const user = new User({ ...valid, createdAt });
    const changed = user.clone({ name: 'Bia' });
    expect(changed.createdAt).toBe(createdAt);
    expect(changed.updatedAt.getTime()).toBeGreaterThan(createdAt.getTime());
    expect(user.updatedAt).toBe(createdAt);
  });

  it('clone aceita updatedAt e deletedAt explícitos', () => {
    const updatedAt = new Date('2030-01-01T00:00:00Z');
    const deletedAt = new Date('2030-01-02T00:00:00Z');
    const changed = new User(valid).clone({ updatedAt, deletedAt });
    expect(changed.updatedAt).toBe(updatedAt);
    expect(changed.deletedAt).toBe(deletedAt);
  });

  it('clone valida o novo estado', () => {
    expect(() => new User(valid).clone({ email: 'invalido' })).toThrow(ValidationException);
  });
});
