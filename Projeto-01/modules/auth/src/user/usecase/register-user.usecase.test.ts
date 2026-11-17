import { ValidationException } from '@meu-projeto/shared';
import { FakeCryptoProvider, InMemoryUserRepository } from '../../../test/mock';
import { User } from '../model/user.entity';
import { RegisterUserInput, RegisterUserUseCase } from './register-user.usecase';

const input: RegisterUserInput = { name: 'Ana Silva', email: 'ana@mail.com', password: 'Abcdef1!' };

function setup() {
  const repository = new InMemoryUserRepository();
  const crypto = new FakeCryptoProvider();
  const useCase = new RegisterUserUseCase(repository, crypto);
  return { repository, crypto, useCase };
}

function codesOf(err: unknown): string[] {
  return (err as ValidationException).errors.map((e) => e.fullCode);
}

describe('RegisterUserUseCase', () => {
  it('registra o usuário persistindo o hash da senha (nunca a senha limpa)', async () => {
    const { repository, crypto, useCase } = setup();
    const encrypt = jest.spyOn(crypto, 'encrypt');
    const create = jest.spyOn(repository, 'create');

    await expect(useCase.execute(input)).resolves.toBeUndefined();

    expect(encrypt).toHaveBeenCalledWith('Abcdef1!');
    expect(create).toHaveBeenCalledTimes(1);
    const [saved] = repository.items;
    expect(saved).toBeInstanceOf(User);
    expect(saved.name).toBe('Ana Silva');
    expect(saved.email).toBe('ana@mail.com');
    expect(saved.password).not.toBe('Abcdef1!');
    expect(saved.password).toBe(await encrypt.mock.results[0].value);
    expect(await crypto.compare('Abcdef1!', saved.password)).toBe(true);
  });

  it.each([
    ['fraca', 'abcdef'],
    ['sem maiúscula', 'abcdef1!'],
    ['sem número', 'Abcdefg!'],
  ])('rejeita senha %s antes de criptografar ou persistir', async (_, password) => {
    const { repository, crypto, useCase } = setup();
    const encrypt = jest.spyOn(crypto, 'encrypt');

    const error = await useCase.execute({ ...input, password }).catch((e) => e);

    expect(error).toBeInstanceOf(ValidationException);
    expect(codesOf(error)).toEqual(['user.password.strong.password']);
    expect(encrypt).not.toHaveBeenCalled();
    expect(repository.items).toHaveLength(0);
  });

  it('exige a senha', async () => {
    const { useCase } = setup();
    const error = await useCase.execute({ ...input, password: '' }).catch((e) => e);
    expect(codesOf(error)).toEqual(['user.password.required', 'user.password.strong.password']);
  });

  it('valida o usuário e não persiste quando nome ou e-mail são inválidos', async () => {
    const { repository, useCase } = setup();
    const create = jest.spyOn(repository, 'create');

    const error = await useCase.execute({ ...input, name: 'Ana', email: 'invalido' }).catch((e) => e);

    expect(error).toBeInstanceOf(ValidationException);
    expect(codesOf(error)).toEqual(['user.name.person.name', 'user.email.invalid.email']);
    expect(create).not.toHaveBeenCalled();
  });

  it('propaga erros do repositório', async () => {
    const { useCase } = setup();
    await useCase.execute(input);
    await expect(useCase.execute(input)).rejects.toThrow('already exists');
  });
});
