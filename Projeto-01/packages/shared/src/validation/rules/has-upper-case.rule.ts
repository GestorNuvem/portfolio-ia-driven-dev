import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class HasUpperCaseRule implements ValidationRule {
  readonly errorCode = 'has.upper.case';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /[A-Z]/) ? null : this.errorCode;
  }
}
