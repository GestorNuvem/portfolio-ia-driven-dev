import { Injectable } from '@nestjs/common';
import type { CryptoProvider } from '@meu-projeto/auth';
import bcrypt from 'bcrypt';

/** Implementação do CryptoProvider (módulo auth) usando a biblioteca bcrypt. */
@Injectable()
export class BcryptCryptoProvider implements CryptoProvider {
  private static readonly SALT_ROUNDS = 10;

  encrypt(password: string): Promise<string> {
    return bcrypt.hash(password, BcryptCryptoProvider.SALT_ROUNDS);
  }

  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
