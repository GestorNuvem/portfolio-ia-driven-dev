import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

/**
 * Hash bcrypt: `$2a$`, `$2b$`, `$2x$` ou `$2y$`, custo de 04 a 31 com dois dígitos,
 * seguido de 53 caracteres do alfabeto bcrypt (22 de salt + 31 de hash).
 * Ex.: `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
 */
const BCRYPT_HASH_REGEX = /^\$2[abxy]\$(0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/;

/** Garante que o valor é uma senha criptografada (hash bcrypt), nunca uma senha em texto puro. */
export class BcryptHashRule implements ValidationRule {
  readonly errorCode = 'bcrypt.hash';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, BCRYPT_HASH_REGEX) ? null : this.errorCode;
  }
}
