import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class HasSpecialCharRule implements ValidationRule {
  readonly errorCode = 'has.special.char';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /[^A-Za-z0-9\s]/) ? null : this.errorCode;
  }
}
