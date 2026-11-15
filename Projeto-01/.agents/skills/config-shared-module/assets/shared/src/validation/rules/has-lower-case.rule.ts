import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class HasLowerCaseRule implements ValidationRule {
  readonly errorCode = 'has.lower.case';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /[a-z]/) ? null : this.errorCode;
  }
}
