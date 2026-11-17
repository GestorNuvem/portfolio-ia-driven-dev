import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { BcryptCryptoProvider } from './bcrypt-crypto.provider.js';
import { UserPrismaRepository } from './user.prisma.repository.js';

@Module({
  controllers: [AuthController],
  providers: [UserPrismaRepository, BcryptCryptoProvider],
})
export class AuthModule {}
