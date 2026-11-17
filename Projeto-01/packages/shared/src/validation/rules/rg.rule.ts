import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class RgRule implements ValidationRule {
  readonly errorCode = 'invalid.rg';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]$/) ? null : this.errorCode;
  }
}
