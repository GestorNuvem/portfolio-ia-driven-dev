import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

/** Celular (9XXXX-XXXX) ou fixo ([2-5]XXX-XXXX), com DDD e +55 opcional. */
const PHONE_BR = /^(?:\+?55\s?)?(?:\([1-9]{2}\)|[1-9]{2})\s?(?:9\d{4}|[2-5]\d{3})[-\s]?\d{4}$/;

export class PhoneBrRule implements ValidationRule {
  readonly errorCode = 'invalid.phone.br';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, PHONE_BR) ? null : this.errorCode;
  }
}
