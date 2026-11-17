import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class HasNumberRule implements ValidationRule {
  readonly errorCode = 'has.number';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /\d/) ? null : this.errorCode;
  }
}
