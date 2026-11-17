import { ValidationException } from '@meu-projeto/shared';
import { User, UserState } from './user.entity';

const HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const valid: UserState = { name: 'Ana Silva', email: 'ana@mail.com', password: HASH };

function errorsOf(state: Partial<UserState>): string[] {
  try {
    new User({ ...valid, ...state } as UserState);
  } catch (err) {
    return (err as ValidationException).errors.map((e) => e.fullCode);
  }
  return [];
}

describe('User', () => {
  it('cria um usuário válido expondo os atributos', () => {
    const user = new User(valid);
    expect(user.id).toBeDefined();
    expect(user.name).toBe('Ana Silva');
    expect(user.email).toBe('ana@mail.com');
    expect(user.password).toBe(HASH);
  });

  it('herda as datas de criação, alteração e exclusão da entidade base', () => {
    const user = new User(valid);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toEqual(user.createdAt);
    expect(user.deletedAt).toBeNull();
  });

  it('mantém id e datas informados (reidratação do banco)', () => {
    const state: UserState = {
      ...valid,
      id: '9b2c3f4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-02-01T00:00:00Z'),
      deletedAt: new Date('2024-03-01T00:00:00Z'),
    };
    expect(new User(state).props).toEqual(state);
  });

  it('clone altera o usuário, preserva id/createdAt e atualiza updatedAt', () => {
    const user = new User({ ...valid, createdAt: new Date('2024-01-01T00:00:00Z') });
    const changed = user.clone({ email: 'nova@mail.com' });
    expect(changed).toBeInstanceOf(User);
    expect(changed.id).toBe(user.id);
    expect(changed.email).toBe('nova@mail.com');
    expect(changed.createdAt).toBe(user.createdAt);
    expect(changed.updatedAt.getTime()).toBeGreaterThan(user.updatedAt.getTime());
  });

  describe('nome', () => {
    it.each(['José da Silva', "Joana D'Ávila", 'Ana-Maria Müller', '  Bia   Souza '])('aceita %p', (name) => {
      expect(errorsOf({ name })).toEqual([]);
    });

    it('é obrigatório', () => {
      expect(errorsOf({ name: '' })).toEqual(['user.name.required', 'user.name.min.length', 'user.name.person.name']);
      expect(errorsOf({ name: undefined })).toEqual(['user.name.required']);
    });

    it('tem no mínimo 3 caracteres', () => {
      expect(errorsOf({ name: 'AB' })).toEqual(['user.name.min.length', 'user.name.person.name']);
      expect(errorsOf({ name: 'A B' })).toEqual([]);
    });

    it('tem no máximo 80 caracteres', () => {
      expect(errorsOf({ name: `Ana ${'a'.repeat(77)}` })).toEqual(['user.name.max.length']);
      expect(errorsOf({ name: `Ana ${'a'.repeat(76)}` })).toEqual([]);
    });

    it.each(['Ana', 'Ana Silva2', 'Ana @Silva', 'Ana Silva!', 'Ana_Silva Souza'])('rejeita %p', (name) => {
      expect(errorsOf({ name })).toEqual(['user.name.person.name']);
    });
  });

  describe('e-mail', () => {
    it('é obrigatório', () => {
      expect(errorsOf({ email: undefined })).toEqual(['user.email.required']);
    });

    it.each(['ana', 'ana@', 'ana@mail', 'ana silva@mail.com'])('rejeita %p', (email) => {
      expect(errorsOf({ email })).toEqual(['user.email.invalid.email']);
    });
  });

  describe('senha', () => {
    it('é obrigatória', () => {
      expect(errorsOf({ password: undefined })).toEqual(['user.password.required']);
    });

    it('não aceita senha em texto puro, nem mesmo uma senha forte', () => {
      expect(errorsOf({ password: 'Abcdef1!' })).toEqual(['user.password.bcrypt.hash']);
    });

    it('rejeita hash que não é bcrypt', () => {
      expect(errorsOf({ password: '5f4dcc3b5aa765d61d8327deb882cf99' })).toEqual(['user.password.bcrypt.hash']);
    });
  });

  it('acumula todos os erros em uma única exceção', () => {
    expect(() => new User({ name: 'A', email: 'x', password: '123' })).toThrow(ValidationException);
    expect(errorsOf({ name: 'A', email: 'x', password: '123' })).toEqual([
      'user.name.min.length',
      'user.name.person.name',
      'user.email.invalid.email',
      'user.password.bcrypt.hash',
    ]);
  });
});
