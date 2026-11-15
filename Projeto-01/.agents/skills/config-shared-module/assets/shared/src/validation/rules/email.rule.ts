import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class EmailRule implements ValidationRule {
  readonly errorCode = 'invalid.email';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, EMAIL_REGEX) ? null : this.errorCode;
  }
}
