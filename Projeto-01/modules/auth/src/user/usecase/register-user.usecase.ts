import { RequiredRule, StrongPasswordRule, UseCase, Validator } from '@meu-projeto/shared';
import { User } from '../model/user.entity';
import { CryptoProvider } from '../provider/crypto.provider';
import { UserRepository } from '../provider/user.repository';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

/** Registra um novo usuário, armazenando apenas o hash da senha. */
export class RegisterUserUseCase implements UseCase<RegisterUserInput, void> {
  constructor(
    private readonly repository: UserRepository,
    private readonly crypto: CryptoProvider,
  ) {}

  async execute(input: RegisterUserInput): Promise<void> {
    // 1) a senha em texto puro precisa ser forte
    Validator.assert([
      { fieldCode: 'user.password', value: input.password, rules: [new RequiredRule(), new StrongPasswordRule()] },
    ]);

    // 2) senha limpa -> hash
    const hashPassword = await this.crypto.encrypt(input.password);

    // 3) e 4) cria o usuário; o construtor chama validate() e lança ValidationException se inválido
    const user = new User({ name: input.name, email: input.email, password: hashPassword });

    // 5) persiste
    await this.repository.create(user);
  }
}
