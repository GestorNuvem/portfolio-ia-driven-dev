import { CryptoProvider } from '../../src/user/provider/crypto.provider';

const BCRYPT_ALPHABET = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Implementação falsa (e rápida) do CryptoProvider para testes.
 * Gera um hash determinístico no formato bcrypt (`$2b$10$` + 53 caracteres),
 * de modo que a entidade User aceite o valor e `compare` funcione de verdade.
 * NÃO é criptografia segura — use apenas em testes.
 */
export class FakeCryptoProvider implements CryptoProvider {
  async encrypt(password: string): Promise<string> {
    // FNV-1a como semente + xorshift para gerar os 53 caracteres
    let seed = 0x811c9dc5;
    for (let i = 0; i < password.length; i++) {
      seed ^= password.charCodeAt(i);
      seed = Math.imul(seed, 0x01000193) >>> 0;
    }
    let body = '';
    for (let i = 0; i < 53; i++) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      seed >>>= 0;
      body += BCRYPT_ALPHABET[seed % BCRYPT_ALPHABET.length];
    }
    return `$2b$10$${body}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return (await this.encrypt(password)) === hash;
  }
}
