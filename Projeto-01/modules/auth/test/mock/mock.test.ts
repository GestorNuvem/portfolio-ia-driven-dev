import { DomainError, NotFoundError } from '@meu-projeto/shared';
import { User } from '../../src/user/model/user.entity';
import { FakeCryptoProvider, InMemoryUserRepository } from './index';

const HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const newUser = (name: string, email: string) => new User({ name, email, password: HASH });

describe('FakeCryptoProvider', () => {
  const crypto = new FakeCryptoProvider();

  it('gera hash no formato bcrypt, aceito pela entidade User', async () => {
    const hash = await crypto.encrypt('Abcdef1!');
    expect(hash).toMatch(/^\$2b\$10\$[./A-Za-z0-9]{53}$/);
    expect(() => new User({ name: 'Ana Silva', email: 'ana@mail.com', password: hash })).not.toThrow();
  });

  it('é determinístico e diferencia senhas', async () => {
    expect(await crypto.encrypt('Abcdef1!')).toBe(await crypto.encrypt('Abcdef1!'));
    expect(await crypto.encrypt('Abcdef1!')).not.toBe(await crypto.encrypt('Abcdef1?'));
  });

  it('compara senha e hash', async () => {
    const hash = await crypto.encrypt('Abcdef1!');
    expect(await crypto.compare('Abcdef1!', hash)).toBe(true);
    expect(await crypto.compare('outra', hash)).toBe(false);
  });
});

describe('InMemoryUserRepository', () => {
  it('cria, busca, atualiza e remove usuários', async () => {
    const repo = new InMemoryUserRepository();
    const user = newUser('Ana Silva', 'ana@mail.com');

    expect(await repo.create(user)).toBe(user);
    expect(await repo.findById(user.id)).toBe(user);
    expect(await repo.findById('inexistente')).toBeNull();

    const changed = user.clone({ name: 'Ana Souza' });
    expect(await repo.update(changed)).toBe(changed);
    expect((await repo.findById(user.id))?.name).toBe('Ana Souza');

    await repo.delete(user.id);
    expect(repo.items).toHaveLength(0);
  });

  it('não permite id ou e-mail duplicados', async () => {
    const user = newUser('Ana Silva', 'ana@mail.com');
    const repo = new InMemoryUserRepository([user]);
    await expect(repo.create(user)).rejects.toThrow(DomainError);
    await expect(repo.create(newUser('Bia Souza', 'ana@mail.com'))).rejects.toThrow('already exists');
  });

  it('lança NotFoundError ao atualizar ou remover usuário inexistente', async () => {
    const repo = new InMemoryUserRepository();
    await expect(repo.update(newUser('Ana Silva', 'ana@mail.com'))).rejects.toThrow(NotFoundError);
    await expect(repo.delete('inexistente')).rejects.toThrow(NotFoundError);
  });

  it('pagina e ordena os usuários', async () => {
    const carla = newUser('Carla Dias', 'carla@mail.com');
    const ana = newUser('Ana Silva', 'ana@mail.com');
    const bia = newUser('Bia Souza', 'bia@mail.com');
    const repo = new InMemoryUserRepository([carla, ana, bia]);

    const asc = await repo.findPage({ page: 1, pageSize: 2, sort: [{ field: 'name', direction: 'asc' }] });
    expect(asc).toEqual({ items: [ana, bia], page: 1, pageSize: 2, totalItems: 3, totalPages: 2 });

    const desc = await repo.findPage({ page: 2, pageSize: 2, sort: [{ field: 'name', direction: 'desc' }] });
    expect(desc.items).toEqual([ana]);

    const tie = await repo.findPage({
      page: 1,
      pageSize: 3,
      sort: [
        { field: 'deletedAt', direction: 'asc' },
        { field: 'email', direction: 'asc' },
      ],
    });
    expect(tie.items).toEqual([ana, bia, carla]);

    const unsorted = await repo.findPage({ page: 1, pageSize: 10 });
    expect(unsorted.items).toEqual([carla, ana, bia]);

    const sameKey = await repo.findPage({ page: 1, pageSize: 10, sort: [{ field: 'password', direction: 'asc' }] });
    expect(sameKey.items).toEqual([carla, ana, bia]);
  });
});
