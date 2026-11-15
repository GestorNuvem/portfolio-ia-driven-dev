import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

/** Padrão E.164: + seguido de 2 a 15 dígitos. */
const E164 = /^\+[1-9]\d{1,14}$/;

export class PhoneRule implements ValidationRule {
  readonly errorCode = 'invalid.phone';

  constructor(private readonly pattern: RegExp = E164) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, this.pattern) ? null : this.errorCode;
  }
}
