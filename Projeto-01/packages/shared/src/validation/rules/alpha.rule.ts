import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class AlphaRule implements ValidationRule {
  readonly errorCode = 'alpha';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^[a-zA-Z]+$/) ? null : this.errorCode;
  }
}
