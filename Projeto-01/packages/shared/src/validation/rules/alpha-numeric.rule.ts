import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class AlphaNumericRule implements ValidationRule {
  readonly errorCode = 'alpha.numeric';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^[a-zA-Z0-9]+$/) ? null : this.errorCode;
  }
}
