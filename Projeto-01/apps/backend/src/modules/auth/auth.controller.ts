import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegisterUserUseCase, type RegisterUserInput } from '@meu-projeto/auth';
import { BcryptCryptoProvider } from './bcrypt-crypto.provider.js';
import { UserPrismaRepository } from './user.prisma.repository.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepository: UserPrismaRepository,
    private readonly cryptoProvider: BcryptCryptoProvider,
  ) {}

  @Get()
  getInfo() {
    return {
      module: 'auth',
      message: 'Módulo auth funcionando',
    };
  }

  /** Registra um novo usuário. 201 sem corpo; 422 (validação) ou 409 (e-mail já cadastrado). */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterUserInput): Promise<void> {
    const useCase = new RegisterUserUseCase(this.userRepository, this.cryptoProvider);
    await useCase.execute({ name: body?.name, email: body?.email, password: body?.password });
  }
}
