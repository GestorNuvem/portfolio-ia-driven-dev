import {
  BcryptHashRule,
  EmailRule,
  Entity,
  EntityState,
  MaxLengthRule,
  MinLengthRule,
  PersonNameRule,
  RequiredRule,
  ValidationError,
  Validator,
} from '@meu-projeto/shared';

/**
 * Estado do usuário. `id`, `createdAt`, `updatedAt` e `deletedAt` vêm da entidade base.
 * `password` é sempre o hash bcrypt — a senha em texto puro nunca fica na entidade.
 */
export interface UserState extends EntityState {
  name: string;
  email: string;
  password: string;
}

export class User extends Entity<UserState> {
  get name(): string {
    return this.state.name;
  }

  get email(): string {
    return this.state.email;
  }

  get password(): string {
    return this.state.password;
  }

  protected validate(): ValidationError[] {
    return Validator.validateAll([
      {
        fieldCode: 'user.name',
        value: this.state.name,
        rules: [new RequiredRule(), new MinLengthRule(3), new MaxLengthRule(80), new PersonNameRule()],
      },
      {
        fieldCode: 'user.email',
        value: this.state.email,
        rules: [new RequiredRule(), new EmailRule()],
      },
      {
        fieldCode: 'user.password',
        value: this.state.password,
        rules: [new RequiredRule(), new BcryptHashRule()],
      },
    ]);
  }
}
